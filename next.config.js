/** @type {import('next').NextConfig} */

const spotifyImageHosts = [
  "scontent-ams2-1.xx.fbcdn.net",
  "scontent-ams4-1.xx.fbcdn.net",
  "scontent-ams4-2.xx.fbcdn.net",
];
const nextConfig = {
  images: {
    domains: spotifyImageHosts,
  },
};

module.exports = nextConfig;
