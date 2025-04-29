// For use with Vercel GitHub integration
export default {
  version: 2,
  buildCommand: "./vercel-build.sh",
  outputDirectory: "dist",
  installCommand: "npm install",
  rewrites: [
    { source: "/api/(.*)", destination: "/api/index.js" },
    { source: "/(.*)", destination: "/index.html" }
  ],
};