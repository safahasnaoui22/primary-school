// next.config.ts
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  // your existing config (if any)
};

export default withPWA({
  dest: 'public',                // where the service worker will be generated
  register: true,                // automatically register the SW
  skipWaiting: true,             // force update on new version
  disable: process.env.NODE_ENV === 'development', // disable in dev
})(nextConfig);
