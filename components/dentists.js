// npm
import { useState, useEffect } from "react"
import { get, set } from "idb-keyval"
import pMapSeries from "p-map-series"

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
      if (status !== "OK") throw new Error("Status not OK.")
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

const detailsPromise = (placeId) =>
  new Promise((resolve) => {
    const request = {
      placeId,
      fields,
    }
    const cb = (place, status) => {
      if (status !== "OK") throw new Error("Details not OK.")
      resolve(place)
    }
    service.getDetails(request, cb)
  })

export default ({ step = 0.1 }) => {
  const [dentists, setDentists] = useState()
  const [selectedDentists, setSelectedDentists] = useState([])
  const [zip, setZip] = useState()
  const [coords, setCoords] = useState()
  const [min, setMin] = useState(3.5)
  const [dir, setDir] = useState(-step)
  const [errorMessage, setError] = useState()
  const [search, setSearch] = useState()

  const minRating = ({ rating }) => rating >= min

  useEffect(() => {
    if (!dentists) return
    setSelectedDentists(
      dentists
        .filter(minRating)
        .sort(byRating)
        .reverse()
    )
  }, [dentists, min])

  useEffect(() => {
    if (!zip) return
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
    if (!search) return
    setDentists(search)
    pMapSeries(search, (p) => cachedGetDetails(p.place_id)).then((x) => {
      const y = x.map((a, i) => {
        return {
          ...search[i],
          ...a,
        }
      })
      setError()
      setDentists(y)
    })
  }, [search])

  useEffect(() => {
    if (!coords) {
      setDentists([])
      return
    }
    cachedNearbySearch(coords.results[0].geometry.location).then(setSearch)
  }, [coords])

  const click = () => {
    const n = min + 2 * dir
    if (n < 2.5 || n > 5) setDir(-dir)
    setMin(min + dir)
  }

  const submit = (ev) => {
    ev.preventDefault()
    const zip = normalizeZip(new FormData(ev.target).get("near"))
    setError("Updating...")
    setZip(zip)
  }

  return (
    <>
      <h2
        title="Click to change minimal rating"
        style={{ cursor: "pointer" }}
        onClick={click}
      >
        List{" "}
        <small>
          ({Math.round(min * 10) / 10} min rating
          {selectedDentists &&
            selectedDentists.length > 0 &&
            `/${selectedDentists.length} shown of ${dentists.length} nearby`}
          )
        </small>
      </h2>
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
        selectedDentists.map((dentist) => (
          <Dentist key={dentist.place_id} {...dentist} />
        ))
      ) : (
        <>
          <p>{errorMessage}</p>
          <p>Enter a postal code to search near.</p>
        </>
      )}
    </>
  )
}
