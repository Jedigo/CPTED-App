import { useRef, useState } from 'react';
import type { ItemScore } from '../types';
import ScoreButtons from './ScoreButtons';
import PhotoThumbnail from './PhotoThumbnail';
import { savePhoto, deletePhoto } from '../services/photos';

interface ChecklistItemProps {
  itemScore: ItemScore;
  onScoreChange: (score: number | null, isNa: boolean) => void;
  onNotesChange: (notes: string) => void;
}

export default function ChecklistItem({
  itemScore,
  onScoreChange,
  onNotesChange,
}: ChecklistItemProps) {
  const [showNote, setShowNote] = useState(!!itemScore.notes);
  const [noteText, setNoteText] = useState(itemScore.notes);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isScored = itemScore.score !== null;
  const isNa = itemScore.is_na;
  const photoCount = itemScore.photo_ids.length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      await savePhoto(file, itemScore.assessment_id, itemScore.id, itemScore.zone_key);
    } catch (err) {
      console.error('Failed to save photo:', err);
    } finally {
      setSaving(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deletePhoto(photoId, itemScore.id);
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        isNa
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : isScored
            ? 'border-l-4 border-l-score-good bg-white border-t border-r border-b border-t-navy/10 border-r-navy/10 border-b-navy/10'
            : 'bg-white border-navy/10'
      }`}
    >
      <p
        className={`text-sm leading-relaxed mb-3 ${isNa ? 'text-navy/50' : 'text-navy'}`}
      >
        {itemScore.item_text}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <ScoreButtons
          score={itemScore.score}
          isNa={itemScore.is_na}
          onSelect={onScoreChange}
        />

        <button
          type="button"
          onClick={() => setShowNote(!showNote)}
          className={`px-3 h-11 rounded-lg text-sm font-medium border-2 transition-colors ${
            itemScore.notes
              ? 'bg-blue-medium text-white border-blue-medium'
              : 'bg-white border-navy/20 text-navy/50 hover:border-navy/40'
          }`}
        >
          Note
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={saving}
          className={`px-3 h-11 rounded-lg text-sm font-medium border-2 transition-colors ${
            photoCount > 0
              ? 'bg-blue-medium text-white border-blue-medium'
              : 'bg-white border-navy/20 text-navy/50 hover:border-navy/40'
          } ${saving ? 'opacity-50 cursor-wait' : ''}`}
        >
          {saving ? 'Saving...' : photoCount > 0 ? `Photo (${photoCount})` : 'Photo'}
        </button>
      </div>

      {photoCount > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {itemScore.photo_ids.map((id) => (
            <PhotoThumbnail key={id} photoId={id} onDelete={handleDeletePhoto} />
          ))}
        </div>
      )}

      {showNote && (
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onBlur={() => onNotesChange(noteText)}
          placeholder="Add a note..."
          rows={2}
          className="mt-3 w-full rounded-lg border border-navy/20 px-3 py-2 text-sm bg-white outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30 resize-y"
        />
      )}
    </div>
  );
}
