// Ergänzt app.json nur für die Live-Demo auf GitHub Pages:
// EXPO_BASE_URL=/werkakte setzt den Unterpfad der Web-Version. Ohne Variable bleibt alles wie in app.json.
module.exports = ({ config }) => {
  const baseUrl = process.env.EXPO_BASE_URL;
  if (!baseUrl) return config;
  return { ...config, experiments: { ...config.experiments, baseUrl } };
};
