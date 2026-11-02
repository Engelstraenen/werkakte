/**
 * Öffentliche Live-Demo (GitHub Pages): Build mit EXPO_PUBLIC_DEMO_MODE=1.
 * Dann ohne Supabase und ohne Anmeldung, nur mit den Beispieldaten aus src/features/demo.
 */
export const isDemoBuild = process.env.EXPO_PUBLIC_DEMO_MODE === '1';
