// next.config.ts
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
 images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'i.pinimg.com',
    },
  ],
},
};

export default withPWA({
  dest: 'public',                // where the service worker will be generated
  register: true,                // automatically register the SW
  skipWaiting: true,             // force update on new version
  disable: process.env.NODE_ENV === 'development', // disable in dev
})(nextConfig);
