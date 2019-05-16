// npm
import Link from "next/link"

// self
import iii from "../static/tooth.png"

// [Tooth Suite!](/) [![Broken tooth](/static/tooth.png)](/)

export default () => (
  <h1>
    <Link href="/" prefetch>
      <a>Tooth Suite!</a>
    </Link>
    <Link href="/" prefetch>
      <a>
        <img src={iii} />
      </a>
    </Link>
  </h1>
)
