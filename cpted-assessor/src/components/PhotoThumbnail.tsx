import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

interface PhotoThumbnailProps {
  photoId: string;
  onDelete: (photoId: string) => void;
  onClick?: () => void;
}

export default function PhotoThumbnail({ photoId, onDelete, onClick }: PhotoThumbnailProps) {
  const photo = useLiveQuery(() => db.photos.get(photoId), [photoId]);

  // Support both new format (data: base64 string) and legacy (blob: Blob)
  const src = useMemo(() => {
    if (!photo) return null;
    if (photo.data) return photo.data;
    if (photo.blob) return URL.createObjectURL(photo.blob);
    return null;
  }, [photo]);

  if (!photo || !src) {
    return (
      <div className="w-20 h-20 rounded-lg bg-gray-100 border border-navy/10 animate-pulse flex-shrink-0" />
    );
  }

  return (
    <div className="relative w-20 h-20 flex-shrink-0 group">
      <img
        src={src}
        alt="Captured photo"
        className={`w-20 h-20 rounded-lg object-cover border border-navy/10${onClick ? ' cursor-pointer' : ''}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        aria-label={onClick ? 'View photo' : undefined}
      />
      <button
        type="button"
        onClick={() => onDelete(photoId)}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity"
        aria-label="Delete photo"
      >
        &times;
      </button>
    </div>
  );
}
