/** @type {import('next').NextConfig} */
const nextConfig = {
  // Agar images ya external data hai toh domains allow karein
  images: {
    domains: ['localhost', '192.168.0.108'], 
  },
};
export default nextConfig;