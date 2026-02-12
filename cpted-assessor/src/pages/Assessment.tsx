import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { ZONES } from '../data/zones';
import type { ItemScore } from '../types';
import { persistZoneScore, persistOverallScore, persistAllScores } from '../services/scoring';
import ZoneSidebar from '../components/ZoneSidebar';
import ZoneView from '../components/ZoneView';

export default function Assessment() {
  const { id } = useParams<{ id: string }>();
  const [activeZoneKey, setActiveZoneKey] = useState(ZONES[0].key);
  const mainRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const assessment = useLiveQuery(
    () => (id ? db.assessments.get(id) : undefined),
    [id],
  );

  const itemScores = useLiveQuery(
    () =>
      id ? db.item_scores.where('assessment_id').equals(id).toArray() : [],
    [id],
  );

  // Initialize item scores on first load (141 records)
  useEffect(() => {
    if (!id || itemScores === undefined || initRef.current) return;
    if (itemScores.length === 0) {
      initRef.current = true;
      const records: ItemScore[] = [];
      for (const zone of ZONES) {
        let itemOrder = 0;
        for (const principle of zone.principles) {
          for (const itemText of principle.items) {
            records.push({
              id: uuidv4(),
              assessment_id: id,
              zone_key: zone.key,
              principle: principle.key,
              item_text: itemText,
              item_order: itemOrder++,
              score: null,
              is_na: false,
              notes: '',
              photo_ids: [],
            });
          }
        }
      }
      db.item_scores.bulkAdd(records);
    }
  }, [id, itemScores]);

  // Persist all scores on mount (migration safeguard)
  useEffect(() => {
    if (id) {
      persistAllScores(id);
    }
  }, [id]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, []);

  // Scroll main content to top when switching zones
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [activeZoneKey]);

  // Group item scores by zone key
  const itemScoresByZone = useMemo(() => {
    const map = new Map<string, ItemScore[]>();
    if (!itemScores) return map;
    for (const score of itemScores) {
      const list = map.get(score.zone_key);
      if (list) {
        list.push(score);
      } else {
        map.set(score.zone_key, [score]);
      }
    }
    return map;
  }, [itemScores]);

  const activeZone = ZONES.find((z) => z.key === activeZoneKey)!;
  const activeZoneIndex = ZONES.findIndex((z) => z.key === activeZoneKey);
  const activeItemScores = itemScoresByZone.get(activeZoneKey) || [];

  const handleScoreChange = useCallback(
    async (itemId: string, score: number | null, isNa: boolean) => {
      await db.item_scores.update(itemId, {
        score: isNa ? null : score,
        is_na: isNa,
      });

      // Debounced persistence of zone + overall scores
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
      persistTimerRef.current = setTimeout(async () => {
        if (!id) return;
        const allItems = await db.item_scores
          .where('assessment_id')
          .equals(id)
          .toArray();
        const zoneItems = allItems.filter((s) => s.zone_key === activeZoneKey);
        await persistZoneScore(id, activeZoneKey, zoneItems);
        await persistOverallScore(id);
      }, 500);
    },
    [id, activeZoneKey],
  );

  const handleNotesChange = useCallback(
    async (itemId: string, notes: string) => {
      await db.item_scores.update(itemId, { notes });
    },
    [],
  );

  function goToPrevZone() {
    if (activeZoneIndex > 0) {
      setActiveZoneKey(ZONES[activeZoneIndex - 1].key);
    }
  }

  function goToNextZone() {
    if (activeZoneIndex < ZONES.length - 1) {
      setActiveZoneKey(ZONES[activeZoneIndex + 1].key);
    }
  }

  // Loading state
  if (itemScores === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-pale">
        <p className="text-navy/50 text-lg">Loading assessment...</p>
      </div>
    );
  }

  // Assessment not found
  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-pale gap-4">
        <p className="text-navy/50 text-lg">Assessment not found</p>
        <Link
          to="/"
          className="text-blue-medium hover:underline font-medium"
        >
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-blue-pale">
      {/* Header */}
      <header className="bg-navy text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/"
            className="text-white/70 hover:text-white text-sm font-medium flex-shrink-0"
          >
            &larr; Back
          </Link>
          <h1 className="text-lg font-bold truncate">
            {assessment.address}, {assessment.city}
          </h1>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-white/50 text-sm">
            Zone {activeZoneIndex + 1} of {ZONES.length}
          </span>
          <Link
            to={`/assessment/${id}/summary`}
            className="px-4 py-2 bg-blue-medium hover:bg-blue-medium/80 rounded-lg text-sm font-medium transition-colors"
          >
            Summary
          </Link>
        </div>
      </header>

      {/* Body: sidebar + main content */}
      <div className="flex flex-1 overflow-hidden">
        <ZoneSidebar
          activeZoneKey={activeZoneKey}
          itemScoresByZone={itemScoresByZone}
          onSelectZone={setActiveZoneKey}
        />

        <main ref={mainRef} className="flex-1 overflow-y-auto p-6">
          <ZoneView
            zone={activeZone}
            itemScores={activeItemScores}
            onScoreChange={handleScoreChange}
            onNotesChange={handleNotesChange}
          />

          {/* Zone navigation */}
          <div className="flex justify-between items-center mt-8 pb-6">
            <button
              type="button"
              onClick={goToPrevZone}
              disabled={activeZoneIndex === 0}
              className="px-6 py-3 rounded-xl font-semibold text-sm transition-colors bg-white border border-navy/20 text-navy hover:bg-blue-pale disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &larr; Previous Zone
            </button>
            <button
              type="button"
              onClick={goToNextZone}
              disabled={activeZoneIndex === ZONES.length - 1}
              className="px-6 py-3 rounded-xl font-semibold text-sm transition-colors bg-navy text-white hover:bg-navy-light disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next Zone &rarr;
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
