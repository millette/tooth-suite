// npm
import Link from "next/link"
import React from "react"
import { MDXProvider } from "@mdx-js/react"

// self
import Button from "../components/button.js"

const components = {
  Button,
  a: (props) =>
    props.href.indexOf("//") === -1 ? (
      <Link href={props.href}>
        <a>{props.children}</a>
      </Link>
    ) : (
      <a target="_blank" rel="noopener noreferrer" href={props.href}>
        ⧉&nbsp;{props.children}
      </a>
    ),
}

export default ({ Component, pageProps }) => (
  <MDXProvider components={components}>
    <Component {...pageProps} />
  </MDXProvider>
)
