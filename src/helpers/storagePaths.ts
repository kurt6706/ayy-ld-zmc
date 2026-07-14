export function generateStoragePath(file: File, prefix = 'uploads'): string {
  const extension = file.name.split('.').pop()?.toLowerCase() || (file.type.startsWith('image/') ? 'jpg' : 'mp4');
  const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
  
  if (file.type.startsWith('image/')) {
    return `${prefix}/images/${safeName}`;
  } else if (file.type.startsWith('video/')) {
    return `${prefix}/videos/${safeName}`;
  }
  return `${prefix}/other/${safeName}`;
}

export function generateThumbnailPath(originalPath: string): string {
  const parts = originalPath.split('/');
  const filename = parts.pop() || '';
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  return `uploads/thumbnails/${nameWithoutExt}_thumb.jpg`;
}
