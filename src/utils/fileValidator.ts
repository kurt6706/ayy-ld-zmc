export const IMAGE_MAX_SIZE = 20 * 1024 * 1024; // 20 MB
export const VIDEO_MAX_SIZE = 500 * 1024 * 1024; // 500 MB

export const SUPPORTED_IMAGES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'];
export const SUPPORTED_VIDEOS = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.type.startsWith('image/')) {
    if (!SUPPORTED_IMAGES.includes(file.type)) {
      return { valid: false, error: `Desteklenmeyen görsel formatı: ${file.type}` };
    }
    if (file.size > IMAGE_MAX_SIZE) {
      return { valid: false, error: `Görsel boyutu ${IMAGE_MAX_SIZE / (1024 * 1024)}MB'dan küçük olmalıdır.` };
    }
  } else if (file.type.startsWith('video/')) {
    if (!SUPPORTED_VIDEOS.includes(file.type)) {
      return { valid: false, error: `Desteklenmeyen video formatı: ${file.type}` };
    }
    if (file.size > VIDEO_MAX_SIZE) {
      return { valid: false, error: `Video boyutu ${VIDEO_MAX_SIZE / (1024 * 1024)}MB'dan küçük olmalıdır.` };
    }
  } else {
    return { valid: false, error: 'Sadece görsel ve video dosyaları desteklenmektedir.' };
  }
  return { valid: true };
}
