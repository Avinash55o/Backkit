import { FileMeta } from "./types";
import { Stats } from "fs";
import { hashFileStream } from "../utils/hash";


export function quickChanged(oldMeta: FileMeta | undefined, stat: Stats | undefined): boolean {
if (!oldMeta) return true;
if (!stat) return true;
return oldMeta.size !== stat.size || oldMeta.mtimeMs !== stat.mtimeMs;
}


export async function computeFileMeta(relPath: string, absPath: string, stat: Stats): Promise<FileMeta> {
const sha = await hashFileStream(absPath);
return {
path: relPath,
size: stat.size,
mtimeMs: stat.mtimeMs,
sha256: sha,
mode: stat.mode
};
}