"use strict"

// core
const path = require("path")

// npm
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

module.exports = withMDX({
  pageExtensions: ["js", "jsx", "mdx"],
  webpack: (config) => {
    config.plugins = config.plugins || []
    config.plugins.push(new Dotenv({ path: path.join(__dirname, ".env") }))
    return config
  },
})
