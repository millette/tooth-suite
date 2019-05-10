// npm
import { withRouter } from "next/router"
import { useState } from "react"
import { get, set } from "idb-keyval"

const language = "fr-CA"

const zipRE1 = /[^A-Z0-9]/g
// const zipRE2 = /H[0-57-9]([A-Z][0-9]){2}/ // Montréal begins with H but never H6
const zipRE2 = /([A-Z][0-9]){3}/ // Canada

const normalizeZip = (zip) => {
  const x = zip.toUpperCase().replace(zipRE1, "")
  return zipRE2.test(x) ? x : ""
}

/*
const oy = {
  results: [
    {
      address_components: [
        { long_name: "H2K 4B5", short_name: "H2K 4B5", types: ["postal_code"] },
        {
          long_name: "Ville-Marie",
          short_name: "Ville-Marie",
          types: ["political", "sublocality", "sublocality_level_1"],
        },
        {
          long_name: "Montréal",
          short_name: "Montréal",
          types: ["locality", "political"],
        },
        {
          long_name: "Communauté-Urbaine-de-Montréal",
          short_name: "Communauté-Urbaine-de-Montréal",
          types: ["administrative_area_level_2", "political"],
        },
        {
          long_name: "Québec",
          short_name: "QC",
          types: ["administrative_area_level_1", "political"],
        },
        {
          long_name: "Canada",
          short_name: "CA",
          types: ["country", "political"],
        },
      ],
      formatted_address: "Montréal, QC H2K 4B5, Canada",
      geometry: {
        bounds: {
          northeast: { lat: 45.5294345, lng: -73.5610149 },
          southwest: { lat: 45.528304, lng: -73.56314859999999 },
        },
        location: { lat: 45.5289406, lng: -73.5621591 },
        location_type: "APPROXIMATE",
        viewport: {
          northeast: { lat: 45.5302182302915, lng: -73.5607327697085 },
          southwest: { lat: 45.5275202697085, lng: -73.5634307302915 },
        },
      },
      place_id: "ChIJBxz8s7gbyUwRScIut7zeEQo",
      types: ["postal_code"],
    },
  ],
  status: "OK",
}
*/

const NearPrompt = (props) => {
  const { router } = props
  /*
  useEffect(() => {
    const dbName = 'keyval-store'
    const storeName = 'keyval'

    const store = new Store(dbName, storeName)
    console.log('STORE', store)
    store._dbp.then((x) => {
      console.log('STORE', x)
      const openreq = indexedDB.open(dbName, 1)
      console.log('openreq', openreq)

      openreq.onerror = (e) => {
        console.error('e1', e)
        console.error('e2', openreq.error)
      }

      openreq.onsuccess = (ok) => {
        console.log('ok1', ok)
        console.log('ok2', openreq.result)
        openreq.result.createObjectStore(storeName)
      }

      openreq.onupgradeneeded = (x) => {
        console.log('x1:', x)
        console.log('x2:', openreq.result)
      }
    })
    .catch((e) => console.error('STORE', e))
  }, [])
  */

  /*
  const [zip, setZip] = useState()
  // const [coords, setCoords] = useState()
  const [errorMessage, setError] = useState()

  useEffect(() => {
    // console.log("effect-zip", typeof zip)
    if (!zip) return
    // console.log("effect-zip step 2")
    const zipKey = ["zip", language, zip].join(":")
    get(zipKey)
      .then(
        (val) =>
          val ||
          fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?language=${language}&region=ca&components=postal_code:${zip}&key=${
              process.env.GOOGLE_MAPS
            }`
          )
            .then((res) => res.json())
            .then((coords) => {
              if (coords && coords.results && coords.results[0])
                return set(["zip", language, zip].join(":"), coords).then(
                  () => coords
                )
              throw new Error("Invalid postal code")
            })
      )
      .then(setCoords)
      .catch((e) => {
        setCoords()
        setError(e.toString())
      })
  }, [zip])
  */

  const [message, setMessage] = useState("Waiting for user input...")
  // const [zip, setZip] = useState()

  const zzz = (zip) => {
    const zipKey = ["zip", language, zip].join(":")
    console.log("zipKey", zipKey)
    return get(zipKey)
      .then((val) => {
        console.log("VAL", typeof val, val)
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
        console.log("OUILLE", e)
        throw e
      })
  }

  const submit = (ev) => {
    ev.preventDefault()
    const zip = normalizeZip(new FormData(ev.target).get("near"))
    console.log("ZIP", zip)
    if (!zip) return setMessage("Postal code is incomplete or invalid.")
    zzz(zip)
      .then((a) => {
        console.log("submit:", zip, a)
        // Router.push({ pathname: '/near', query: { zip } }, `/near/${zip}`)
        // Router.push({ pathname: '/near', query: { zip } })
        // router.push({ pathname: '/near', query: { zip } }, `/near/${zip}`)
        router.push({ pathname: "/near", query: { zip } })
      })
      .catch((e) => {
        console.error(e)
        setMessage(e.message)
      })
    // setMessage()
    // setZip(z)
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
