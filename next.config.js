/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) =>
  initOpenNextCloudflareForDev()
);
