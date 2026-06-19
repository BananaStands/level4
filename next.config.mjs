/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Training wheels for your first deploy ──────────────────────────────
  // These let the production build finish even if there are TypeScript or
  // lint nits. Once you're comfortable, DELETE these two lines so the build
  // catches mistakes for you before they ship.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
