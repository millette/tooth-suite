// npm
import Document, { Html, Head, Main, NextScript } from "next/document"

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="stylesheet" href="/static/style.css" />
          <link
            rel="stylesheet"
            title="Light"
            href="https://cdn.jsdelivr.net/gh/kognise/water.css@1.4.0/dist/light.min.css"
            integrity="sha256-3AWyWETbVodg3oCrgu2/JmO4Q5JKGo+G7Ubf66bClh4="
            crossOrigin="anonymous"
          />
          <link
            rel="alternate stylesheet"
            title="Dark"
            href="https://cdn.jsdelivr.net/gh/kognise/water.css@1.4.0/dist/dark.min.css"
            integrity="sha256-a4zpugsKZqeQuXHZob2UNRXchaLIJRFdXCdi11HgAKY="
            crossOrigin="anonymous"
          />
          <style />
        </Head>
        <body>
          <Main />
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${
              process.env.GOOGLE_MAPS
            }&libraries=places`}
          />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
