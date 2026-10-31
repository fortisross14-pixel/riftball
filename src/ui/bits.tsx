import type { ReactNode } from 'react';
import type { Player, Team } from '../types';
import { Portrait } from '../art/Portrait';
import { houseColours, Shield } from '../art/Heraldry';
import { useGame } from '../game/context';
import { ES, formLetter } from '../i18n/es';

/** A framed athlete miniature. Rarity sets the frame's pigment. */
export function Miniature({ player, size = 72, className = '' }: { player: Player; size?: number; className?: string }) {
  const { team } = useGame();
  const t = team(player.teamId);
  return (
    <span className={`miniature rarity-${player.rarity.toLowerCase()} ${className}`} style={{ width: size, height: size }}>
      <Portrait player={player} house={t ? houseColours(t) : undefined} size={size} />
    </span>
  );
}

export function HouseName({ team, size = 26, full = false }: { team: Team | undefined; size?: number; full?: boolean }) {
  const { go } = useGame();
  if (!team) return <span className="house-name is-gone">{ES.common.lostClub}</span>;
  return (
    <a className="house-name" href={`#/house/${team.id}`} onClick={(e) => { e.preventDefault(); go({ kind: 'house', id: team.id }); }}>
      {size > 0 && <Shield team={team} size={size} />}
      <span>{full ? team.name : team.nickname}</span>
    </a>
  );
}

export function AthleteName({ player, children }: { player: Player | undefined; children?: ReactNode }) {
  const { go } = useGame();
  if (!player) return <span className="athlete-name is-gone">{ES.common.lostAthlete}</span>;
  return (
    <a className="athlete-name" href={`#/athlete/${player.id}`} onClick={(e) => { e.preventDefault(); go({ kind: 'athlete', id: player.id }); }}>
      {children ?? player.name}{!children && player.nickname ? <small className="athlete-nick"> «{player.nickname}»</small> : null}
    </a>
  );
}

/** A row of rubricated choices. */
export function Choice<T extends string | number>({ label, value, options, onChange, compact }: { label: string; value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; compact?: boolean }) {
  return (
    <div className={`choice ${compact ? 'is-compact' : ''}`} role="radiogroup" aria-label={label}>
      <span className="choice-label">{label}</span>
      <div className="choice-options">
        {options.map((o) => (
          <button key={String(o.value)} type="button" role="radio" aria-checked={o.value === value} className={o.value === value ? 'is-on' : ''} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Pick<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <label className="pick">
      <span className="choice-label">{label}</span>
      <select value={String(value)} onChange={(e) => {
        const found = options.find((o) => String(o.value) === e.target.value);
        if (found) onChange(found.value);
      }}>
        {options.map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function FormPips({ team }: { team: Team }) {
  if (!team.form.length) return <span className="form-pips is-empty">{ES.common.noForm}</span>;
  return (
    <span className="form-pips" aria-label={ES.common.formLabel(team.form.map(formLetter).join(' '))}>
      {team.form.map((f, i) => <i key={i} className={`pip pip-${f.toLowerCase()}`}>{formLetter(f)}</i>)}
    </span>
  );
}

export function Blank({ children }: { children: ReactNode }) {
  return <p className="blank">{children}</p>;
}

export function Rule({ ornate = false }: { ornate?: boolean }) {
  return <div className={`rule ${ornate ? 'is-ornate' : ''}`} aria-hidden="true"><span /></div>;
}
