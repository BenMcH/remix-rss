/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildTarget: "node-cjs",
  devServerPort: 8002,
  ignoredRouteFiles: [".*"],

  serverDependenciesToBundle: []
};
