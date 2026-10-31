import { useState } from 'react';
import type { Team } from '../types';
import { REGIONS, REGION_CAPTIONS } from '../types';
import { record, useGame } from '../game/context';
import { armsOf, Shield } from '../art/Heraldry';
import { RealmVignette } from '../art/Ornament';
import { realmName } from './Tourneys';

export function Armorial() {
  const { world: w } = useGame();
  const [region, setRegion] = useState(0);
  const houses = (division: 0 | 1) => w.teams.filter((t) => t.region === region && t.division === division).sort((a, b) => b.record.pts - a.record.pts || (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa));

  return (
    <div className="spread armorial">
      <section className="across">
        <h1 className="folio-title">The Armorial of Great Houses</h1>
        <p className="folio-sub">Eighty banners in four realms, each blazoned by the heralds and sharing one talent: property damage.</p>
        <div className="realm-banners" role="tablist" aria-label="Realm">
          {REGIONS.map((r, i) => (
            <button key={r} role="tab" type="button" aria-selected={region === i} className={`realm-banner ${region === i ? 'is-on' : ''}`} onClick={() => setRegion(i)}>
              <RealmVignette realm={i} />
              <span className="realm-banner-text"><strong>{realmName(i)}</strong><small>{REGION_CAPTIONS[i]}</small></span>
            </button>
          ))}
        </div>
      </section>
      <section className="page verso">
        <h2 className="page-head">The Premier Houses</h2>
        <p className="aside-note">Ranked by this season's points in {realmName(region)}.</p>
        <RollOfArms houses={houses(0)} />
      </section>
      <section className="page recto">
        <h2 className="page-head">The Challenger Houses</h2>
        <p className="aside-note">Hungry for promotion and, frequently, for lunch.</p>
        <RollOfArms houses={houses(1)} />
      </section>
    </div>
  );
}

function RollOfArms({ houses }: { houses: Team[] }) {
  const { go } = useGame();
  return (
    <ol className="roll-of-arms">
      {houses.map((t) => (
        <li key={t.id}>
          <button type="button" className="arms-entry" onClick={() => go({ kind: 'house', id: t.id })}>
            <span className="arms-shield"><Shield team={t} size={84} title />{t.worldTitles > 0 && <span className="crowns" aria-label={`${t.worldTitles} Grand Rift crowns`}>{Array.from({ length: Math.min(5, t.worldTitles) }, (_, i) => <i key={i} />)}</span>}</span>
            <span className="arms-text">
              <strong>{t.name}</strong>
              <em>{armsOf(t).blazon}</em>
              <span className="arms-stats"><span>{t.philosophy.toLowerCase()}</span><span>{record(t)}</span><span><b>{t.record.pts}</b> pts</span></span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
