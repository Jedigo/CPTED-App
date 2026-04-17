import type { ZoneDefinition, ItemScore } from '../types';
import PrincipleSection from './PrincipleSection';
import ZoneSummary from './ZoneSummary';

interface ZoneViewProps {
  zone: ZoneDefinition;
  itemScores: ItemScore[];
  phaseFilter?: 'all' | 'exterior' | 'interior';
  onScoreChange: (
    itemId: string,
    score: number | null,
    isNa: boolean,
  ) => void;
  onNotesChange: (itemId: string, notes: string) => void;
}

export default function ZoneView({
  zone,
  itemScores,
  phaseFilter = 'all',
  onScoreChange,
  onNotesChange,
}: ZoneViewProps) {
  const renderedPrinciples = zone.principles
    .map((principle) => ({
      principle,
      items: itemScores
        .filter((s) => s.principle === principle.key)
        .sort((a, b) => a.item_order - b.item_order),
    }))
    .filter(({ items }) => items.length > 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-ink">{zone.name}</h2>
        <p className="text-sm text-ink/60 mt-1 leading-relaxed">
          {zone.description}
        </p>
      </div>

      {renderedPrinciples.length === 0 ? (
        <div className="bg-surface border border-ink/10 rounded-xl p-8 text-center">
          <p className="text-ink/60 text-sm">
            {phaseFilter === 'all'
              ? 'No items in this zone.'
              : `No ${phaseFilter} items in this zone — switch the phase filter or move to the next zone.`}
          </p>
        </div>
      ) : (
        renderedPrinciples.map(({ principle, items }) => (
          <PrincipleSection
            key={principle.key}
            principle={principle}
            itemScores={items}
            onScoreChange={onScoreChange}
            onNotesChange={onNotesChange}
          />
        ))
      )}

      <ZoneSummary itemScores={itemScores} />
    </div>
  );
}
