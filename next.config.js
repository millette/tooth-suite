"use strict"

// npm
// const collapse = require('remark-collapse')
// const normalize = require('remark-normalize-headings')
// const toc = require('remark-toc')
const slug = require("remark-slug")
const autolink = require("remark-autolink-headings")
const sectionize = require("remark-sectionize")
const withMDX = require("@next/mdx")({
  options: {
    remarkPlugins: [
      // normalize,
      slug,
      autolink,
      // toc,
      sectionize,
      // [collapse, { test: "Header level 2" }],
    ],
  },
})

module.exports = withMDX({
  pageExtensions: ["js", "jsx", "mdx"],
})
