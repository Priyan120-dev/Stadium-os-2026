import '@testing-library/jest-dom';

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});
