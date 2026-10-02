import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // sharp is native; keep it external so the image pipeline works in a serverless function.
  serverExternalPackages: ['sharp']
};

export default nextConfig;
