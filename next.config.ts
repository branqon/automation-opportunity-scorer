import type { NextConfig } from "next";

const isGithubPagesBuild = process.env.BUILD_FOR_GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubPagesBuild ? "/automation-opportunity-scorer" : "",
  assetPrefix: isGithubPagesBuild ? "/automation-opportunity-scorer/" : "",
};

export default nextConfig;
