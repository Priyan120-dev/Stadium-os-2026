/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  outputFileTracing: false,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
