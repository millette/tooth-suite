// npm
import Link from "next/link"
import React from "react"
import { MDXProvider } from "@mdx-js/react"

// self
import Dentists from "../components/dentists.js"
import Nav from "../components/nav.mdx"

const components = {
  Nav,
  Dentists,
  a: ({ href, children }) =>
    href.indexOf("://") === -1 ? (
      <Link href={href} prefetch>
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
