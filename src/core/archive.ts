import * as tar from "tar-stream";
import { createGzip } from "zlib";
import { createWriteStream, createReadStream } from "fs";


import { FileEntry } from "./traversal";


export async function createTarGz(outputPath: string, entries: AsyncIterable<FileEntry>) {
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
rs.pipe(entryStream);
});
}
pack.finalize();
} catch (err) {
reject(err);
}
})();
});
}