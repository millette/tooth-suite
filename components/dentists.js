// npm
import { useState, useEffect } from "react"
import { get, set } from "idb-keyval"

// self
import Dentist from "./dentist"

const num = () => Math.max(1000, Math.floor(Math.random() * 10000))

/*
const fix = (x) => ({
  ...x,
  phone: `514-555-${num()}`,
})
*/

// const displayZip = (zip) => [zip.slice(0, 3), zip.slice(3)].join(' ')

const language = "fr-CA"

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

export default ({ step = 0.1 }) => {
  // const [dentists, setDentists] = useState()
  const [selectedDentists, setSelectedDentists] = useState([])
  // const [near, setNear] = useState("")
  const [zip, setZip] = useState()
  const [coords, setCoords] = useState()
  const [min, setMin] = useState(5)
  const [dir, setDir] = useState(-step)

  /*
  const minRating = ({ rating }) => rating >= min

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

  useEffect(() => {
    if (!dentists) return
    setSelectedDentists(
      dentists
        .filter(minRating)
        .sort(byRating)
        .reverse()
    )
  }, [dentists, min])
  */

  useEffect(() => {
    if (!zip) return
    get(["zip", language, zip].join(":"))
      .then(
        (val) =>
          val ||
          fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?language=${language}&region=ca&components=postal_code:${zip}&key=${
              process.env.GOOGLE_MAPS
            }`
          )
            .then((res) => res.json())
            .then((x) => {
              return set(["zip", language, zip].join(":"), x).then(() => x)
            })
      )
      .then(setCoords)
  }, [zip])

  const click = () => {
    const n = min + 2 * dir
    if (n < 2.5 || n > 5) setDir(-dir)
    setMin(min + dir)
  }

  const submit = (ev) => {
    ev.preventDefault()
    const zip = normalizeZip(new FormData(ev.target).get("near"))
    // setNear(near)
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
          {selectedDentists && `/${selectedDentists.length} total`})
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
              Near <b>{coords.results[0].formatted_address}</b>.<br />
              {coords.results[0].place_id}
              <br />
              {JSON.stringify(coords.results[0].geometry.location)}
            </p>
          )}
        </form>
      </div>
      {selectedDentists.length ? (
        selectedDentists.map((dentist) => (
          <Dentist key={dentist.place_id} {...dentist} />
        ))
      ) : (
        <p>Enter a postal code to search near.</p>
      )}
    </>
  )
}
