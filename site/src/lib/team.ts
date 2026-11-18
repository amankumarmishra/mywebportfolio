import { useSyncExternalStore } from 'react';
import { teams, type TeamId } from '../content';

// Same keys as the old site, so returning visitors keep their team.
const KEY = 'f1-portfolio-theme';
const NAME_KEY = 'f1-portfolio-theme-name';

const read = (): TeamId | null => {
  try {
    const v = localStorage.getItem(KEY);
    return teams.some(t => t.id === v) ? (v as TeamId) : null;
  } catch {
    return null;
  }
};

let current: TeamId | null = read();
const listeners = new Set<() => void>();

export const hasChosenTeam = () => current !== null;

export function setTeam(id: TeamId) {
  current = id;
  document.documentElement.dataset.team = id;
  try {
    localStorage.setItem(KEY, id);
    localStorage.setItem(NAME_KEY, teams.find(t => t.id === id)!.name);
  } catch {
    /* storage blocked: theme still applies for this visit */
  }
  listeners.forEach(l => l());
}

export function useTeam() {
  const id = useSyncExternalStore(
    cb => (listeners.add(cb), () => listeners.delete(cb)),
    () => current ?? 'ferrari',
  );
  return teams.find(t => t.id === id)!;
}
