import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Next mis-infer the
  // workspace root; pin it so file tracing stays project-local.
  outputFileTracingRoot: path.join(__dirname),
};
export default nextConfig;
