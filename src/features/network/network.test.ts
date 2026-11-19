import { craftsmen, referrals } from './data';
import {
  normalizeWebsite,
  referralsForMe,
  referralsFromMe,
  referralsTakenByMe,
  searchCraftsmen,
  validateProfile,
  websiteHost,
} from './logic';
import { useNetwork } from './store';
import type { Craftsman } from './types';

const texts = { pflicht: 'P', email: 'E', plz: 'Z', webseite: 'W', gewerk: 'G' };
const weber: Craftsman = {
  id: 'me',
  email: 'info@weber.example',
  company: 'Weber Bad & Heizung',
  name: 'Thomas Weber',
  trades: ['shk'],
  zip: '76131',
  city: 'Karlsruhe',
  phone: '0721 1',
  about: '',
  createdAt: '2026-11-19T08:00:00.000Z',
};

describe('Webseite', () => {
  it('ergänzt https:// und macht den Host klein', () => {
    expect(normalizeWebsite('www.Elektro-Kaya.de')).toBe('https://www.elektro-kaya.de');
    expect(normalizeWebsite('  http://kaya.de/kontakt ')).toBe('http://kaya.de/kontakt');
    expect(normalizeWebsite('https://kaya.de/')).toBe('https://kaya.de');
    expect(normalizeWebsite('müller-bau.de')).toBe('https://müller-bau.de');
  });

  it('leer ist erlaubt (ohne Webseite eintragen)', () => {
    expect(normalizeWebsite('')).toBeUndefined();
    expect(normalizeWebsite('   ')).toBeUndefined();
  });

  it('lehnt Unsinn ab', () => {
    expect(normalizeWebsite('kaya')).toBeNull();
    expect(normalizeWebsite('kaya elektro.de')).toBeNull();
    expect(normalizeWebsite('ftp://kaya.de')).toBeNull();
    expect(normalizeWebsite('kaya.d')).toBeNull();
  });

  it('zeigt den Host kurz an', () => {
    expect(websiteHost('https://www.elektro-kaya.de/')).toBe('elektro-kaya.de');
  });
});

describe('Eintragen prüfen', () => {
  const ok = { ...weber, website: '' };
  it('alles gut', () => expect(validateProfile(ok, texts)).toEqual({}));
  it('meldet E-Mail, PLZ, Gewerk und Webseite', () => {
    expect(
      validateProfile(
        { ...ok, email: 'weber@', zip: '7613', trades: [], website: 'quatsch', company: ' ' },
        texts,
      ),
    ).toEqual({ email: 'E', zip: 'Z', trades: 'G', website: 'W', company: 'P' });
  });
});

describe('Jobs für mich', () => {
  it('nur offen, mein Gewerk, mein PLZ-Gebiet, nicht von mir', () => {
    // r1 (SHK, 76229) und r3 (SHK, 76307) passen; r6 ist Fliesen in 75…, r4 vergeben.
    expect(referralsForMe(weber, referrals).map((r) => r.id)).toEqual(['r1', 'r3']);
  });

  it('direkt an mich geschoben zählt auch bei fremdem Gewerk', () => {
    const direct = { ...referrals[4]!, id: 'rx', toId: 'me' };
    expect(referralsForMe(weber, [direct]).map((r) => r.id)).toEqual(['rx']);
  });

  it('direkt an jemand anderen sehe ich nicht', () => {
    const other = { ...referrals[0]!, id: 'ry', toId: 'h8' };
    expect(referralsForMe(weber, [other])).toEqual([]);
  });

  it('vergebene und eigene Jobs getrennt', () => {
    const novak = craftsmen.find((c) => c.id === 'h4')!;
    expect(referralsTakenByMe(novak, referrals).map((r) => r.id)).toEqual(['r4']);
    const schaefer = craftsmen.find((c) => c.id === 'h1')!;
    expect(
      referralsFromMe(schaefer, referrals)
        .map((r) => r.id)
        .sort(),
    ).toEqual(['r1', 'r2']);
  });
});

describe('Verzeichnis', () => {
  it('sucht nach Ort und Gewerk', () => {
    expect(searchCraftsmen(craftsmen, 'ettlingen', 'alle').map((c) => c.id)).toEqual(['h4']);
    expect(searchCraftsmen(craftsmen, '', 'elektro').map((c) => c.id)).toEqual(['h8', 'h2']);
    expect(searchCraftsmen(craftsmen, 'maler', 'alle').map((c) => c.id)).toEqual(['h3']);
  });
});

describe('Netzwerk-Speicher', () => {
  beforeEach(() => useNetwork.setState(useNetwork.getInitialState(), true));

  it('eintragen, Job weitergeben, Interesse, vergeben', () => {
    const s = useNetwork.getState();
    const { id: _id, createdAt: _c, ...input } = weber;
    const meId = s.saveProfile(input);
    expect(useNetwork.getState().meId).toBe(meId);

    const rid = useNetwork.getState().addReferral({
      trade: 'elektro',
      title: 'Bad: neue Leitungen',
      details: '',
      zip: '76131',
      city: 'Karlsruhe',
      when: 'KW 2',
    });
    const created = useNetwork.getState().referrals.find((r) => r.id === rid)!;
    expect(created).toMatchObject({ fromId: meId, status: 'offen', interested: [] });

    // Kaya ist Elektriker in 76…: sieht den Job.
    const kaya = useNetwork.getState().craftsmen.find((c) => c.id === 'h2')!;
    expect(referralsForMe(kaya, useNetwork.getState().referrals).map((r) => r.id)).toContain(rid);

    useNetwork.getState().assign(rid, 'h2');
    const done = useNetwork.getState().referrals.find((r) => r.id === rid)!;
    expect(done).toMatchObject({ status: 'vergeben', takenById: 'h2' });
  });

  it('Interesse an- und abmelden', () => {
    const { id: _id, createdAt: _c, ...input } = weber;
    const meId = useNetwork.getState().saveProfile(input);
    useNetwork.getState().toggleInterest('r1');
    expect(useNetwork.getState().referrals.find((r) => r.id === 'r1')!.interested).toEqual([meId]);
    useNetwork.getState().toggleInterest('r1');
    expect(useNetwork.getState().referrals.find((r) => r.id === 'r1')!.interested).toEqual([]);
  });

  it('Eintrag löschen zieht eigene offene Jobs zurück', () => {
    const { id: _id, createdAt: _c, ...input } = weber;
    useNetwork.getState().saveProfile(input);
    const rid = useNetwork.getState().addReferral({
      trade: 'maler',
      title: 'Streichen',
      details: '',
      zip: '76131',
      city: 'Karlsruhe',
      when: '',
    });
    useNetwork.getState().removeProfile();
    const s = useNetwork.getState();
    expect(s.meId).toBeNull();
    expect(s.craftsmen.some((c) => c.company === weber.company)).toBe(false);
    expect(s.referrals.find((r) => r.id === rid)!.status).toBe('zurueckgezogen');
  });

  it('Job weitergeben geht nur eingetragen', () => {
    expect(() =>
      useNetwork.getState().addReferral({
        trade: 'maler',
        title: 'x',
        details: '',
        zip: '76131',
        city: 'K',
        when: '',
      }),
    ).toThrow();
  });
});
