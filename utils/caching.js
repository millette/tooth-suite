// npm
import { get, set } from "idb-keyval"

const language = "fr-CA"
const radius = 4000
const nDecimals = 4
const decimalMultiplier = 10 ** nDecimals
const fields = ["formatted_phone_number", "permanently_closed", "website"]

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

// TODO: extract to utility
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

const cachedNearbySearch = (location) =>
  cachedFetch("nearbySearch", { type: "dentist", radius, location })

const cachedGetDetails = (placeId) =>
  cachedFetch("getDetails", { placeId, fields })

export { locationKey, cachedNearbySearch, cachedGetDetails, language }
