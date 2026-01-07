module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|expo|@expo|expo-modules-core|expo-asset|expo-file-system|expo-speech|expo-localization|@react-navigation|react-native-svg|zustand)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(epub|pdf|png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^expo$': '<rootDir>/__mocks__/expo.js',
    '^expo/(.*)$': '<rootDir>/__mocks__/expo.js',
    '^expo-file-system$': '<rootDir>/__mocks__/expo-file-system.js',
    '^expo-file-system/legacy$': '<rootDir>/__mocks__/expo-file-system.js',
    '^expo-asset$': '<rootDir>/__mocks__/expo-asset.js',
    '^expo-speech$': '<rootDir>/__mocks__/expo-speech.js',
    '^expo-localization$': '<rootDir>/__mocks__/expo-localization.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
};
