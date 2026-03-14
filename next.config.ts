import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_ACTIONS ? "/automation-opportunity-scorer" : "",
  assetPrefix: process.env.GITHUB_ACTIONS
    ? "/automation-opportunity-scorer/"
    : "",
};

export default nextConfig;
