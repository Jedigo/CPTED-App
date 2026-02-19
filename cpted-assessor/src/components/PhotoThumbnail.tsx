import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

interface PhotoThumbnailProps {
  photoId: string;
  onDelete: (photoId: string) => void;
  onClick?: () => void;
}

export default function PhotoThumbnail({ photoId, onDelete, onClick }: PhotoThumbnailProps) {
  const photo = useLiveQuery(() => db.photos.get(photoId), [photoId]);
  const [imgError, setImgError] = useState(false);

  // Support both new format (data: base64 string) and legacy (blob: Blob)
  const src = useMemo(() => {
    if (!photo) return null;
    if (photo.data) return photo.data;
    if (photo.blob) {
      try {
        return URL.createObjectURL(photo.blob);
      } catch {
        return null;
      }
    }
    return null;
  }, [photo]);

  // Still loading from IndexedDB
  if (photo === undefined) {
    return (
      <div className="w-20 h-20 rounded-lg bg-gray-100 border border-ink/10 animate-pulse flex-shrink-0" />
    );
  }

  // Photo record missing or has no image data, or image failed to load
  if (!photo || !src || imgError) {
    return (
      <div className="relative w-20 h-20 flex-shrink-0 group">
        <div className="w-20 h-20 rounded-lg bg-gray-100 border border-red-200 flex flex-col items-center justify-center">
          <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
          <span className="text-[8px] text-red-400 mt-0.5">Missing</span>
        </div>
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

  return (
    <div className="relative w-20 h-20 flex-shrink-0 group">
      <img
        src={src}
        alt="Captured photo"
        className={`w-20 h-20 rounded-lg object-cover border border-ink/10${onClick ? ' cursor-pointer' : ''}`}
        onClick={onClick}
        onError={() => setImgError(true)}
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
