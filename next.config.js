/** @type {import('next').NextConfig} */
const r2Host = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://placeholder.r2.dev").hostname; }
  catch { return "placeholder.r2.dev"; }
})();

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: r2Host },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

module.exports = nextConfig;
