import { describe, expect, it } from 'vitest';
import { ApiError, displayMessage, isApiFailure } from '../errors';

describe('ApiError', () => {
  it('recognises a not-found by status or code', () => {
    expect(new ApiError('X', 'x', 404).isNotFound).toBe(true);
    expect(new ApiError('VEHICLE_NOT_FOUND', 'x', 200).isNotFound).toBe(true);
  });

  it('treats network and server failures as retryable, client errors as not', () => {
    expect(new ApiError('NETWORK_ERROR', 'x', 0).isRetryable).toBe(true);
    expect(new ApiError('X', 'x', 503).isRetryable).toBe(true);
    expect(new ApiError('X', 'x', 422).isRetryable).toBe(false);
  });
});

describe('displayMessage', () => {
  it('maps a known code to human copy', () => {
    expect(displayMessage(new ApiError('VEHICLE_NOT_FOUND', 'row 12 missing', 404))).toBe(
      'This vehicle is no longer listed.',
    );
  });

  it('never leaks an unmapped backend message to the page', () => {
    const leaky = new ApiError('DB_ERROR', 'psql: relation "vehicles" does not exist', 500);
    expect(displayMessage(leaky)).not.toContain('psql');
  });

  it('handles a non-ApiError without throwing', () => {
    expect(displayMessage(new TypeError('boom'))).toBeTruthy();
  });
});

describe('isApiFailure', () => {
  it('recognises the documented error envelope', () => {
    expect(isApiFailure({ success: false, error: { code: 'X', message: 'y' } })).toBe(true);
  });

  it('rejects a success envelope and junk', () => {
    expect(isApiFailure({ success: true, data: {} })).toBe(false);
    expect(isApiFailure(null)).toBe(false);
    expect(isApiFailure('nope')).toBe(false);
  });
});
