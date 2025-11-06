import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

describe('Login Component', () => {
  it('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText(/Sign in to Social Feed/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Email address/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Password/i)).toBeDefined();
  });

  it('has a link to register page', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const registerLink = screen.getByText(/create a new account/i);
    expect(registerLink).toBeDefined();
  });
});
