// npm
import { withRouter } from "next/router"
import { useState } from "react"
import { get, set } from "idb-keyval"
import { language } from "../utils/caching.js"

const zipRE1 = /[^A-Z0-9]/g
// const zipRE2 = /H[0-57-9]([A-Z][0-9]){2}/ // Montréal begins with H but never H6
const zipRE2 = /([A-Z][0-9]){3}/ // Canada

const normalizeZip = (zip) => {
  const x = zip.toUpperCase().replace(zipRE1, "")
  return zipRE2.test(x) ? x : ""
}

const NearPrompt = (props) => {
  const { router } = props
  const [message, setMessage] = useState("Waiting for user input...")

  const zzz = (zip) => {
    const zipKey = ["zip", language, zip].join(":")
    return get(zipKey)
      .then((val) => {
        if (val) return val
        return fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?language=${language}&region=ca&components=postal_code:${zip}&key=${
            process.env.GOOGLE_MAPS
          }`
        )
          .then((res) => res.json())
          .then(({ status, results: [result] }) => {
            if (status !== "OK") throw new Error(status)
            return Promise.all([result, set(zipKey, result)])
          })
          .then(([result]) => result)
      })
      .catch((e) => {
        throw e
      })
  }

  const submit = (ev) => {
    ev.preventDefault()
    const zip = normalizeZip(new FormData(ev.target).get("near"))
    if (!zip) return setMessage("Postal code is incomplete or invalid.")
    zzz(zip)
      .then(() => router.push({ pathname: "/near", query: { zip } }))
      .catch((e) => {
        setMessage(e.message)
      })
  }

  return (
    <div>
      <div>
        <form onSubmit={submit}>
          <p>Enter a postal code to search near.</p>
          <label>
            Press enter to submit{" "}
            <input name="near" placeholder="H2K 4B2" type="text" />
          </label>
        </form>
      </div>

      <div>{message && <p>{message}</p>}</div>
    </div>
  )
}

export default withRouter(NearPrompt)
