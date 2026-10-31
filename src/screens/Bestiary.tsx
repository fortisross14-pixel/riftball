import { memo, useMemo, useState } from 'react';
import type { Player, Race, Role, Team } from '../types';
import { RACES, ROLES } from '../types';
import { nfmt, useGame } from '../game/context';
import { Portrait } from '../art/Portrait';
import { RoleGlyph } from '../art/Ornament';
import { Shield } from '../art/Heraldry';
import { Blank, Choice, Miniature } from '../ui/bits';
import { Term } from '../ui/Term';
import { ES, RAZA_PLURAL_ES, raza, rareza, rol } from '../i18n/es';

const T = ES.athletes;
const exemplar = (race: Race): Pick<Player, 'id' | 'race' | 'role' | 'rarity' | 'portrait' | 'age'> & { portraitKey: string } => ({ id: `exemplar-${race}`, race, role: 'Runner', rarity: 'Elite', portrait: 2, age: 26, portraitKey: `${race.toLowerCase()}-02` });

type Sort = 'rating' | 'potential' | 'age' | 'level';

export function Bestiary() {
  const { world: w, team, go } = useGame();
  const [race, setRace] = useState<Race | 'All'>('All');
  const [role, setRole] = useState<Role | 'All'>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('rating');
  const [shown, setShown] = useState(24);

  const found = useMemo(() => {
    const q = query.trim().toLowerCase();
    return w.players
      .filter((p) => (race === 'All' || p.race === race) && (role === 'All' || p.role === role))
      .filter((p) => !q || `${p.name} ${p.nickname ?? ''} ${raza(p.race)} ${rol(p.role)} ${team(p.teamId)?.name ?? ''} ${rareza(p.rarity)}`.toLowerCase().includes(q))
      .sort((a, b) => sort === 'age' ? a.age - b.age || b.rating - a.rating : sort === 'level' ? b.level - a.level || b.rating - a.rating : sort === 'potential' ? b.potential - a.potential : b.rating - a.rating);
  }, [w, race, role, query, sort, team]);

  return (
    <div className="spread bestiary">
      <section className="across">
        <h1 className="folio-title">{T.title}</h1>
        <p className="folio-sub">{T.sub(nfmt(w.players.length))}</p>

        <div className="race-index" role="radiogroup" aria-label={T.peoples}>
          <button type="button" role="radio" aria-checked={race === 'All'} className={`race-medal is-all ${race === 'All' ? 'is-on' : ''}`} onClick={() => setRace('All')}>
            <span className="medal-face all-face">IX</span>
            <strong>{T.allPeoples}</strong>
            <small>{T.count(nfmt(w.players.length))}</small>
          </button>
          {RACES.map((r) => (
            <button key={r} type="button" role="radio" aria-checked={race === r} className={`race-medal ${race === r ? 'is-on' : ''}`} onClick={() => setRace(r)}>
              <span className="medal-face"><Portrait player={exemplar(r)} size={76} house={['#5a2a6b', '#d6a734']} /></span>
              <strong>{RAZA_PLURAL_ES[r]}</strong>
              <small>{T.lore[r]}</small>
            </button>
          ))}
        </div>

        <div className="bestiary-tools">
          <label className="seek">
            <span className="choice-label">{T.search}</span>
            <input type="search" value={query} placeholder={T.searchHint} onChange={(e) => { setQuery(e.target.value); setShown(24); }} />
          </label>
          <Choice label={ES.common.position} compact value={role} onChange={(v) => { setRole(v); setShown(24); }} options={[{ value: 'All' as Role | 'All', label: ES.common.all }, ...ROLES.map((r) => ({ value: r as Role | 'All', label: <span className="role-opt"><RoleGlyph role={r} size={20} />{rol(r)}</span> }))]} />
          <Choice label={T.order} compact value={sort} onChange={setSort} options={[{ value: 'rating', label: T.sort.rating }, { value: 'potential', label: T.sort.potential }, { value: 'level', label: T.sort.level }, { value: 'age', label: T.sort.age }]} />
        </div>
        <p className="found-count">{T.found(found.length, nfmt(found.length))} <Term k="rating">{ES.glossary.label}</Term></p>

        <div className="leaves">
          {found.slice(0, shown).map((p) => <LeafCard key={p.id} p={p} t={team(p.teamId)} onOpen={go} />)}
        </div>
        {found.length > shown && (
          <div className="more-leaves"><button type="button" className="ink-button" onClick={() => setShown((n) => n + 24)}>{T.more(Math.min(24, found.length - shown))}</button></div>
        )}
        {found.length === 0 && <Blank>{T.tryAgain}</Blank>}
      </section>
    </div>
  );
}

/** One athlete card. Memoised: re-sorting or filtering the list does not redraw unchanged cards. */
const LeafCard = memo(function LeafCard({ p, t, onOpen }: { p: Player; t: Team | undefined; onOpen: (r: { kind: 'athlete'; id: string }) => void }) {
  return (
    <button type="button" className={`leaf-card rarity-${p.rarity.toLowerCase()}`} onClick={() => onOpen({ kind: 'athlete', id: p.id })}>
      <span className="leaf-portrait">
        <Miniature player={p} size={180} />
        <span className={`rating-seal ${p.rarity === 'Legendary' || p.rarity === 'Generational' ? 'is-gilt' : ''}`} aria-label={T.ratingLabel(p.rating)}>{p.rating}</span>
        {p.injury > 0 && <span className="injury-tag">{ES.common.injuredWeeks(p.injury)}</span>}
      </span>
      <strong className="leaf-name">{p.name}</strong>
      {p.nickname && <span className="leaf-nick">«{p.nickname}»</span>}
      <span className="leaf-line"><RoleGlyph role={p.role} size={18} />{T.line(rol(p.role), raza(p.race).toLowerCase(), p.age)}</span>
      <span className="leaf-foot">
        {t && <span className="leaf-house"><Shield team={t} size={18} />{t.nickname}</span>}
        <span className={`rarity-word rarity-${p.rarity.toLowerCase()}`}>{rareza(p.rarity)}</span>
      </span>
    </button>
  );
});
