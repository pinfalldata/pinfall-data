const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // 1. Ton stockage Supabase (Specifique à ton projet)
      {
        protocol: 'https',
        hostname: 'xusywypjmogzbizrwruv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**', // Autorise toutes les images dans le dossier public
      },
      // 2. Postimg (Liens directs - le plus important)
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
      // 3. Postimg (Site web - au cas où)
      {
        protocol: 'https',
        hostname: 'postimg.cc',
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);