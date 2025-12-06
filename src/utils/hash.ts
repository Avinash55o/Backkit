import { createHash } from "crypto";
import { createReadStream } from "fs";


export function hashFileStream(filePath: string): Promise<string> {
return new Promise((resolve, reject) => {
const hash = createHash("sha256");
const rs = createReadStream(filePath);
rs.on("error", reject);
rs.on("data", (c) => hash.update(c));
rs.on("end", () => resolve(hash.digest("hex")));
});
}