"use strict"

// core
const { join } = require("path")

// npm
const withImages = require("next-images")
const Dotenv = require("dotenv-webpack")
const withMDX = require("@next/mdx")({
  options: {
    remarkPlugins: [
      require("remark-slug"),
      require("remark-autolink-headings"),
      require("remark-sectionize"),
    ],
  },
})

// self
// Taken from https://github.com/zeit/next.js/tree/canary/packages/next-bundle-analyzer
// with updated webpack-bundle-analyzer dep
const withBundleAnalyzer = require("./lib/bundan")({
  enabled: process.env.ANALYZE === "true",
})

const path = join(__dirname, ".env")

module.exports = withBundleAnalyzer(
  withImages(
    withMDX({
      pageExtensions: ["js", "jsx", "mdx"],
      analyzeServer: ["server", "both"].includes(process.env.BUNDLE_ANALYZE),
      analyzeBrowser: ["browser", "both"].includes(process.env.BUNDLE_ANALYZE),
      bundleAnalyzerConfig: {
        server: {
          analyzerMode: "static",
          reportFilename: "../bundles/server.html",
        },
        browser: {
          analyzerMode: "static",
          reportFilename: "../bundles/client.html",
        },
      },
      webpack: (config) => {
        const dots = new Dotenv({ path, safe: true, defaults: true })
        if (config.plugins) {
          config.plugins.push(dots)
        } else {
          config.plugins = [dots]
        }
        return config
      },
    })
  )
)
