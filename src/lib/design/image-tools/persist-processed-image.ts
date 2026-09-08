import { uploadImage } from "@/lib/cases/api";

export async function persistProcessedImage(
  blob: Blob,
  filename = "edited.png",
): Promise<string> {
  const file = new File([blob], filename, {
    type: blob.type || "image/png",
  });
  return uploadImage(file);
}
