import { useRef } from 'react';
import { nfmt, useGame } from '../game/context';
import { exportSave } from '../storage';
import { ES } from '../i18n/es';

const T = ES.settings;

export function Colophon() {
  const { world: w, go, locked, importFile, newUniverse } = useGame();
  const input = useRef<HTMLInputElement>(null);
  const games = w.totalGames ?? w.matches.filter((m) => m.homeScore !== null).length;
  return (
    <div className="spread colophon">
      <section className="page verso">
        <h1 className="folio-title">{T.title}</h1>
        <p className="folio-sub">{T.sub}</p>
        <dl className="colophon-facts">
          <div><dt>{T.seed}</dt><dd>{w.seed}</dd></div>
          <div><dt>{T.season}</dt><dd>{w.season}</dd></div>
          <div><dt>{T.week}</dt><dd>{T.weekOf(w.week)}</dd></div>
          <div><dt>{T.games}</dt><dd>{nfmt(games)}</dd></div>
          <div><dt>{T.active}</dt><dd>{nfmt(w.players.length)}</dd></div>
          <div><dt>{T.retired}</dt><dd>{nfmt(w.retired.length)}</dd></div>
        </dl>
        <p className="colophon-note">{T.note}</p>
      </section>
      <section className="page recto">
        <h2 className="page-head">{T.keeping}</h2>
        <div className="keep-actions">
          <article>
            <h3>{T.exportTitle}</h3>
            <p>{T.exportBody}</p>
            <button type="button" className="gilt-button" onClick={() => exportSave(w)}>{T.exportButton}</button>
          </article>
          <article>
            <h3>{T.importTitle}</h3>
            <p>{T.importBody}</p>
            <button type="button" className="ink-button" disabled={locked} onClick={() => input.current?.click()}>{T.importButton}</button>
            <input ref={input} type="file" accept=".json,application/json" hidden onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f && await importFile(f)) go({ kind: 'section', section: 'chronicle' });
            }} />
          </article>
          <article className="is-danger">
            <h3>{T.burnTitle}</h3>
            <p>{T.burnBody}</p>
            <button type="button" className="ink-button is-danger" onClick={async () => { if (await newUniverse()) go({ kind: 'section', section: 'chronicle' }); }}>{T.burnButton}</button>
          </article>
        </div>
      </section>
    </div>
  );
}
