import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollToHash } from '../../hooks/useScrollToHash.js';

describe('useScrollToHash', () => {
  let originalHash;

  beforeEach(() => {
    originalHash = window.location.hash;
  });

  afterEach(() => {
    window.location.hash = originalHash;
    vi.restoreAllMocks();
  });

  it('scrolls to the element matching the URL hash on mount', () => {
    const scrollIntoView = vi.fn();
    const mockElement = { scrollIntoView };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

    window.location.hash = '#portfolio';
    renderHook(() => useScrollToHash());

    expect(document.getElementById).toHaveBeenCalledWith('portfolio');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('does nothing when no hash is present', () => {
    window.location.hash = '';
    vi.spyOn(document, 'getElementById');
    renderHook(() => useScrollToHash());

    expect(document.getElementById).not.toHaveBeenCalled();
  });
});
