/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 忽略 TypeScript 类型检查错误
    ignoreBuildErrors: true,
  },
    eslint: {
    // 忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
