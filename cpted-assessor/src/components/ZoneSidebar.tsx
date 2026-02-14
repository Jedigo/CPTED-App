import type { ItemScore } from '../types';
import { ZONES } from '../data/zones';
import { isZoneComplete, getCompletionCounts } from '../services/scoring';

interface ZoneSidebarProps {
  activeZoneKey: string;
  itemScoresByZone: Map<string, ItemScore[]>;
  onSelectZone: (zoneKey: string) => void;
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
  activeZoneKey,
  itemScoresByZone,
  onSelectZone,
}: ZoneSidebarProps) {
  return (
    <nav className="w-56 h-full bg-navy-dark flex-shrink-0 overflow-y-auto border-r border-navy">
      <div className="py-2">
        {ZONES.map((zone) => {
          const isActive = zone.key === activeZoneKey;
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
      </div>
    </nav>
  );
}
