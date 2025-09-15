import {randomBytes, createHash, randomUUID} from "crypto";

export function randomToken(bytes = 48) {
  return randomBytes(bytes).toString("hex"); // 96 hex chars
}

export function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export function newId() {
  return randomUUID();
}
