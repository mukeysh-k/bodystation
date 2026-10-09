/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Do not reuse a previously opened admin page. Counts must match the database.
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

export default nextConfig;
