// npm
import { withRouter } from "next/router"
import { useState, useEffect } from "react"
import { get, set } from "idb-keyval"

const language = "fr-CA"
const radius = 4000
const nDecimals = 4
const decimalMultiplier = 10 ** nDecimals
const fields = ["formatted_phone_number", "permanently_closed", "website"] // vicinity is good enough

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

/*
const radius = 4000
const nDecimals = 4
const decimalMultiplier = 10 ** nDecimals

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
*/

// self
import Dentist from "./dentist.js"

const Place = ({ router }) => {
  const [place, setPlace] = useState()

  useEffect(() => {
    const key = ["place", language, router.query.id].join(":")
    console.log("KEY", key, router.query)
    get(key)
      .then((place) => {
        if (!place) throw new Error("Place not in db.")
        if (place.website || place.formatted_phone_number) return place
        return cachedGetDetails(place.place_id)
          .then((x) => {
            const oy = {
              ...place,
              ...x,
            }
            console.log("OY", oy)
            return oy
          })
          .then((y) => set(key, y).then(() => y))
      })
      .then(setPlace)
    // cachedFetch("nearbySearch", { type: "dentist", radius, location })
    // const key = makeKey(method, request)
    // const val = await get(key)
    // const key = ["nearbySearch", language, locationKey(request.location), radius].join(':')
    // console.log('place coucou')
  }, [])

  /*
  const xi = dentists.findIndex(
    ({ place_id, formatted_phone_number }) =>
      !formatted_phone_number && placeId === place_id
  )
  if (xi === -1) return
  const xx = dentists.slice()
  const x = xx[xi]
  */

  return (
    <div>
      A place
      {place && <Dentist {...place} single={true} />}
    </div>
  )
}

export default withRouter(Place)
