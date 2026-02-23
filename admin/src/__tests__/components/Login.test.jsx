import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../components/Login.jsx';

describe('Login', () => {
  it('renders username and password input fields', () => {
    render(<Login onLogin={() => {}} />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('calls login handler with credentials on submit', async () => {
    const onLogin = vi.fn().mockResolvedValue({ token: 'test-token' });
    render(<Login onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('admin', 'password123');
    });
  });

  it('displays error message for invalid credentials', async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    render(<Login onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('redirects to dashboard on successful login', async () => {
    const onLogin = vi.fn().mockResolvedValue({ token: 'test-token' });
    const onSuccess = vi.fn();
    render(<Login onLogin={onLogin} onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
