// npm
import { withRouter } from "next/router"
import { useState, useEffect } from "react"
import { get, set } from "idb-keyval"

// self
import Dentist from "./dentist.js"
import { cachedNearbySearch, language } from "../utils/caching.js"

const byRating = (a, b) => {
  if (!b.rating) return 1
  if (a.rating > b.rating) return 1
  if (a.rating < b.rating) return -1
  if (a.user_ratings_total > b.user_ratings_total) return 1
  if (a.user_ratings_total < b.user_ratings_total) return -1
}

const Thing = ({ router: { query } }) => {
  const [min, setMin] = useState(0)
  const [where, setWhere] = useState()
  const [dentists, setDentists] = useState([])
  const [selectedDentists, setSelectedDentists] = useState([])
  const [message, setMessage] = useState("Loading...")

  useEffect(() => {
    let p

    if (query.coords) {
      // TODO: move parsing into utility
      const [lat, lng] = query.coords.split(",").map(parseFloat)
      const location = { lat, lng }
      setWhere({ geometry: { location } })
      p = cachedNearbySearch(location)
    } else if (query.zip) {
      const zipKey = ["zip", language, query.zip].join(":")
      p = get(zipKey).then((val) => {
        if (!val) throw new Error("Nothing here.")
        setWhere(val)
        return cachedNearbySearch(val.geometry.location)
      })
    }

    if (!p) return

    p.then((gg) =>
      Promise.all(
        gg.map((obj) => {
          const key = ["place", language, obj.place_id].join(":")
          return get(key).then((z) => {
            if (z) return z
            return set(key, obj).then(() => obj)
          })
        })
      )
    )
      .then(setDentists)
      .catch((e) => setMessage(e.message))
  }, [])

  useEffect(() => {
    if (!dentists) return
    const minRating = min > 0 ? ({ rating }) => rating >= min : () => true

    setSelectedDentists(
      dentists
        .filter(minRating)
        .sort(byRating)
        .reverse()
    )
  }, [dentists, min])

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

      {where && selectedDentists.length > 0 ? (
        <>
          {where.formatted_address && <p>{where.formatted_address}</p>}
          <pre>{JSON.stringify(where.geometry.location)}</pre>
          <div>
            {selectedDentists.length} shown of {dentists.length} nearby
          </div>
          {selectedDentists.map((dentist) => (
            <Dentist key={dentist.place_id} {...dentist} />
          ))}
        </>
      ) : (
        <div>{message}</div>
      )}
    </div>
  )
}

export default withRouter(Thing)
