import type { ZoneDefinition, ItemScore } from '../types';
import PrincipleSection from './PrincipleSection';
import ZoneSummary from './ZoneSummary';

interface ZoneViewProps {
  zone: ZoneDefinition;
  itemScores: ItemScore[];
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
  onScoreChange,
  onNotesChange,
}: ZoneViewProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-navy">{zone.name}</h2>
        <p className="text-sm text-navy/60 mt-1 leading-relaxed">
          {zone.description}
        </p>
      </div>

      {zone.principles.map((principle) => {
        const principleItems = itemScores
          .filter((s) => s.principle === principle.key)
          .sort((a, b) => a.item_order - b.item_order);

        return (
          <PrincipleSection
            key={principle.key}
            principle={principle}
            itemScores={principleItems}
            onScoreChange={onScoreChange}
            onNotesChange={onNotesChange}
          />
        );
      })}

      <ZoneSummary itemScores={itemScores} />
    </div>
  );
}
