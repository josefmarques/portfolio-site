/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/under-the-hood",
        destination: "/arquitetura",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
