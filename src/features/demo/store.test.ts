import { projectMinutes } from './selectors';
import { useDemo } from './store';

beforeEach(() => jest.useFakeTimers({ now: new Date('2026-10-12T08:00:00Z') }));
afterEach(() => jest.useRealTimers());

test('Stoppen speichert die Zeit als Stunden im Projekt', () => {
  const before = projectMinutes('p7', useDemo.getState().projectCosts);
  useDemo.getState().stopTimer('m3'); // Demo-Daten: Mehmet läuft schon auf p7
  const base = projectMinutes('p7', useDemo.getState().projectCosts);
  expect(useDemo.getState().startTimer('p7', 'm3')).toBe(true);
  jest.setSystemTime(new Date('2026-10-12T09:30:00Z'));
  useDemo.getState().stopTimer('m3');
  expect(useDemo.getState().timers.m3).toBeUndefined();
  expect(projectMinutes('p7', useDemo.getState().projectCosts)).toBe(base + 90);
  expect(before).toBeLessThanOrEqual(base);
});

test('Pro Person eine Zeit; Wechsel stoppt und speichert die alte', () => {
  const before = projectMinutes('p1', useDemo.getState().projectCosts);
  useDemo.getState().startTimer('p1'); // ich (Thomas) bin im Team von p1
  jest.setSystemTime(new Date('2026-10-12T08:45:00Z'));
  useDemo.getState().startTimer('p4'); // Thomas auch im Team von p4
  expect(useDemo.getState().timers.m1?.projectId).toBe('p4');
  expect(projectMinutes('p1', useDemo.getState().projectCosts)).toBe(before + 45);
  // Lukas läuft unabhängig weiter
  expect(useDemo.getState().timers.m2?.projectId).toBe('p1');
});

test('Nur Team-Mitglieder dürfen Zeit starten', () => {
  expect(useDemo.getState().startTimer('p7', 'm2')).toBe(false); // Lukas nicht im Team von p7
  useDemo.getState().setTeam('p7', ['m3', 'm2']);
  expect(useDemo.getState().startTimer('p7', 'm2')).toBe(true);
});
