import { useEffect, useState, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import ConfirmDialog from './ConfirmDialog';

interface PhotoViewerProps {
  photoIds: string[];
  initialIndex: number;
  onClose: () => void;
  onDelete: (photoId: string) => void;
}

export default function PhotoViewer({
  photoIds,
  initialIndex,
  onClose,
  onDelete,
}: PhotoViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const currentId = photoIds[index];
  const photo = useLiveQuery(() => db.photos.get(currentId), [currentId]);

  // Support both new format (data: base64) and legacy (blob: Blob)
  const imageSrc = photo?.data || (photo?.blob ? URL.createObjectURL(photo.blob) : null);

  // Close if all photos deleted
  useEffect(() => {
    if (photoIds.length === 0) onClose();
  }, [photoIds.length, onClose]);

  // Clamp index when photos are removed
  useEffect(() => {
    if (index >= photoIds.length && photoIds.length > 0) {
      setIndex(photoIds.length - 1);
    }
  }, [photoIds.length, index]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => (i < photoIds.length - 1 ? i + 1 : i));
  }, [photoIds.length]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (confirmDelete) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goPrev, goNext, confirmDelete]);

  // Touch swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Only swipe if horizontal movement exceeds threshold and is more horizontal than vertical
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }

  function handleDelete() {
    setConfirmDelete(false);
    onDelete(currentId);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div />
        <button
          type="button"
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
          aria-label="Close photo viewer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Photo area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden min-h-0">
        {/* Left arrow */}
        {photoIds.length > 1 && index > 0 && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 sm:left-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
            aria-label="Previous photo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`Photo ${index + 1} of ${photoIds.length}`}
            className="max-w-full max-h-full object-contain px-12"
          />
        ) : (
          <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        )}

        {/* Right arrow */}
        {photoIds.length > 1 && index < photoIds.length - 1 && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 sm:right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
            aria-label="Next photo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-center gap-6 px-4 py-4 flex-shrink-0">
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium active:scale-95 transition-all"
          aria-label="Delete photo"
        >
          Delete
        </button>
        {photoIds.length > 1 && (
          <span className="text-white/60 text-sm">
            {index + 1} / {photoIds.length}
          </span>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
