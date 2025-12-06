import * as path from "path";
import { promises as fs } from "fs";
import { Metadata } from "../core/types";


const META_FILE = ".goback-meta.json";


export async function readMetadata(dest: string): Promise<Metadata | null> {
try {
const p = path.join(dest, META_FILE);
const raw = await fs.readFile(p, "utf8");
return JSON.parse(raw) as Metadata;
} catch {
return null;
}
}


export async function writeMetadata(dest: string, meta: Metadata): Promise<void> {
const p = path.join(dest, META_FILE);
await fs.mkdir(path.dirname(p), { recursive: true });
await fs.writeFile(p, JSON.stringify(meta, null, 2), "utf8");
}