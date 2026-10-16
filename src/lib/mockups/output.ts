import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";

import sharp from "sharp";

import { MockupError } from "./errors";

function wait(ms: number): void {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    // Short pause so Windows can release a file handle before a rename.
  }
}

function moveFile(from: string, to: string): void {
  let last: unknown;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      renameSync(from, to);
      return;
    } catch (error) {
      last = error;
      try {
        copyFileSync(from, to);
        unlinkSync(from);
        return;
      } catch (copyError) {
        last = copyError;
        wait(30 * (attempt + 1));
      }
    }
  }
  throw last;
}

export async function assertValidWebp(filePath: string): Promise<{ width: number; height: number }> {
  try {
    const bytes = readFileSync(filePath);
    const meta = await sharp(bytes).metadata();
    if (meta.format !== "webp" || !meta.width || !meta.height) {
      throw new MockupError("invalidOutput");
    }
    return { width: meta.width, height: meta.height };
  } catch (error) {
    if (error instanceof MockupError) throw error;
    throw new MockupError("invalidOutput");
  }
}

/** Replaces `finalPath` only after `tempPath` is a valid WebP. The previous file is restored if the swap fails. */
export async function publishValidatedWebp(tempPath: string, finalPath: string): Promise<{ width: number; height: number }> {
  const size = await assertValidWebp(tempPath);
  mkdirSync(dirname(finalPath), { recursive: true });
  const backup = `${finalPath}.previous`;
  const hadFinal = existsSync(finalPath);
  if (hadFinal) moveFile(finalPath, backup);
  try {
    moveFile(tempPath, finalPath);
  } catch (error) {
    if (hadFinal && existsSync(backup) && !existsSync(finalPath)) {
      moveFile(backup, finalPath);
    }
    throw error;
  }
  if (existsSync(backup)) {
    try {
      unlinkSync(backup);
    } catch {
      // The new file is already in place.
    }
  }
  return size;
}
