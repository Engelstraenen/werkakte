import { projectMinutes } from './selectors';
import { useDemo } from './store';

beforeEach(() => jest.useFakeTimers({ now: new Date('2026-10-12T08:00:00Z') }));
afterEach(() => jest.useRealTimers());

test('Stoppen speichert die Zeit als Stunden im Projekt', () => {
  const before = projectMinutes('p7', useDemo.getState().projectCosts);
  useDemo.getState().startTimer('p7');
  jest.setSystemTime(new Date('2026-10-12T09:30:00Z'));
  useDemo.getState().stopTimer();
  expect(useDemo.getState().timer).toBeNull();
  expect(projectMinutes('p7', useDemo.getState().projectCosts)).toBe(before + 90);
});

test('Neues Projekt starten stoppt und speichert das laufende', () => {
  const before = projectMinutes('p1', useDemo.getState().projectCosts);
  useDemo.getState().startTimer('p1');
  jest.setSystemTime(new Date('2026-10-12T08:45:00Z'));
  useDemo.getState().startTimer('p2');
  expect(useDemo.getState().timer?.projectId).toBe('p2');
  expect(projectMinutes('p1', useDemo.getState().projectCosts)).toBe(before + 45);
});
