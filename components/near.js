// npm
import { useState, useEffect } from "react"
import { withRouter } from "next/router"
import { get, set } from "idb-keyval"

// self
import Dentist from "./dentist.js"

const language = "fr-CA"
const radius = 4000
const nDecimals = 4
const decimalMultiplier = 10 ** nDecimals

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

// const cachedGetDetails = (placeId) => cachedFetch("getDetails", { placeId, fields })

const cachedNearbySearch = (location) =>
  cachedFetch("nearbySearch", { type: "dentist", radius, location })

/*
const lolo = {
  "address_components": [
    {
      "long_name": "H2K 4B6",
      "short_name": "H2K 4B6",
      "types": [
        "postal_code"
      ]
    },
    {
      "long_name": "Le Plateau-Mont-Royal",
      "short_name": "Le Plateau-Mont-Royal",
      "types": [
        "political",
        "sublocality",
        "sublocality_level_1"
      ]
    },
    {
      "long_name": "Montréal",
      "short_name": "Montréal",
      "types": [
        "locality",
        "political"
      ]
    },
    {
      "long_name": "Communauté-Urbaine-de-Montréal",
      "short_name": "Communauté-Urbaine-de-Montréal",
      "types": [
        "administrative_area_level_2",
        "political"
      ]
    },
    {
      "long_name": "Québec",
      "short_name": "QC",
      "types": [
        "administrative_area_level_1",
        "political"
      ]
    },
    {
      "long_name": "Canada",
      "short_name": "CA",
      "types": [
        "country",
        "political"
      ]
    }
  ],
  "formatted_address": "Montréal, QC H2K 4B6, Canada",
  "geometry": {
    "bounds": {
      "northeast": {
        "lat": 45.5306083,
        "lng": -73.5635049
      },
      "southwest": {
        "lat": 45.5292948,
        "lng": -73.5661816
      }
    },
    "location": {
      "lat": 45.52998059999999,
      "lng": -73.5651074
    },
    "location_type": "APPROXIMATE",
    "viewport": {
      "northeast": {
        "lat": 45.5313005302915,
        "lng": -73.56349426970849
      },
      "southwest": {
        "lat": 45.5286025697085,
        "lng": -73.56619223029149
      }
    }
  },
  "place_id": "ChIJ_5bTy8AbyUwRcnyFDErLogo",
  "types": [
    "postal_code"
  ]
}
*/

const byRating = (a, b) => {
  if (!b.rating) return 1
  if (a.rating > b.rating) return 1
  if (a.rating < b.rating) return -1
  if (a.user_ratings_total > b.user_ratings_total) return 1
  if (a.user_ratings_total < b.user_ratings_total) return -1
}

const Thing = (props) => {
  const [min, setMin] = useState(0)
  const [where, setWhere] = useState()
  const [dentists, setDentists] = useState([])
  const [selectedDentists, setSelectedDentists] = useState([])

  // const minRating = ({ rating }) => !min || (rating >= min)

  useEffect(() => {
    // console.log("effect-dentists", typeof dentists)
    if (!dentists) return
    const minRating = min > 0 ? ({ rating }) => rating >= min : () => true

    // console.log("effect-dentists step 2")
    setSelectedDentists(
      dentists
        .filter(minRating)
        .sort(byRating)
        .reverse()
    )
  }, [dentists, min])

  useEffect(() => {
    const zipKey = ["zip", language, props.router.query.zip].join(":")
    console.log("zipKey", zipKey)
    get(zipKey)
      .then((val) => {
        if (!val) throw new Error("Key not found in db.")
        setWhere(val)
        return cachedNearbySearch(val.geometry.location)
      })
      .then((gg) =>
        Promise.all(
          gg.map((obj) => {
            const key = ["place", language, obj.place_id].join(":")
            return get(key).then((z) => {
              if (z) return z
              return set(key, obj).then(() => obj)
            })
            // return set(key, obj)
          })
          // ).then(() => gg)
        )
      )
      .then(setDentists)
    // .then(setWhere)

    // setWhere(props.router.query.zip)
  }, [])

  // console.log('comp-props-router.query', props.router.query)
  // console.log('page-props-k', Object.keys(Router))
  /*
  if (typeof window !== 'undefined') {
    console.log('comp-props.asPath', Router.asPath)
    console.log('comp-props.query', Router.query)
    console.log('comp-props.pathname', Router.pathname)
  }
  */

  const change = (ev) => setMin(ev.target.value)

  return (
    <div>
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

      <div>Thing</div>
      {where && selectedDentists.length ? (
        <>
          <p>{where.formatted_address}</p>
          <pre>{JSON.stringify(where.geometry.location)}</pre>
          <div>
            {selectedDentists.length} shown of {dentists.length} nearby
          </div>
          {selectedDentists.map((dentist) => (
            <Dentist key={dentist.place_id} {...dentist} />
          ))}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  )
}

export default withRouter(Thing)
