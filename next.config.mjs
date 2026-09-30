/**
 * API_PROXY_TARGET is the backend origin (e.g. https://voltaris-api.onrender.com).
 * The browser calls /api/v1/* on this site and Next forwards it there, so the
 * session and CSRF cookies are first-party: SameSite=Lax works, the CSRF cookie
 * is readable by our own JavaScript, and no browser third-party-cookie policy
 * can break sign-in. Server-side rendering calls the backend directly through
 * API_INTERNAL_BASE_URL.
 */
const apiTarget = (process.env.API_PROXY_TARGET ?? '').replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: '..',
  },
  async rewrites() {
    if (!apiTarget) return [];
    return [{ source: '/api/v1/:path*', destination: `${apiTarget}/api/v1/:path*` }];
  },
};

export default nextConfig;
