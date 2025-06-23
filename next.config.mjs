/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
