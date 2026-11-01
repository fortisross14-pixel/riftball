import type { CSSProperties } from 'react';
import type { Team } from '../types';
import { Shield } from '../art/Heraldry';

/** CSS custom properties with a club's two colours, for stripes, borders and backgrounds. */
export const clubColours = (t: Pick<Team, 'colors'>) => ({ '--c1': t.colors[0], '--c2': t.colors[1] }) as CSSProperties;

/** The club's crest inside a ring of its two colours. Plain CSS: no filters. */
export function ClubBadge({ team, size = 96, title = false }: { team: Team; size?: number; title?: boolean }) {
  return (
    <span className="club-badge" style={{ ...clubColours(team), width: size, height: size }}>
      <Shield team={team} size={Math.round(size * 0.68)} title={title} />
    </span>
  );
}
