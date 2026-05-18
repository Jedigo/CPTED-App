import type { ItemScore, ZoneDefinition } from '../types';
import { isZoneComplete, getCompletionCounts } from '../services/scoring';
import type { Phase } from '../data/item-phases';

export interface GroupedSection {
  label: string; // e.g. "EXTERIOR"
  phase: Phase;
  entries: { zone: ZoneDefinition; items: ItemScore[] }[];
}

interface ZoneSidebarProps {
  zones: ZoneDefinition[];
  activeZoneKey: string;
  itemScoresByZone: Map<string, ItemScore[]>;
  onSelectZone: (zoneKey: string) => void;
  /** Whether the Night walkthrough tab is the currently active view */
  nightActive: boolean;
  /** Items that match the Night phase filter, across all zones */
  nightItems: ItemScore[];
  onSelectNight: () => void;
  /**
   * When provided, the sidebar renders the zones grouped under section headers
   * (e.g., EXTERIOR / INTERIOR) instead of the flat list. Each zone click also
   * carries the section's phase so the parent can set both `activeZoneKey` and
   * `phaseFilter` in one tap. Used for commercial office assessments.
   */
  groupedSections?: GroupedSection[];
  /** Required when `groupedSections` is provided. */
  onSelectZoneInPhase?: (zoneKey: string, phase: Phase) => void;
  /** Current phase filter — drives which section's zone is highlighted in grouped mode. */
  activePhase?: 'all' | Phase | 'night';
}

function getCompletionStatus(
  items: ItemScore[] | undefined,
): 'none' | 'partial' | 'complete' {
  if (!items || items.length === 0) return 'none';
  if (isZoneComplete(items)) return 'complete';
  const { addressed } = getCompletionCounts(items);
  if (addressed === 0) return 'none';
  return 'partial';
}

const DOT_COLORS = {
  none: 'bg-white/30',
  partial: 'bg-yellow-400',
  complete: 'bg-green-400',
} as const;

export default function ZoneSidebar({
  zones,
  activeZoneKey,
  itemScoresByZone,
  onSelectZone,
  nightActive,
  nightItems,
  onSelectNight,
  groupedSections,
  onSelectZoneInPhase,
  activePhase,
}: ZoneSidebarProps) {
  const nightStatus = getCompletionStatus(nightItems);
  const hasNightItems = nightItems.length > 0;

  return (
    <nav className="w-56 h-full bg-navy-dark flex-shrink-0 overflow-y-auto border-r border-navy">
      <div className="py-2">
        {groupedSections && onSelectZoneInPhase
          ? groupedSections.map((section, sectionIdx) => (
              <div key={section.label} className={sectionIdx > 0 ? 'mt-1' : ''}>
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {section.label}
                </div>
                {section.entries.map(({ zone, items }) => {
                  const isActive =
                    !nightActive &&
                    activePhase === section.phase &&
                    zone.key === activeZoneKey;
                  const status = getCompletionStatus(items);

                  return (
                    <button
                      key={`${section.phase}-${zone.key}`}
                      type="button"
                      onClick={() => onSelectZoneInPhase(zone.key, section.phase)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                        isActive
                          ? 'bg-blue-medium text-white'
                          : 'text-white/70 hover:bg-navy-light hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold w-5 text-center opacity-50">
                        {zone.order}
                      </span>
                      <span className="text-sm font-medium truncate flex-1">
                        {zone.name}
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${DOT_COLORS[status]}`}
                      />
                    </button>
                  );
                })}
              </div>
            ))
          : zones.map((zone) => {
              const isActive = !nightActive && zone.key === activeZoneKey;
              const status = getCompletionStatus(itemScoresByZone.get(zone.key));

              return (
                <button
                  key={zone.key}
                  type="button"
                  onClick={() => onSelectZone(zone.key)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-blue-medium text-white'
                      : 'text-white/70 hover:bg-navy-light hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold w-5 text-center opacity-50">
                    {zone.order}
                  </span>
                  <span className="text-sm font-medium truncate flex-1">
                    {zone.name}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${DOT_COLORS[status]}`}
                  />
                </button>
              );
            })}

        {hasNightItems && (
          <>
            <div className="my-2 mx-4 border-t border-white/10" />
            <button
              type="button"
              onClick={onSelectNight}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                nightActive
                  ? 'bg-blue-medium text-white'
                  : 'text-white/70 hover:bg-navy-light hover:text-white'
              }`}
              aria-pressed={nightActive}
            >
              <span className="w-5 text-center opacity-70" aria-hidden="true">
                {/* Moon icon */}
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 inline-block"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </span>
              <span className="text-sm font-medium truncate flex-1">
                Night Walkthrough
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${DOT_COLORS[nightStatus]}`}
              />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
