"use strict"

// core
const { join } = require("path")

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

const path = join(__dirname, ".env")

module.exports = withMDX({
  pageExtensions: ["js", "jsx", "mdx"],
  webpack: (config) => {
    const dots = new Dotenv({ path })
    if (config.plugins) {
      config.plugins.push(dots)
    } else {
      config.plugins = [dots]
    }
    return config
  },
})
