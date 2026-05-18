import type { ZoneDefinition, ItemScore } from '../types';
import ChecklistItem from './ChecklistItem';

interface NightViewProps {
  zones: ZoneDefinition[];
  itemScoresByZone: Map<string, ItemScore[]>;
  onScoreChange: (itemId: string, score: number | null, isNa: boolean) => void;
  onNotesChange: (itemId: string, notes: string) => void;
}

export default function NightView({
  zones,
  itemScoresByZone,
  onScoreChange,
  onNotesChange,
}: NightViewProps) {
  const zonesWithItems = zones
    .map((zone) => {
      const items = (itemScoresByZone.get(zone.key) || []).slice().sort(
        (a, b) => a.item_order - b.item_order,
      );
      return { zone, items };
    })
    .filter(({ items }) => items.length > 0);

  const totalItems = zonesWithItems.reduce((n, z) => n + z.items.length, 0);
  const addressed = zonesWithItems.reduce(
    (n, z) => n + z.items.filter((s) => s.score !== null || s.is_na).length,
    0,
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-ink">Nighttime Walkthrough</h2>
        <p className="text-sm text-ink/60 mt-1 leading-relaxed">
          Lighting and after-hours observability items pulled from every zone. Items
          stay grouped by their home zone for context, but you can score the whole
          night sweep without leaving this tab.
        </p>
      </div>

      {totalItems === 0 ? (
        <div className="bg-surface border border-ink/10 rounded-xl p-8 text-center">
          <p className="text-ink/60 text-sm">
            No night items in this assessment.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-pale border border-ink/10">
            <span className="text-xs font-semibold text-ink/70">
              {addressed}/{totalItems} night items scored
            </span>
          </div>

          {zonesWithItems.map(({ zone, items }) => (
            <section key={zone.key} className="mb-6">
              <div className="flex items-baseline gap-2 mb-2 px-1">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
                  {zone.name}
                </h3>
                <span className="text-xs text-ink/50">
                  ({items.length} item{items.length === 1 ? '' : 's'})
                </span>
              </div>
              <div className="space-y-2">
                {items.map((itemScore) => (
                  <ChecklistItem
                    key={itemScore.id}
                    itemScore={itemScore}
                    onScoreChange={(score, isNa) =>
                      onScoreChange(itemScore.id, score, isNa)
                    }
                    onNotesChange={(notes) => onNotesChange(itemScore.id, notes)}
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
