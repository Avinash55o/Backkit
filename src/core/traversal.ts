import { promises as fs } from "fs";
import * as path from "path";

export type FileEntry = { relPath: string; absPath: string; stat: import("fs").Stats };

export async function* walkDir(root: string): AsyncGenerator<FileEntry> {
  const stack: string[] = [root];

  while (stack.length) {
    const current = stack.pop()!;
    const dirents = await fs.readdir(current, { withFileTypes: true });
    for (const de of dirents) {
      const abs = path.join(current, de.name);
      if (de.isDirectory()) {
        stack.push(abs);
      } else if (de.isFile()) {
        const stat = await fs.stat(abs);
        yield { relPath: path.relative(root, abs), absPath: abs, stat };
      } else {
        // Skip symlinks/devices by default
      }
    }
  }
}
