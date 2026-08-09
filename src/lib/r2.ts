import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const accountId = process.env.R2_ACCOUNT_ID!;
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
const bucket = process.env.R2_BUCKET ?? "laser-estate-media";
const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";

export const R2_BUCKET = bucket;
export const R2_PUBLIC_BASE = publicBase;

/** Lazy client so builds without env vars don't crash. */
export function r2Client() {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 env vars missing (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/** Build the public URL for a stored key. */
export function publicUrlFor(key: string) {
  return `${publicBase}/${key}`;
}

/** Generate a unique storage key preserving the file extension. */
export function makeObjectKey(filename: string, folder = "properties") {
  const ext = filename.includes(".") ? filename.split(".").pop()!.toLowerCase() : "bin";
  const safe = ext.replace(/[^a-z0-9]/g, "").slice(0, 6) || "bin";
  return `${folder}/${randomUUID()}.${safe}`;
}

/** Return a presigned URL the client can PUT to directly. */
export async function presignPutUrl(key: string, contentType: string, expiresIn = 300) {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client(), cmd, { expiresIn });
}

export async function deleteObject(key: string) {
  return r2Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/** Extract the storage key from a public URL. Returns null if it doesn't belong to us. */
export function keyFromUrl(url: string): string | null {
  if (!publicBase || !url.startsWith(publicBase)) return null;
  return url.slice(publicBase.length + 1);
}
