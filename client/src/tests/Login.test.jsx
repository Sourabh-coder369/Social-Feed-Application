import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';

// Create a query client for tests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Test wrapper with all required providers
const TestWrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Login Component', () => {
  it('renders login form', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    expect(screen.getByText(/Sign in to Social Feed/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Email address/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Password/i)).toBeDefined();
  });

  it('has a link to register page', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const registerLink = screen.getByText(/create a new account/i);
    expect(registerLink).toBeDefined();
  });
});
