import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactForm from '../../components/ContactForm.jsx';

describe('ContactForm', () => {
  it('renders name, email, and message input fields', () => {
    render(<ContactForm onSubmit={() => {}} />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('shows validation error when name is empty on submit', async () => {
    render(<ContactForm onSubmit={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    render(<ContactForm onSubmit={() => {}} />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when message is empty on submit', async () => {
    render(<ContactForm onSubmit={() => {}} />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => {
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with form data when all fields are valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ message: 'Success' });
    render(<ContactForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'John',
        email: 'john@example.com',
        message: 'Hello there',
      });
    });
  });

  it('disables submit button while request is in flight', async () => {
    let resolvePromise;
    const onSubmit = vi.fn().mockImplementation(() => new Promise(resolve => {
      resolvePromise = resolve;
    }));

    render(<ContactForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
    });

    resolvePromise({ message: 'Success' });
  });

  it('displays success message after successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ message: 'Thank you!' });
    render(<ContactForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument();
    });
  });

  it('clears form fields after successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ message: 'Thank you!' });
    render(<ContactForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByLabelText(/message/i)).toHaveValue('');
    });
  });
});
