/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['wagmi', 'viem', '@tanstack/react-query'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      "@react-native-async-storage/async-storage": false,
    };
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Optimize build performance
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        wagmi: {
          test: /[\\/]node_modules[\\/](wagmi|viem)[\\/]/,
          name: 'wagmi',
          priority: 20,
          reuseExistingChunk: true,
        },
      };
    }

    return config;
  },
  images: {
    domains: ["w3s.link", "ipfs.io"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ipfs.w3s.link",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
    ],
  },
};

module.exports = nextConfig;
