export interface MediaItem {
  id: string;
  ownerId: string;
  downloadURL: string;
  thumbnailURL?: string;
  filename: string;
  originalFilename: string;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  status: 'processing' | 'ready' | 'error';
  category?: string;
  description?: string;
}

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  state: 'pending' | 'running' | 'paused' | 'success' | 'error' | 'canceled';
  error?: string;
  downloadUrl?: string;
}
