import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { getZonesForType, isCommercialType } from '../data/zone-registry';
import { getItemPhase, isNightItem, type Phase } from '../data/item-phases';
import type { ItemScore } from '../types';

type PhaseFilter = 'all' | Phase | 'night';
const PHASE_STORAGE_KEY = 'cpted-phase-filter';

function loadPhaseFilter(): PhaseFilter {
  if (typeof window === 'undefined') return 'all';
  const stored = window.localStorage.getItem(PHASE_STORAGE_KEY);
  if (
    stored === 'exterior' ||
    stored === 'interior' ||
    stored === 'all' ||
    stored === 'night'
  )
    return stored;
  return 'all';
}
import { persistZoneScore, persistOverallScore, persistAllScores } from '../services/scoring';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import ZoneSidebar, { type GroupedSection } from '../components/ZoneSidebar';
import ZoneView from '../components/ZoneView';
import NightView from '../components/NightView';
import HeaderBackButton from '../components/HeaderBackButton';
import ScoreReference from '../components/ScoreReference';
import EditAssessmentInfo from '../components/EditAssessmentInfo';
import ThemeToggle from '../components/ThemeToggle';

export default function Assessment() {
  const { id } = useParams<{ id: string }>();
  const online = useOnlineStatus();
  const [activeZoneKey, setActiveZoneKey] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scoreRefOpen, setScoreRefOpen] = useState(false);
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>(loadPhaseFilter);

  const handlePhaseChange = useCallback((next: PhaseFilter) => {
    setPhaseFilter(next);
    try {
      window.localStorage.setItem(PHASE_STORAGE_KEY, next);
    } catch { /* ignore */ }
  }, []);
  const mainRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const assessment = useLiveQuery(
    () => (id ? db.assessments.get(id) : undefined),
    [id],
  );

  // Derive zones from assessment property type (only when assessment is loaded)
  const zones = useMemo(
    () => assessment ? getZonesForType(assessment.property_type) : [],
    [assessment?.property_type],
  );

  // Set active zone when zones are available, or reset if current key is invalid
  useEffect(() => {
    if (zones.length === 0) return;
    if (activeZoneKey === null || !zones.some((z) => z.key === activeZoneKey)) {
      setActiveZoneKey(zones[0].key);
    }
  }, [zones, activeZoneKey]);

  // Commercial uses the grouped sidebar where 'all' isn't a section — default
  // to 'exterior' on entry so the sidebar always reflects the active view.
  useEffect(() => {
    if (!assessment) return;
    if (isCommercialType(assessment.property_type) && phaseFilter === 'all') {
      handlePhaseChange('exterior');
    }
  }, [assessment, phaseFilter, handlePhaseChange]);

  const itemScores = useLiveQuery(
    () =>
      id ? db.item_scores.where('assessment_id').equals(id).toArray() : [],
    [id],
  );

  // Initialize item scores on first load
  useEffect(() => {
    if (!id || !assessment || itemScores === undefined || initRef.current) return;
    if (itemScores.length === 0) {
      initRef.current = true;
      const records: ItemScore[] = [];
      for (const zone of zones) {
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
  }, [id, assessment, itemScores, zones]);

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

  // Filter item scores by active phase
  const phaseFilteredScores = useMemo(() => {
    if (!itemScores) return [];
    if (phaseFilter === 'all') return itemScores;
    if (phaseFilter === 'night') return itemScores.filter(isNightItem);
    return itemScores.filter((s) => getItemPhase(s.item_text) === phaseFilter);
  }, [itemScores, phaseFilter]);

  // Group filtered item scores by zone key (drives ZoneView + ZoneSidebar dots)
  const itemScoresByZone = useMemo(() => {
    const map = new Map<string, ItemScore[]>();
    for (const score of phaseFilteredScores) {
      const list = map.get(score.zone_key);
      if (list) {
        list.push(score);
      } else {
        map.set(score.zone_key, [score]);
      }
    }
    return map;
  }, [phaseFilteredScores]);

  const activeZone = zones.find((z) => z.key === activeZoneKey);
  const activeZoneIndex = zones.findIndex((z) => z.key === activeZoneKey);
  const activeItemScores = activeZoneKey ? (itemScoresByZone.get(activeZoneKey) || []) : [];

  const handleScoreChange = useCallback(
    async (itemId: string, score: number | null, isNa: boolean) => {
      await db.item_scores.update(itemId, {
        score: isNa ? null : score,
        is_na: isNa,
      });

      // Debounced persistence of zone + overall scores. Look up the item's
      // own zone_key rather than relying on activeZoneKey — in Night mode
      // the user scores items from many zones without leaving the tab.
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
      persistTimerRef.current = setTimeout(async () => {
        if (!id) return;
        const updated = await db.item_scores.get(itemId);
        if (!updated) return;
        const targetZone = updated.zone_key;
        const allItems = await db.item_scores
          .where('assessment_id')
          .equals(id)
          .toArray();
        const zoneItems = allItems.filter((s) => s.zone_key === targetZone);
        await persistZoneScore(id, targetZone, zoneItems);
        await persistOverallScore(id);
      }, 500);
    },
    [id],
  );

  const handleNotesChange = useCallback(
    async (itemId: string, notes: string) => {
      await db.item_scores.update(itemId, { notes });
    },
    [],
  );

  function goToPrevZone() {
    if (activeZoneIndex > 0) {
      setActiveZoneKey(zones[activeZoneIndex - 1].key);
    }
  }

  function goToNextZone() {
    if (activeZoneIndex < zones.length - 1) {
      setActiveZoneKey(zones[activeZoneIndex + 1].key);
    }
  }

  const handleSelectZone = useCallback(
    (zoneKey: string) => {
      setActiveZoneKey(zoneKey);
      setSidebarOpen(false);
      // Clicking a zone exits Night mode back to the last per-zone filter.
      if (phaseFilter === 'night') {
        handlePhaseChange('all');
      }
    },
    [phaseFilter, handlePhaseChange],
  );

  const handleSelectNight = useCallback(() => {
    handlePhaseChange('night');
    setSidebarOpen(false);
  }, [handlePhaseChange]);

  // Night items live across all zones — compute the flat list for the sidebar
  // tab so we can show item count + completion dot without re-filtering on render.
  const nightItems = useMemo(() => {
    if (!itemScores) return [];
    return itemScores.filter(isNightItem);
  }, [itemScores]);

  // Commercial office uses a grouped sidebar (EXTERIOR / INTERIOR section
  // headers) instead of the flat zone list. Zones appear under whichever
  // section(s) contain their items — Z6 Loading/Mail appears in both because
  // it spans dock-exterior items and mailroom-interior items.
  const commercialSections: GroupedSection[] | undefined = useMemo(() => {
    if (!assessment || !itemScores) return undefined;
    if (!isCommercialType(assessment.property_type)) return undefined;

    const groupForPhase = (phase: 'exterior' | 'interior'): GroupedSection => {
      const entries = zones
        .map((zone) => {
          const items = itemScores.filter(
            (s) => s.zone_key === zone.key && getItemPhase(s.item_text) === phase,
          );
          return { zone, items };
        })
        .filter(({ items }) => items.length > 0);
      return {
        label: phase === 'exterior' ? 'EXTERIOR' : 'INTERIOR',
        phase,
        entries,
      };
    };

    return [groupForPhase('exterior'), groupForPhase('interior')];
  }, [assessment, itemScores, zones]);

  const handleSelectZoneInPhase = useCallback(
    (zoneKey: string, phase: Phase) => {
      setActiveZoneKey(zoneKey);
      setSidebarOpen(false);
      handlePhaseChange(phase);
    },
    [handlePhaseChange],
  );

  // Section-aware navigation for commercial grouped mode: Previous/Next move
  // within the current section's zone list; at section boundaries the buttons
  // either cross into the other section or terminate at Summary.
  const sectionNav = useMemo(() => {
    if (!commercialSections || phaseFilter === 'night' || phaseFilter === 'all') {
      return null;
    }
    const currentSection = commercialSections.find((s) => s.phase === phaseFilter);
    const otherSection = commercialSections.find((s) => s.phase !== phaseFilter);
    if (!currentSection || currentSection.entries.length === 0) return null;
    const idx = currentSection.entries.findIndex(
      (e) => e.zone.key === activeZoneKey,
    );
    if (idx === -1) return null;
    return { currentSection, otherSection, idx };
  }, [commercialSections, phaseFilter, activeZoneKey]);

  function goToPrevInSection() {
    if (!sectionNav) return;
    const { currentSection, otherSection, idx } = sectionNav;
    if (idx > 0) {
      setActiveZoneKey(currentSection.entries[idx - 1].zone.key);
    } else if (otherSection && otherSection.entries.length > 0) {
      // Crossing back into the previous section: land on its last zone.
      const lastOther = otherSection.entries[otherSection.entries.length - 1].zone.key;
      setActiveZoneKey(lastOther);
      handlePhaseChange(otherSection.phase);
    }
  }

  function goToNextInSection() {
    if (!sectionNav) return;
    const { currentSection, otherSection, idx } = sectionNav;
    if (idx < currentSection.entries.length - 1) {
      setActiveZoneKey(currentSection.entries[idx + 1].zone.key);
    } else if (otherSection && otherSection.entries.length > 0) {
      // End of this section → first zone of the next section.
      setActiveZoneKey(otherSection.entries[0].zone.key);
      handlePhaseChange(otherSection.phase);
    }
  }

  // Loading state
  if (itemScores === undefined || activeZoneKey === null || !activeZone) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-pale gap-3">
        <div className="loading-spinner" />
        <p className="text-ink/50 text-sm">Loading assessment...</p>
      </div>
    );
  }

  // Assessment not found
  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-pale gap-4">
        <p className="text-ink/50 text-lg">Assessment not found</p>
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
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setEditInfoOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-white/70 hover:text-white active:scale-95 transition-all text-xs font-medium flex-shrink-0"
          >
            Edit Info
          </button>
          {/* Score reference toggle */}
          <button
            type="button"
            onClick={() => setScoreRefOpen(!scoreRefOpen)}
            className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-white/70 hover:text-white active:scale-95 transition-all text-xs font-medium"
            aria-label="Score reference"
          >
            Score Guide
          </button>
          {/* Online/Offline dot */}
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${online ? 'bg-green-400' : 'bg-red-400'}`}
            aria-label={online ? 'Online' : 'Offline'}
          />
          <span className="text-white/50 text-sm hidden sm:inline">
            Zone {activeZoneIndex + 1}/{zones.length}
          </span>
          <Link
            to={`/assessment/${id}/summary`}
            className="px-4 py-2 bg-blue-medium hover:bg-blue-medium/80 active:scale-95 rounded-lg text-sm font-medium transition-all"
          >
            Summary
          </Link>
        </div>
      </header>

      <ScoreReference open={scoreRefOpen} onClose={() => setScoreRefOpen(false)} />
      <EditAssessmentInfo assessment={assessment} open={editInfoOpen} onClose={() => setEditInfoOpen(false)} />

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
            zones={zones}
            activeZoneKey={activeZoneKey}
            itemScoresByZone={itemScoresByZone}
            onSelectZone={handleSelectZone}
            nightActive={phaseFilter === 'night'}
            nightItems={nightItems}
            onSelectNight={handleSelectNight}
            groupedSections={commercialSections}
            onSelectZoneInPhase={handleSelectZoneInPhase}
            activePhase={phaseFilter}
          />
        </div>

        <main ref={mainRef} className="flex-1 overflow-y-auto p-6">
          {/* Phase filter — hidden when sidebar drives phase (commercial grouped mode)
              and when Night view is active (Night is its own view, not a filter). */}
          {phaseFilter !== 'night' && !commercialSections && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                Walkthrough phase
              </span>
              <div className="inline-flex rounded-lg border border-ink/15 bg-surface p-0.5 shadow-sm">
                {(['all', 'exterior', 'interior'] as const).map((opt) => {
                  const active = phaseFilter === opt;
                  const label =
                    opt === 'all' ? 'All' : opt === 'exterior' ? 'Exterior' : 'Interior';
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handlePhaseChange(opt)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        active
                          ? 'bg-navy text-white shadow-sm'
                          : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                      }`}
                      aria-pressed={active}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {phaseFilter !== 'all' && (
                <span className="text-xs text-ink/50">
                  Showing {phaseFilter} items only
                </span>
              )}
            </div>
          )}

          {phaseFilter === 'night' ? (
            <NightView
              zones={zones}
              itemScoresByZone={itemScoresByZone}
              onScoreChange={handleScoreChange}
              onNotesChange={handleNotesChange}
            />
          ) : (
            <ZoneView
              zone={activeZone}
              itemScores={activeItemScores}
              phaseFilter={phaseFilter}
              onScoreChange={handleScoreChange}
              onNotesChange={handleNotesChange}
            />
          )}

          {/* Zone navigation — hidden in Night mode (flat list, no zone hopping). */}
          {phaseFilter !== 'night' && (
            sectionNav ? (
              <div className="flex justify-between items-center mt-8 pb-6">
                {/* Previous — within section, or cross back to prior section's last zone */}
                <button
                  type="button"
                  onClick={goToPrevInSection}
                  disabled={
                    sectionNav.idx === 0 &&
                    (!sectionNav.otherSection ||
                      // Only the EXTERIOR section can have no prior section.
                      sectionNav.currentSection.phase === 'exterior')
                  }
                  className="px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 bg-surface border border-ink/20 text-ink hover:bg-blue-pale disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &larr; {sectionNav.idx === 0 && sectionNav.otherSection
                    ? `Back to ${sectionNav.otherSection.label}`
                    : 'Previous Zone'}
                </button>
                {/* Next — within section, cross to next section, or Summary at the end */}
                {sectionNav.idx === sectionNav.currentSection.entries.length - 1 &&
                sectionNav.currentSection.phase === 'interior' ? (
                  <Link
                    to={`/assessment/${id}/summary`}
                    className="px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 bg-green-600 text-white hover:bg-green-700"
                  >
                    Go to Summary &rarr;
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={goToNextInSection}
                    className="px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 bg-navy text-white hover:bg-navy-light"
                  >
                    {sectionNav.idx === sectionNav.currentSection.entries.length - 1 &&
                    sectionNav.otherSection
                      ? `Start ${sectionNav.otherSection.label}`
                      : 'Next Zone'} &rarr;
                  </button>
                )}
              </div>
            ) : (
              <div className="flex justify-between items-center mt-8 pb-6">
                <button
                  type="button"
                  onClick={goToPrevZone}
                  disabled={activeZoneIndex === 0}
                  className="px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 bg-surface border border-ink/20 text-ink hover:bg-blue-pale disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &larr; Previous Zone
                </button>
                {activeZoneIndex === zones.length - 1 ? (
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
            )
          )}
        </main>
      </div>
    </div>
  );
}
