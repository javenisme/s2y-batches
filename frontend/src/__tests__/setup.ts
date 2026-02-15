import '@testing-library/jest-dom';

// Mock MUI components that might cause issues
vi.mock('@mui/material', () => {
  const actual = vi.importActual('@mui/material');
  return {
    ...actual,
    // Add mocks for specific components if needed
  };
});

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
}));

// Global test timeout
vi.setConfig({
  testTimeout: 10000,
});
