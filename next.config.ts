import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const root = dirname(__filename);

const nextConfig: NextConfig = {
  turbopack: {
    root,
  },
};

export default nextConfig;
