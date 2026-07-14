export async function compressVideo(file: File): Promise<Blob> {
  // Client-side video compression without WASM is highly unreliable.
  // We will return the original file for uploading.
  // In a full production environment, server-side transcoding (e.g. Cloud Functions + FFmpeg)
  // or a heavy client-side WASM library would be used.
  return Promise.resolve(file);
}
