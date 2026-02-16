import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*', 'clsx', 'tailwind-merge'],
  },
};
export default nextConfig;