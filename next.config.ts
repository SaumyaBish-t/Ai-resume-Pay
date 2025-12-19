import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental:{
    serverActions:{
      bodySizeLimit:"4mb",
    },
  },
  images:{
    remotePatterns:[{
      protocol:"https",
      hostname:"becjlmnf9vgp0w0t.public.blob.vercel-storage.com"
    }]
  }
};

export default nextConfig;
