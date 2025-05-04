/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "rsuhwfvuwikctq7h.public.blob.vercel-storage.com",
      "vercel-blob.com",
    ],
  },
  // Enable static file serving for the data directory
  async rewrites() {
    return [
      {
        source: "/data/:path*",
        destination: "/api/:path*",
      },
    ];
  },
  // Configure webpack to handle JSON files
  webpack: (
    config: {
      module: { rules: { test: RegExp; use: string; type: string }[] };
    },
    { isServer }: any
  ) => {
    // Add JSON file handling
    config.module.rules.push({
      test: /\.json$/,
      use: "json-loader",
      type: "javascript/auto",
    });

    return config;
  },
};

module.exports = nextConfig;
