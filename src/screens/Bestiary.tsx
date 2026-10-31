import { useMemo, useState } from 'react';
import type { Player, Race, Role } from '../types';
import { RACES, ROLES } from '../types';
import { nfmt, useGame } from '../game/context';
import { Portrait } from '../art/Portrait';
import { RoleGlyph } from '../art/Ornament';
import { Shield } from '../art/Heraldry';
import { Blank, Choice, Miniature } from '../ui/bits';

const RACE_LORE: Record<Race, string> = {
  Human: 'adaptable, ambitious, frequently concussed',
  Orc: 'strong, fearsome, poor at passing notes',
  Elf: 'swift and graceful, insufferably so',
  Dwarf: 'enduring walls with beards',
  Goblin: 'agile, sly, roughly knee height',
  Troll: 'enormous, slow, regenerates grudges',
  Lizardkin: 'quick and sturdy, cold-blooded about it',
  Revenant: 'tireless, technically deceased',
  Satyr: 'nimble hooves, questionable focus',
};

const exemplar = (race: Race): Pick<Player, 'id' | 'race' | 'role' | 'rarity' | 'portrait' | 'age'> => ({ id: `exemplar-${race}`, race, role: 'Runner', rarity: 'Elite', portrait: 2, age: 26 });

type Sort = 'rating' | 'potential' | 'age' | 'level';

export function Bestiary() {
  const { world: w, team, go } = useGame();
  const [race, setRace] = useState<Race | 'All'>('All');
  const [role, setRole] = useState<Role | 'All'>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('rating');
  const [shown, setShown] = useState(48);

  const found = useMemo(() => {
    const q = query.trim().toLowerCase();
    return w.players
      .filter((p) => (race === 'All' || p.race === race) && (role === 'All' || p.role === role))
      .filter((p) => !q || `${p.name} ${p.race} ${p.role} ${team(p.teamId)?.name ?? ''} ${p.rarity}`.toLowerCase().includes(q))
      .sort((a, b) => sort === 'age' ? a.age - b.age || b.rating - a.rating : sort === 'level' ? b.level - a.level || b.rating - a.rating : sort === 'potential' ? b.potential - a.potential : b.rating - a.rating);
  }, [w, race, role, query, sort, team]);

  return (
    <div className="spread bestiary">
      <section className="across">
        <h1 className="folio-title">The Bestiary of Champions</h1>
        <p className="folio-sub">{nfmt(w.players.length)} living athletes of nine peoples. Every legend began as somebody's questionable academy signing.</p>

        <div className="race-index" role="radiogroup" aria-label="People">
          <button type="button" role="radio" aria-checked={race === 'All'} className={`race-medal is-all ${race === 'All' ? 'is-on' : ''}`} onClick={() => setRace('All')}>
            <span className="medal-face all-face">IX</span>
            <strong>All peoples</strong>
            <small>{nfmt(w.players.length)} athletes</small>
          </button>
          {RACES.map((r) => (
            <button key={r} type="button" role="radio" aria-checked={race === r} className={`race-medal ${race === r ? 'is-on' : ''}`} onClick={() => setRace(r)}>
              <span className="medal-face"><Portrait player={exemplar(r)} size={76} house={['#5a2a6b', '#d6a734']} /></span>
              <strong>{r}</strong>
              <small>{RACE_LORE[r]}</small>
            </button>
          ))}
        </div>

        <div className="bestiary-tools">
          <label className="seek">
            <span className="choice-label">Seek by name, people or house</span>
            <input type="search" value={query} placeholder="e.g. Gorak, goblin, Brineport…" onChange={(e) => { setQuery(e.target.value); setShown(48); }} />
          </label>
          <Choice label="Position" compact value={role} onChange={(v) => { setRole(v); setShown(48); }} options={[{ value: 'All' as Role | 'All', label: 'All' }, ...ROLES.map((r) => ({ value: r as Role | 'All', label: <span className="role-opt"><RoleGlyph role={r} size={20} />{r}</span> }))]} />
          <Choice label="Order by" compact value={sort} onChange={setSort} options={[{ value: 'rating', label: 'Rating' }, { value: 'potential', label: 'Promise' }, { value: 'level', label: 'Level' }, { value: 'age', label: 'Youth' }]} />
        </div>
        <p className="found-count">{found.length === 0 ? 'No athlete answers to that description.' : `${nfmt(found.length)} ${found.length === 1 ? 'athlete answers' : 'athletes answer'} the summons.`}</p>

        <div className="leaves">
          {found.slice(0, shown).map((p) => {
            const t = team(p.teamId);
            return (
              <button key={p.id} type="button" className={`leaf-card rarity-${p.rarity.toLowerCase()}`} onClick={() => go({ kind: 'athlete', id: p.id })}>
                <span className="leaf-portrait">
                  <Miniature player={p} size={180} />
                  <span className={`rating-seal ${p.rarity === 'Legendary' || p.rarity === 'Generational' ? 'is-gilt' : ''}`} aria-label={`Rating ${p.rating}`}>{p.rating}</span>
                  {p.injury > 0 && <span className="injury-tag">abed {p.injury} wk</span>}
                </span>
                <strong className="leaf-name">{p.name}</strong>
                <span className="leaf-line"><RoleGlyph role={p.role} size={18} />{p.race} {p.role.toLowerCase()} · age {p.age}</span>
                <span className="leaf-foot">
                  {t && <span className="leaf-house"><Shield team={t} size={18} />{t.nickname}</span>}
                  <span className={`rarity-word rarity-${p.rarity.toLowerCase()}`}>{p.rarity}</span>
                </span>
              </button>
            );
          })}
        </div>
        {found.length > shown && (
          <div className="more-leaves"><button type="button" className="ink-button" onClick={() => setShown((n) => n + 48)}>Turn up {Math.min(48, found.length - shown)} more athletes</button></div>
        )}
        {found.length === 0 && <Blank>Try another people, position or name.</Blank>}
      </section>
    </div>
  );
}
