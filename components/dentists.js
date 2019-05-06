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

// FIXME: after many failed attempts....
const cleanObject = (obj) => {
  return obj
  // if (typeof obj !== 'object') return obj

  /*
  if (obj.geometry && obj.geometry.location) {
    obj.geometry.location = {
      lat: obj.geometry.location.lat,
      lng: obj.geometry.location.lng,
    }
  }

  return obj
  */

  /*
  return {
    ...obj,
    geometry: {
      location: {
        lat: obj.geometry.location.lat,
        lng: obj.geometry.location.lng,
      },
      viewport: obj.geometry.viewport
    }
  }
  */

  /*
  const ret = {}
  Object.keys(obj).forEach((k) => {
    ret[k] = obj[k]
  })
  return ret
  */
}

const jsonObject = (obj) => {
  // FIXME: Find cleaner way to make clonable object
  return JSON.parse(JSON.stringify(obj))
  /*
  // if (!Array.isArray(obj)) return cleanObject(obj)
  if (!Array.isArray(obj)) return obj
  const ret = obj.map(cleanObject)
  // const ret = JSON.parse(JSON.stringify(obj))
  console.log('RET', ret)
  return ret
  */
}

const cachedFetch = async (method, request) => {
  const key = makeKey(method, request)
  console.log("KEY", method, key)
  const val = await get(key)
  if (val) return val

  if (!service) {
    // TODO: Select actual dom element to hold map if/when necessary
    // const el = document.querySelector('#map')
    const el = document.createElement("div")
    // console.log('EL', el)
    service = new google.maps.places.PlacesService(el)
  }

  return new Promise((resolve) => {
    const cb = (results, status) => {
      if (status !== "OK") {
        console.log("CACHED-FETCH-METHOD", method)
        console.log("RESULTS", results)
        console.log("STATUS", status)
        throw new Error("Status not OK.")
      }
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
const zipRE2 = /H[0-57-9]([A-Z][0-9]){2}/ // Montréal begins with H but never H6
// const zipRE2 = /([A-Z][0-9]){3}/ // Canada

const normalizeZip = (zip) => {
  const x = zip.toUpperCase().replace(zipRE1, "")
  return zipRE2.test(x) ? x : ""
}

/*
var request = {
  placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  fields: ['name', 'rating', 'formatted_phone_number', 'geometry']
}
*/

const detailsPromise = (placeId) =>
  new Promise((resolve) => {
    const request = {
      placeId,
      fields,
    }
    const cb = (place, status) => {
      console.log("CB-details", place)
      if (status !== "OK") throw new Error("Details not OK.")
      resolve(place)
    }
    service.getDetails(request, cb)
  })

// TODO: remove, unused
const searchPromise = (request) =>
  new Promise((resolve) => {
    // const cb = (places, status, pagination) => {
    const cb = (places, status) => {
      console.log("CB-places", places)
      if (status !== "OK") throw new Error("Nearby not OK.")
      // console.log('CB-status', status)
      // console.log('CB-pagination', pagination)
      resolve(places)
      /*
    detailsPromise(places[0].place_id)
      .then((p) => {
        console.log('PP-orig:', places[0])
        console.log('PP-details:', p)
        resolve(places)
      })
    */
    }
    service.nearbySearch(request, cb)
  })

export default ({ step = 0.1 }) => {
  const [dentists, setDentists] = useState()
  const [selectedDentists, setSelectedDentists] = useState([])
  // const [near, setNear] = useState("")
  const [zip, setZip] = useState()
  const [coords, setCoords] = useState()
  const [min, setMin] = useState(5)
  const [dir, setDir] = useState(-step)
  const [errorMessage, setError] = useState()
  const [search, setSearch] = useState()

  const minRating = ({ rating }) => rating >= min

  /*
  useEffect(() => {
    const el = document.querySelector('#map')
    service = new google.maps.places.PlacesService(el)
    console.log('INIT MAP', service)
  }, [])
  */

  /*
  useEffect(() => {
    if (!near) {
      if (dentists && dentists.length) setDentists([])
      return
    }
    get(near)
      .then((val) => {
        if (val) return val
        return fetch(`/static/${near}.json`)
          .then((res) => res.json())
          .then((json) => {
            const results = json.results.map(fix)
            return set(near, results).then(() => results)
          })
      })
      .then(setDentists)
      .catch((e) => {
        console.error("OY2", e)
        setDentists([])
      })
  }, [near])
  */

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
    console.log("zipKey", zipKey, zip)
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
              console.log("COOOORDS", typeof coords, coords)
              throw new Error("Invalid postal code")
            })
      )
      .then(setCoords)
      .catch((e) => {
        console.error("COORDS err", e)
        setCoords(undefined)
        setError(e)
      })
  }, [zip])

  useEffect(() => {
    console.log("SEARCH-effect", typeof search, typeof dentists)
    if (!search) return
    console.log("SEARCH-effect-len", search.length)

    const xxx = (p) => cachedGetDetails(p.place_id)

    pMapSeries(search, xxx).then((x) => {
      const y = x.map((a, i) => {
        return {
          ...search[i],
          ...a,
        }
      })
      console.log("YY", y[0])
      setDentists(y)
    })

    /*
    const d2 = await Promise.all(
      // search.map((d) => cachedGetDetails(d.place_id))
    )
    */

    /*
    const d2 = search.map(async (d) => {
      const dd = await cachedGetDetails(d.place_id)
      return {
        ...d,
        ...dd
      }
    })
    */

    // setDentists(d2)

    // TODO: for each in search array, get details and push into dentists array

    // console.log('COORDS-long-lat', coords.results[0].geometry.location)
    // const { lat, lng } = coords.results[0].geometry.location
    // cachedNearbySearch(coords.results[0].geometry.location).then(setSearch)
  }, [search])

  useEffect(() => {
    console.log("COORDS-effect", typeof coords)
    if (!coords) {
      setDentists([])
      return
    }
    // console.log('COORDS-long-lat', coords.results[0].geometry.location)
    // const { lat, lng } = coords.results[0].geometry.location
    cachedNearbySearch(coords.results[0].geometry.location).then(setSearch)
  }, [coords])

  // TODO: remove, unused
  useEffect(() => {
    console.log("COORDS-effect old", typeof coords)
    return
    if (!coords) return
    console.log("COORDS-long-lat", coords.results[0].geometry.location)
    const { lat, lng } = coords.results[0].geometry.location
    const location = [lat, lng].join(",")
    const key = ["near", language, location, radius].join(":")
    console.log("COORDS-key", key)
    get(key)
      .then((val) => {
        if (val) return val

        const request = {
          type: "dentist",
          radius,
          location: coords.results[0].geometry.location,
        }
        console.log("REQUEST", request)
        return searchPromise(request).then((v) => {
          // FIXME: something in `v` can't be cloned, workaround:
          const val = JSON.parse(JSON.stringify(v))
          // The following attempts don't work:
          // const val = v.slice()
          // const val = [...v]
          // const val = v.map((x) => ({ ...x }))
          // const val = v.map((x) => Object.assign({}, x))
          console.log("VAL", key, val)
          return set(key, val).then(() => val)
        })

        // service.nearbySearch(request, cb)

        // throw new Error('Not implemented (actual search...)')
        /*
        const u = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${process.env.GOOGLE_MAPS}&location=${location}&radius=${radius}&keyword=dentist`
        console.log('NEAR-u:', u)
        return fetch(u, { mode: 'cors' })
          .then((res) => res.json())
          .then((search) => set(key, search).then(() => search))
        */
      })
      .then(setSearch)
  }, [coords])

  const click = () => {
    const n = min + 2 * dir
    if (n < 2.5 || n > 5) setDir(-dir)
    setMin(min + dir)
  }

  const submit = (ev) => {
    ev.preventDefault()
    const zip = normalizeZip(new FormData(ev.target).get("near"))
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
            selectedDentists.length &&
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
              Near <b>{coords.results[0].formatted_address}</b>{" "}
              {JSON.stringify(coords.results[0].geometry.location)}.
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
          <p>{errorMessage && errorMessage.toString()}</p>
          <p>Enter a postal code to search near.</p>
        </>
      )}
    </>
  )
}
