import { completeSignIn } from './completeSignIn';

const mockExchange = jest.fn();
const mockGetSession = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: (code: string) => mockExchange(code),
      getSession: () => mockGetSession(),
    },
  },
}));

test('erfolgreicher Tausch', async () => {
  mockExchange.mockResolvedValue({ error: null });
  expect(await completeSignIn('abc')).toBe(true);
});

test('zweiter Tausch schlägt fehl, Session existiert schon → ok', async () => {
  mockExchange.mockResolvedValue({ error: new Error('verbraucht') });
  mockGetSession.mockResolvedValue({ data: { session: { access_token: 'x' } } });
  expect(await completeSignIn('abc')).toBe(true);
});

test('Tausch schlägt fehl, keine Session → Fehler', async () => {
  mockExchange.mockResolvedValue({ error: new Error('ungültig') });
  mockGetSession.mockResolvedValue({ data: { session: null } });
  expect(await completeSignIn('abc')).toBe(false);
});
