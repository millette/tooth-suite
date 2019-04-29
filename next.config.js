const withMDX = require("@next/mdx")({
  // extension: /\.mdx?$/,
  /*
  options: {
    mdPlugins
  }
  */
})

module.exports = withMDX({
  pageExtensions: ["js", "jsx", "mdx"],
})
