/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // Agar aapka local server kisi specific port par hai
      },
      {
        protocol: 'http',
        hostname: '192.168.0.108',
        pathname: '/**', // Isse is IP ke saare images allow ho jayenge
      },
    ],
  },
};

export default nextConfig;