import type { Suggestion } from './suggestions';

/** Gewerk des Betriebs – steuert die Wortvorschläge beim Schreiben von Angeboten und Rechnungen. */
export type Trade = 'shk' | 'elektro' | 'schreiner' | 'maler' | 'fliesen' | 'trockenbau';

export const tradeLabels: Record<Trade, string> = {
  shk: 'Sanitär / Heizung',
  elektro: 'Elektriker',
  schreiner: 'Schreiner / Tischler',
  maler: 'Maler',
  fliesen: 'Fliesenleger',
  trockenbau: 'Trockenbau',
};

type Word = [name: string, unit: string, euro: number, kind?: 'arbeit'];

// Typische Positionen je Gewerk. Preise sind netto-Richtwerte zum Start – der Betrieb passt sie an.
const words: Record<Trade, Word[]> = {
  shk: [
    ['Monteurstunde', 'Std', 68, 'arbeit'],
    ['Helferstunde', 'Std', 48, 'arbeit'],
    ['Anfahrt pauschal', 'pauschal', 45, 'arbeit'],
    ['Heizkörper tauschen inkl. Ventile', 'Stk', 420],
    ['Thermostatkopf', 'Stk', 28],
    ['Hydraulischer Abgleich', 'pauschal', 650, 'arbeit'],
    ['Heizung entlüften und Druck prüfen', 'pauschal', 85, 'arbeit'],
    ['Wartung Gas-Brennwertgerät', 'pauschal', 189, 'arbeit'],
    ['Wartung Wärmepumpe', 'pauschal', 249, 'arbeit'],
    ['Kupferrohr 15 mm', 'm', 14],
    ['Pressfitting 15 mm', 'Stk', 9],
    ['Spülkasten Unterputz', 'Stk', 210],
    ['Siphon', 'Stk', 24],
    ['Eckventil', 'Stk', 18],
    ['Silikonfuge erneuern', 'm', 12, 'arbeit'],
  ],
  elektro: [
    ['Elektrikerstunde', 'Std', 65, 'arbeit'],
    ['Anfahrt pauschal', 'pauschal', 45, 'arbeit'],
    ['Steckdose unterputz', 'Stk', 38],
    ['Schalter unterputz', 'Stk', 34],
    ['Schalterdose', 'Stk', 4],
    ['Mantelleitung NYM-J 3×1,5', 'm', 2.8],
    ['Mantelleitung NYM-J 5×2,5', 'm', 5.2],
    ['Leitungsschutzschalter B16', 'Stk', 19],
    ['FI-Schutzschalter 40 A', 'Stk', 89],
    ['Unterverteilung 3-reihig', 'Stk', 240],
    ['Leuchte montieren', 'Stk', 45, 'arbeit'],
    ['Schlitz stemmen und verputzen', 'm', 22, 'arbeit'],
    ['E-Check Prüfprotokoll', 'pauschal', 149, 'arbeit'],
    ['Wallbox montieren und anschließen', 'pauschal', 690, 'arbeit'],
  ],
  schreiner: [
    ['Schreinerstunde', 'Std', 62, 'arbeit'],
    ['Anfahrt pauschal', 'pauschal', 45, 'arbeit'],
    ['Sperrholzplatte Birke 18 mm', 'm²', 48],
    ['Spanplatte beschichtet 19 mm', 'm²', 24],
    ['Spannholz / Leimholzplatte Buche 26 mm', 'm²', 72],
    ['MDF-Platte 19 mm', 'm²', 19],
    ['Multiplexplatte 21 mm', 'm²', 56],
    ['Massivholz Eiche', 'm²', 145],
    ['Kantenumleimer', 'm', 3.5],
    ['Topfscharnier', 'Stk', 6],
    ['Schubkastenauszug Vollauszug', 'Paar', 39],
    ['Innentür einbauen', 'Stk', 180, 'arbeit'],
    ['Zuschnitt nach Maß', 'pauschal', 35, 'arbeit'],
    ['Oberfläche ölen', 'm²', 18, 'arbeit'],
  ],
  maler: [
    ['Malerstunde', 'Std', 55, 'arbeit'],
    ['Anfahrt pauschal', 'pauschal', 40, 'arbeit'],
    ['Wand streichen 2× Dispersion weiß', 'm²', 9.5, 'arbeit'],
    ['Decke streichen 2×', 'm²', 11, 'arbeit'],
    ['Raufaser tapezieren', 'm²', 14, 'arbeit'],
    ['Vliestapete tapezieren', 'm²', 18, 'arbeit'],
    ['Spachteln Q3', 'm²', 12, 'arbeit'],
    ['Abkleben und Abdecken', 'pauschal', 120, 'arbeit'],
    ['Tiefengrund', 'm²', 2.5],
    ['Lackieren Tür beidseitig', 'Stk', 140, 'arbeit'],
    ['Heizkörper lackieren', 'Stk', 85, 'arbeit'],
    ['Fassade streichen Silikonharz', 'm²', 24, 'arbeit'],
  ],
  fliesen: [
    ['Fliesenlegerstunde', 'Std', 60, 'arbeit'],
    ['Anfahrt pauschal', 'pauschal', 45, 'arbeit'],
    ['Wandfliesen verlegen', 'm²', 58, 'arbeit'],
    ['Bodenfliesen verlegen', 'm²', 62, 'arbeit'],
    ['Altbelag entfernen', 'm²', 22, 'arbeit'],
    ['Abdichtung Nassbereich', 'm²', 28, 'arbeit'],
    ['Fliesenkleber flexibel 25 kg', 'Sack', 29],
    ['Fugenmörtel', 'kg', 4.5],
    ['Silikonfuge erneuern', 'm', 12, 'arbeit'],
    ['Sockelleiste Fliese', 'm', 18, 'arbeit'],
    ['Schlüter-Schiene', 'm', 14],
  ],
  trockenbau: [
    ['Trockenbauerstunde', 'Std', 58, 'arbeit'],
    ['Anfahrt pauschal', 'pauschal', 45, 'arbeit'],
    ['Ständerwand einfach beplankt', 'm²', 55, 'arbeit'],
    ['Ständerwand doppelt beplankt', 'm²', 72, 'arbeit'],
    ['Abhangdecke', 'm²', 62, 'arbeit'],
    ['Gipskartonplatte 12,5 mm', 'm²', 6],
    ['Spachteln Q2', 'm²', 9, 'arbeit'],
    ['Dämmung Mineralwolle 60 mm', 'm²', 8],
    ['CW-Profil 50', 'm', 3.2],
    ['Revisionsklappe', 'Stk', 75],
  ],
};

/** Vorschläge des Gewerks im Format der Positions-Vorschläge. */
export const tradeWords = (trade: Trade): Suggestion[] =>
  words[trade].map(([name, unit, euro]) => ({
    name,
    unit,
    unitPriceCents: Math.round(euro * 100),
    vatRate: 19,
    uses: 0,
    hint: true,
  }));

/** Arbeitskosten-Positionen (für den Hinweis nach § 35a EStG auf Privatrechnungen). */
export const isLabor = (name: string, unit: string) =>
  unit === 'Std' ||
  /stunde|anfahrt|montage|montieren|einbauen|verlegen|streichen|wartung|abgleich/i.test(name);
