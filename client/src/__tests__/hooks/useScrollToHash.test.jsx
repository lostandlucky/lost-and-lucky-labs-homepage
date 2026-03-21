import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useScrollToHash } from '../../hooks/useScrollToHash.js';

function wrapper({ initialEntries = ['/'] } = {}) {
  return ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );
}

describe('useScrollToHash', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls to the element matching the URL hash on mount', () => {
    const scrollIntoView = vi.fn();
    const mockElement = { scrollIntoView };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

    renderHook(() => useScrollToHash(), {
      wrapper: wrapper({ initialEntries: ['/#portfolio'] }),
    });

    expect(document.getElementById).toHaveBeenCalledWith('portfolio');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('does nothing when no hash is present', () => {
    vi.spyOn(document, 'getElementById');
    renderHook(() => useScrollToHash(), {
      wrapper: wrapper({ initialEntries: ['/'] }),
    });

    expect(document.getElementById).not.toHaveBeenCalled();
  });

  it('uses MutationObserver when element is not yet in the DOM', async () => {
    const scrollIntoView = vi.fn();
    vi.spyOn(document, 'getElementById').mockReturnValue(null);

    renderHook(() => useScrollToHash(), {
      wrapper: wrapper({ initialEntries: ['/#portfolio'] }),
    });

    expect(scrollIntoView).not.toHaveBeenCalled();

    // Simulate the element appearing in the DOM
    const mockElement = { scrollIntoView };
    document.getElementById.mockReturnValue(mockElement);
    act(() => {
      document.body.appendChild(document.createElement('div'));
    });

    // MutationObserver callbacks are microtask-queued in jsdom
    await vi.waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });
});
