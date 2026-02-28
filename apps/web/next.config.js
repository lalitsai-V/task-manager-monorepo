/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

module.exports = nextConfig;