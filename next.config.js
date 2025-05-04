/** @type {import('next').NextConfig} */
const nextConfig = {
    // Server-side rendering enabled for NextAuth
    images: {
        domains: [
            'randomuser.me',
            'images.unsplash.com',
            'source.unsplash.com',
            'picsum.photos',
            'webirent.netlify.app',
            'croo-rent.netlify.app'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

module.exports = nextConfig;
