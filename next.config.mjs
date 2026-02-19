/** @type {import('next').NextConfig} */
const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1];
const isProd = process.env.NODE_ENV === 'production';

// For GitHub Pages: https://<user>.github.io/<repo>/
const basePath = isProd && repo ? `/${repo}` : '';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },

  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  }
};

export default nextConfig;
