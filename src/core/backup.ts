import * as path from "path";
import { promises as fs } from "fs";
import { BackupOptions, Metadata, FileMeta } from "./types";
import { walkDir, FileEntry } from "./traversal";
import { readMetadata, writeMetadata } from "../storage/metadataStore";
import { quickChanged } from "./incremental";
import { createHashingPassThrough } from "../utils/passThroughHash";
import * as tar from "tar-stream";
import { createGzip } from "zlib";
import { createWriteStream, createReadStream } from "fs";

type FileEntryWithHash = FileEntry & {
  pass: import("stream").PassThrough;
  digest: () => string;
};

async function createTarGzWithHash(
  outputPath: string,
  entries: AsyncIterable<FileEntryWithHash>,
  newMeta: Metadata
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const pack = tar.pack();
    const gzip = createGzip();
    const out = createWriteStream(outputPath);

    pack.on("error", reject);
    gzip.on("error", reject);
    out.on("error", reject);
    out.on("close", () => resolve());

    pack.pipe(gzip).pipe(out);

    (async () => {
      try {
        for await (const e of entries) {
          const header = {
            name: e.relPath.replace(/\\/g, "/"),
            size: e.stat.size,
            mode: e.stat.mode,
            mtime: e.stat.mtime
          } as any;

          await new Promise<void>((res, rej) => {
            const rs = createReadStream(e.absPath);
            const entryStream = pack.entry(header, (err) => (err ? rej(err) : res()));
            
            rs.on("error", rej);
            e.pass.on("error", rej);
            
            rs.pipe(e.pass).pipe(entryStream);
            
            entryStream.on("finish", () => {
              try {
                const sha = e.digest();
                newMeta.files[e.relPath] = {
                  path: e.relPath,
                  size: e.stat.size,
                  mtimeMs: e.stat.mtimeMs,
                  sha256: sha,
                  mode: e.stat.mode
                };
                res();
              } catch (err) {
                rej(err);
              }
            });
          });
        }
        pack.finalize();
      } catch (err) {
        reject(err);
      }
    })();
  });
}

async function cleanupOldBackups(dest: string, retentionDays: number): Promise<void> {
  try {
    const files = await fs.readdir(dest);
    const now = Date.now();
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (file.endsWith(".tar.gz") && !file.includes(".goback-meta.json")) {
        const filePath = path.join(dest, file);
        const stat = await fs.stat(filePath);
        if (now - stat.mtimeMs > retentionMs) {
          await fs.unlink(filePath);
          console.log(`Deleted old backup: ${file}`);
        }
      }
    }
  } catch (err) {
    console.warn("Cleanup warning:", err);
  }
}

export async function runBackup(options: BackupOptions): Promise<void> {
  const { source, destination, incremental = false, retentionDays = 30 } = options;

  // Ensure destination exists
  await fs.mkdir(destination, { recursive: true });

  // Read previous metadata if incremental
  let oldMeta: Metadata | null = null;
  if (incremental) {
    oldMeta = await readMetadata(destination);
  }

  // Create new metadata
  const newMeta: Metadata = {
    createdAt: new Date().toISOString(),
    files: {},
    version: oldMeta ? (oldMeta.version || 0) + 1 : 1
  };

  // Generate timestamp for backup file
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `backup-${timestamp}.tar.gz`;
  const backupPath = path.join(destination, backupFileName);

  // Collect files to backup
  const filesToBackup: FileEntryWithHash[] = [];

  for await (const entry of walkDir(source)) {
    const relPath = entry.relPath;
    const oldFileMeta = oldMeta?.files[relPath];

    // Skip if unchanged in incremental mode
    if (incremental && oldFileMeta && !quickChanged(oldFileMeta, entry.stat)) {
      // Use old metadata
      newMeta.files[relPath] = oldFileMeta;
      continue;
    }

    // Create hashing pass-through for this file
    const { pass, digest } = createHashingPassThrough();
    filesToBackup.push({
      ...entry,
      pass,
      digest
    });
  }

  // Create backup archive
  console.log(`Creating backup: ${backupFileName}`);
  await createTarGzWithHash(backupPath, (async function* () {
    for (const entry of filesToBackup) {
      yield entry;
    }
  })(), newMeta);

  // Write metadata
  await writeMetadata(destination, newMeta);

  // Cleanup old backups
  if (retentionDays > 0) {
    await cleanupOldBackups(destination, retentionDays);
  }

  console.log(`Backup completed: ${backupFileName}`);
  console.log(`Files backed up: ${Object.keys(newMeta.files).length}`);
}