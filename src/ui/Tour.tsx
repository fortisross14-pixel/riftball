import { useEffect, useState } from 'react';
import { ES } from '../i18n/es';

const KEY = 'riftball-tour-done';
const readDone = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const markDone = () => { try { localStorage.setItem(KEY, '1'); } catch { /* storage may be blocked; the tour just shows again */ } };

/** A four-step first-run tour. Shown once per browser; skipping counts as done. */
export function Tour() {
  const [step, setStep] = useState<number | null>(null);
  useEffect(() => { if (!readDone()) setStep(0); }, []);
  if (step === null) return null;
  const steps = ES.tour.steps;
  const [title, body] = steps[step];
  const last = step === steps.length - 1;
  const close = () => { markDone(); setStep(null); };
  return (
    <div className="scriptorium tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="scriptorium-slip tour-slip">
        <p className="tour-step">{ES.tour.step(step + 1, steps.length)}</p>
        <h2 id="tour-title">{title}</h2>
        <p>{body}</p>
        <ol className="tour-dots" aria-hidden="true">{steps.map((_, i) => <li key={i} className={i === step ? 'is-on' : ''} />)}</ol>
        <div className="tour-actions">
          {!last && <button type="button" className="ink-button" onClick={close}>{ES.tour.skip}</button>}
          <button type="button" className="gilt-button" autoFocus onClick={() => (last ? close() : setStep(step + 1))}>{last ? ES.tour.done : ES.tour.next}</button>
        </div>
      </div>
    </div>
  );
}
