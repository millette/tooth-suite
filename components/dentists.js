// npm
import { useState, useEffect } from "react"
import { get, set } from "idb-keyval"

// self
import Dentist from "./dentist"

const language = "fr-CA"
const radius = 4000
const nDecimals = 4
const decimalMultiplier = 10 ** nDecimals
// const fields = ['formatted_phone_number', 'formatted_address', 'permanently_closed', 'website']
const fields = ["formatted_phone_number", "permanently_closed", "website"] // vicinity is good enough

// FIXME: maybe replace with use state..?
let service

const limitDecimals = (n) => {
  const [i, d] = String(
    Math.round(n * decimalMultiplier) / decimalMultiplier
  ).split(".")
  return `${i}.${String(d)
    .slice(0, 4)
    .padEnd(4, 0)}`
}

const locationKey = ({ lat, lng }) =>
  `${limitDecimals(lat)},${limitDecimals(lng)}`

const makeKey = (method, request) => {
  const keyParts = [method, language]
  switch (method) {
    case "nearbySearch":
      keyParts.push(locationKey(request.location), radius)
      break

    case "getDetails":
      keyParts.push(request.placeId)
      break

    default:
      throw new Error("Fetch method not implemented")
  }
  return keyParts.join(":")
}

const jsonObject = (obj) => JSON.parse(JSON.stringify(obj))

const cachedFetch = async (method, request) => {
  const key = makeKey(method, request)
  const val = await get(key)
  if (val) return val

  if (!service) {
    // TODO: Select actual dom element to hold map if/when necessary
    // const el = document.querySelector('#map')
    const el = document.createElement("div")
    service = new google.maps.places.PlacesService(el)
  }

  return new Promise((resolve) => {
    const cb = (results, status) => {
      if (status !== "OK" && status !== "NO_RESULTS")
        throw new Error("Status not OK.")
      // if (status !== "OK") throw new Error("Status not OK.")
      // if (!results || !Array.isArray(results)) throw new Error(`Status: ${status}.`)
      const out = jsonObject(results)
      set(key, out).then(() => resolve(out))
    }
    service[method](request, cb)
  })
}

const cachedGetDetails = (placeId) =>
  cachedFetch("getDetails", { placeId, fields })

const cachedNearbySearch = (location) =>
  cachedFetch("nearbySearch", { type: "dentist", radius, location })

const byRating = (a, b) => {
  if (!b.rating) return 1
  if (a.rating > b.rating) return 1
  if (a.rating < b.rating) return -1
  if (a.user_ratings_total > b.user_ratings_total) return 1
  if (a.user_ratings_total < b.user_ratings_total) return -1
}

const zipRE1 = /[^A-Z0-9]/g
// const zipRE2 = /H[0-57-9]([A-Z][0-9]){2}/ // Montréal begins with H but never H6
const zipRE2 = /([A-Z][0-9]){3}/ // Canada

const normalizeZip = (zip) => {
  const x = zip.toUpperCase().replace(zipRE1, "")
  return zipRE2.test(x) ? x : ""
}

export default ({ step = 0.1 }) => {
  const [dentists, setDentists] = useState()
  const [selectedDentists, setSelectedDentists] = useState([])
  const [zip, setZip] = useState()
  const [coords, setCoords] = useState()
  const [min, setMin] = useState(0)
  const [errorMessage, setError] = useState()

  const minRating = ({ rating }) => !min || rating >= min

  useEffect(() => {
    // console.log("effect-dentists", typeof dentists)
    if (!dentists) return
    // console.log("effect-dentists step 2")
    setSelectedDentists(
      dentists
        .filter(minRating)
        .sort(byRating)
        .reverse()
    )
  }, [dentists, min])

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

  useEffect(() => {
    // console.log("effect-coords", typeof coords)
    if (!coords) {
      // setDentists([])
      return
    }
    // console.log("effect-coords step 2")
    cachedNearbySearch(coords.results[0].geometry.location).then(setDentists)
  }, [coords])

  const change = (ev) => setMin(ev.target.value)

  const submit = (ev) => {
    ev.preventDefault()
    const z = normalizeZip(new FormData(ev.target).get("near"))
    if (!z) {
      setError()
      setDentists([])
      return
    }

    setError("Updating...")
    setZip(z)
  }

  const clicky = (placeId) => () => {
    const xi = dentists.findIndex(
      ({ place_id, formatted_phone_number }) =>
        !formatted_phone_number && placeId === place_id
    )
    if (xi === -1) return
    const xx = dentists.slice()
    const x = xx[xi]

    cachedGetDetails(placeId).then((val) => {
      const ret = {
        ...x,
        ...val,
      }
      xx[xi] = ret
      setDentists(xx)
    })
  }

  return (
    <>
      <h2>Dentists</h2>
      <div style={{ display: "flex", flexFlow: "row wrap" }}>
        <input
          style={{ flex: 1 }}
          onChange={change}
          defaultValue={min}
          type="range"
          min="0"
          max="5"
          step="0.1"
        />
        <div style={{ flex: 1 }}>{Math.round(min * 10) / 10} min rating</div>
      </div>

      <div>
        <form onSubmit={submit}>
          <label>
            Search (enter to submit){" "}
            <input name="near" placeholder="H2K 4B2" type="text" />
          </label>
          {zip && coords && coords.results && coords.results[0] && (
            <p>
              Near <b>{coords.results[0].formatted_address}</b>
            </p>
          )}
        </form>
      </div>
      {selectedDentists.length ? (
        <>
          <div>
            {selectedDentists.length} shown of {dentists.length} nearby
          </div>
          {selectedDentists.map((dentist) => (
            <Dentist
              onClick666={clicky(dentist.place_id)}
              key={dentist.place_id}
              {...dentist}
            />
          ))}
        </>
      ) : (
        <>
          <p>{errorMessage}</p>
          <p>Enter a postal code to search near.</p>
        </>
      )}
    </>
  )
}
