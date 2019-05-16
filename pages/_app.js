// npm
import Link from "next/link"
import App, { Container } from "next/app"
import { MDXProvider } from "@mdx-js/react"

// self
import Title from "../components/title.mdx"
import Near from "../components/near.js"
import NearPrompt from "../components/near-prompt.js"
import Place from "../components/place.js"
import Questions from "../components/questions.js"
import Footer from "../components/footer.mdx"

const components = {
  Title,
  Near,
  NearPrompt,
  Place,
  Questions,
  Footer,
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

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    if (!Component.getInitialProps) return {}
    const pageProps = await Component.getInitialProps(ctx)
    return { pageProps }
  }

  render() {
    const { Component, pageProps } = this.props
    return (
      <Container>
        <MDXProvider components={components}>
          <Component {...pageProps} />
        </MDXProvider>
      </Container>
    )
  }
}

export default MyApp
