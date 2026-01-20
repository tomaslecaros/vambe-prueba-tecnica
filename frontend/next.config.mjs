/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Necesario para deployment con Docker
};

export default nextConfig;
