// npm
import Link from "next/link"
import React from "react"
import { MDXProvider } from "@mdx-js/react"

// self
import Button from "../components/button.js"

const components = {
  Button,
  a: ({ href, children }) =>
    href.indexOf("://") === -1 ? (
      <Link href={href}>
        <a>{children}</a>
      </Link>
    ) : (
      <a target="_blank" rel="noopener noreferrer" href={href}>
        <sup>⧉</sup>&nbsp;{children}
      </a>
    ),
}

export default ({ Component, pageProps }) => (
  <MDXProvider components={components}>
    <Component {...pageProps} />
  </MDXProvider>
)
