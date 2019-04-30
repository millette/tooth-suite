"use strict"

// npm
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
})
