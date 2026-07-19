/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.33.44", "192.168.1.28"],
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
