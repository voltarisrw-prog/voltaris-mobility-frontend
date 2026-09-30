import { describe, expect, it } from 'vitest';
import { landingFor } from '../auth';

describe('landingFor', () => {
  it('sends staff to the admin area', () => {
    expect(landingFor({ roles: ['SUPER_ADMIN'] })).toBe('/admin');
    expect(landingFor({ roles: ['ADMIN'] })).toBe('/admin');
    expect(landingFor({ roles: ['BUYER', 'SALES_AGENT'] })).toBe('/admin');
  });
  it('sends everyone else to their account', () => {
    expect(landingFor({ roles: ['BUYER'] })).toBe('/account');
    expect(landingFor({ roles: ['SELLER', 'CONTENT_MANAGER'] })).toBe('/account');
    expect(landingFor({ roles: [] })).toBe('/account');
  });
});
