import { useState } from 'react';
import type { Team } from '../types';
import { REGIONS } from '../types';
import { record, useGame } from '../game/context';
import { Shield } from '../art/Heraldry';
import { RealmVignette } from '../art/Ornament';
import { realmName } from './Tourneys';
import { ES, PAIS_LEMA, filosofia } from '../i18n/es';

const T = ES.clubs;

export function Armorial() {
  const { world: w } = useGame();
  const [region, setRegion] = useState(0);
  const clubs = w.teams.filter((t) => t.region === region).sort((a, b) => b.record.pts - a.record.pts || (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa));
  const half = Math.ceil(clubs.length / 2);

  return (
    <div className="spread armorial">
      <section className="across">
        <h1 className="folio-title">{T.title}</h1>
        <p className="folio-sub">{T.sub}</p>
        <div className="realm-banners" role="tablist" aria-label={T.tabs}>
          {REGIONS.map((r, i) => (
            <button key={r} role="tab" type="button" aria-selected={region === i} className={`realm-banner ${region === i ? 'is-on' : ''}`} onClick={() => setRegion(i)}>
              <RealmVignette realm={i} />
              <span className="realm-banner-text"><strong>{realmName(i)}</strong><small>{PAIS_LEMA[i]}</small></span>
            </button>
          ))}
        </div>
      </section>
      <section className="page verso">
        <h2 className="page-head">{realmName(region)}</h2>
        <p className="aside-note">{T.ranked(realmName(region))}</p>
        <RollOfArms clubs={clubs.slice(0, half)} />
      </section>
      <section className="page recto">
        <RollOfArms clubs={clubs.slice(half)} start={half} />
      </section>
    </div>
  );
}

function RollOfArms({ clubs, start = 0 }: { clubs: Team[]; start?: number }) {
  const { go } = useGame();
  return (
    <ol className="roll-of-arms" start={start + 1}>
      {clubs.map((t) => {
        const style = filosofia(t.philosophy);
        return (
          <li key={t.id}>
            <button type="button" className="arms-entry" onClick={() => go({ kind: 'house', id: t.id })}>
              <span className="arms-shield"><Shield team={t} size={84} title />{t.worldTitles > 0 && <span className="crowns" aria-label={T.worldCrowns(t.worldTitles)}>{Array.from({ length: Math.min(5, t.worldTitles) }, (_, i) => <i key={i} />)}</span>}</span>
              <span className="arms-text">
                <strong>{t.name}</strong>
                <em>«{style.lema}»</em>
                <span className="arms-stats"><span>{style.nombre}</span><span>{record(t)}</span><span><b>{t.record.pts}</b> {ES.common.pts}</span></span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
