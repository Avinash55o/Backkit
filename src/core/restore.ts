import { createReadStream, createWriteStream } from "fs";
import * as zlib from "zlib";
import * as tar from "tar-stream";
import * as path from "path";
import { pipeline } from "stream/promises";
import { promises as fsPromises } from "fs";

export async function extractTarGz(archivePath: string, outDir: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const extract = tar.extract();
    
    extract.on("entry", async (header: any, stream: any, next: any) => {
      const outPath = path.join(outDir, header.name);
      
      // Ensure directory exists
      await fsPromises.mkdir(path.dirname(outPath), { recursive: true });
      
      // Write file
      try {
        await pipeline(stream, createWriteStream(outPath));
        
        // Restore permissions and timestamps
        if (header.mode) {
          await fsPromises.chmod(outPath, header.mode);
        }
        if (header.mtime) {
          await fsPromises.utimes(outPath, header.mtime, header.mtime);
        }
      } catch (err) {
        return next(err);
      }
      next();
    });
    
    extract.on("finish", resolve);
    extract.on("error", reject);
    
    // Pipeline: file -> gunzip -> extract
    pipeline(createReadStream(archivePath), zlib.createGunzip(), extract)
      .catch(reject);
  });
}