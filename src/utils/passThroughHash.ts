import { createHash } from "crypto";
import { PassThrough } from "stream";


export function createHashingPassThrough() {
const hash = createHash("sha256");
const pt = new PassThrough();
pt.on("data", (chunk) => hash.update(chunk));
return {
pass: pt,
digest: () => hash.digest("hex")
};
}