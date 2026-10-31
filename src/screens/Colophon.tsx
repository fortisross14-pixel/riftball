import { useRef } from 'react';
import { nfmt, useGame } from '../game/context';
import { roman } from '../art/hash';
import { exportSave } from '../storage';

export function Colophon() {
  const { world: w, go, locked, importFile, newUniverse } = useGame();
  const input = useRef<HTMLInputElement>(null);
  const games = w.totalGames ?? w.matches.filter((m) => m.homeScore !== null).length;
  return (
    <div className="spread colophon">
      <section className="page verso">
        <h1 className="folio-title">Colophon</h1>
        <p className="folio-sub">Concerning the making and keeping of this book. One world, eighty houses, an alarming amount of paperwork.</p>
        <dl className="colophon-facts">
          <div><dt>World seed</dt><dd>{w.seed}</dd></div>
          <div><dt>Current year</dt><dd>{roman(w.season)} <small>({w.season})</small></dd></div>
          <div><dt>Week</dt><dd>{w.week} of 26</dd></div>
          <div><dt>Contests fought</dt><dd>{nfmt(games)}</dd></div>
          <div><dt>Living athletes</dt><dd>{nfmt(w.players.length)}</dd></div>
          <div><dt>Retired athletes</dt><dd>{nfmt(w.retired.length)}</dd></div>
        </dl>
        <p className="colophon-note">This chronicle is kept in your browser's own archive (IndexedDB) and saved after every change. Clearing browser data, private windows or moving to another address can lose it, so write a copy to a file now and then. Every world is deterministic: the same seed and the same history always produce the same results.</p>
      </section>
      <section className="page recto">
        <h2 className="page-head">Keeping the Book</h2>
        <div className="keep-actions">
          <article>
            <h3>Copy the chronicle to a file</h3>
            <p>Downloads the complete world, its history and every record as a JSON file.</p>
            <button type="button" className="gilt-button" onClick={() => exportSave(w)}>Export the universe</button>
          </article>
          <article>
            <h3>Bind in another chronicle</h3>
            <p>Replaces this world with an exported Riftball file (format version 1 or 2). You will be asked to confirm.</p>
            <button type="button" className="ink-button" disabled={locked} onClick={() => input.current?.click()}>Import a universe</button>
            <input ref={input} type="file" accept=".json,application/json" hidden onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f && await importFile(f)) go({ kind: 'section', section: 'chronicle' });
            }} />
          </article>
          <article className="is-danger">
            <h3>Burn it and begin again</h3>
            <p>Erases this world's save and founds a brand new universe with a fresh seed. Export first if you want to keep this one.</p>
            <button type="button" className="ink-button is-danger" onClick={async () => { if (await newUniverse()) go({ kind: 'section', section: 'chronicle' }); }}>Found a new universe</button>
          </article>
        </div>
      </section>
    </div>
  );
}
