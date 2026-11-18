// Gerätespeicher in Tests: Speicher-Attrappe statt echtem AsyncStorage.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
