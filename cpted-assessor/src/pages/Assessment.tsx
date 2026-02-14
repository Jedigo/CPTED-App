import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { ZONES } from '../data/zones';
import type { ItemScore } from '../types';
import { persistZoneScore, persistOverallScore, persistAllScores } from '../services/scoring';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import ZoneSidebar from '../components/ZoneSidebar';
import ZoneView from '../components/ZoneView';
import HeaderBackButton from '../components/HeaderBackButton';

export default function Assessment() {
  const { id } = useParams<{ id: string }>();
  const online = useOnlineStatus();
  const [activeZoneKey, setActiveZoneKey] = useState(ZONES[0].key);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleSelectZone = useCallback((zoneKey: string) => {
    setActiveZoneKey(zoneKey);
    setSidebarOpen(false);
  }, []);

  // Loading state
  if (itemScores === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-pale gap-3">
        <div className="loading-spinner" />
        <p className="text-navy/50 text-sm">Loading assessment...</p>
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
      <header className="bg-navy text-white px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Sidebar toggle (portrait only) */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden px-2.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white active:scale-95 transition-all"
            aria-label="Toggle zone sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <HeaderBackButton to="/" label="Home" className="hidden sm:inline-flex flex-shrink-0" />
          <h1 className="text-base sm:text-lg font-bold truncate">
            {assessment.address}
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Online/Offline dot */}
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${online ? 'bg-green-400' : 'bg-red-400'}`}
            aria-label={online ? 'Online' : 'Offline'}
          />
          <span className="text-white/50 text-sm hidden sm:inline">
            Zone {activeZoneIndex + 1}/{ZONES.length}
          </span>
          <Link
            to={`/assessment/${id}/summary`}
            className="px-4 py-2 bg-blue-medium hover:bg-blue-medium/80 active:scale-95 rounded-lg text-sm font-medium transition-all"
          >
            Summary
          </Link>
        </div>
      </header>

      {/* Body: sidebar + main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 top-[52px] bg-black/30 z-20"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar: always visible on landscape/desktop, overlay on portrait */}
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static top-[52px] bottom-0 left-0 z-30 transition-transform duration-200 ease-in-out`}
        >
          <ZoneSidebar
            activeZoneKey={activeZoneKey}
            itemScoresByZone={itemScoresByZone}
            onSelectZone={handleSelectZone}
          />
        </div>

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
              className="px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 bg-white border border-navy/20 text-navy hover:bg-blue-pale disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &larr; Previous Zone
            </button>
            {activeZoneIndex === ZONES.length - 1 ? (
              <Link
                to={`/assessment/${id}/summary`}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 bg-green-600 text-white hover:bg-green-700"
              >
                Go to Summary &rarr;
              </Link>
            ) : (
              <button
                type="button"
                onClick={goToNextZone}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 bg-navy text-white hover:bg-navy-light"
              >
                Next Zone &rarr;
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
