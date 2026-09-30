import { describe, expect, it } from 'vitest';
import { can, landingFor } from '../auth';

describe('landingFor', () => {
  it('sends staff to the admin area', () => {
    expect(landingFor({ roles: ['SUPER_ADMIN'] })).toBe('/admin');
    expect(landingFor({ roles: ['PLATFORM_ADMIN'] })).toBe('/admin');
    expect(landingFor({ roles: ['AUDITOR'] })).toBe('/admin');
    expect(landingFor({ roles: ['CONTENT_EDITOR'] })).toBe('/admin');
  });
  it('sends everyone else to their account', () => {
    expect(landingFor({ roles: ['CUSTOMER'] })).toBe('/account');
    expect(landingFor({ roles: ['SELLER'] })).toBe('/account');
    expect(landingFor({ roles: [] })).toBe('/account');
  });
});

describe('can', () => {
  it('is true when any of the permissions is held', () => {
    expect(can({ permissions: ['users.read'] }, 'roles.assign', 'users.read')).toBe(true);
    expect(can({ permissions: ['users.read'] }, 'roles.assign')).toBe(false);
    expect(can({}, 'users.read')).toBe(false);
  });
});
