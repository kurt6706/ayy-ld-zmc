export async function generateVideoThumbnail(file: File | Blob, seekTimeSeconds = 1.0): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(seekTimeSeconds, video.duration / 2);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(videoUrl);
          reject(new Error('Canvas 2D context could not be created.'));
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(videoUrl);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to export thumbnail canvas to Blob.'));
            }
          },
          'image/jpeg',
          0.8
        );
      } catch (err) {
        URL.revokeObjectURL(videoUrl);
        reject(err);
      }
    };

    video.onerror = (err) => {
      URL.revokeObjectURL(videoUrl);
      reject(err);
    };
  });
}
