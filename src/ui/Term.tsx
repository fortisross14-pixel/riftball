import { useId } from 'react';
import type { ReactNode } from 'react';
import { ES } from '../i18n/es';

/**
 * A glossary word: dotted underline, and a plain-Spanish explanation on hover, focus or tap.
 * `k` is a key of ES.glossary; unknown keys render the text as-is.
 */
export function Term({ k, children }: { k: string; children: ReactNode }) {
  const id = useId();
  const tip = ES.glossary[k];
  if (!tip) return <>{children}</>;
  return (
    <span className="term" tabIndex={0} aria-describedby={id}>
      {children}
      <span className="term-tip" role="tooltip" id={id}>{tip}</span>
    </span>
  );
}
