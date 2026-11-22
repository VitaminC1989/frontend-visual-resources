import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 旧版页面以静态文件形式保存在 public/v1/index.html
  async rewrites() {
    return [{ source: "/v1", destination: "/v1/index.html" }];
  },
};

export default nextConfig;
