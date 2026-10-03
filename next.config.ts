import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // sharp is native; keep it external so the image pipeline works in a serverless function.
  serverExternalPackages: ['sharp'],
  // lib/image-gen.ts reads the relation templates from disk at runtime with a dynamic path, so the
  // bundler cannot trace them. Ship them with the generation function explicitly.
  outputFileTracingIncludes: {
    '/api/generate': ['./public/templates/ref/**']
  }
};

export default nextConfig;
