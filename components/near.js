// npm
import { withRouter } from "next/router"
import { useState, useEffect } from "react"
import { get, set } from "idb-keyval"

// self
import Dentist from "./dentist.js"
import { cachedNearbySearch } from "../utils/caching.js"

const language = "fr-CA"

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

  useEffect(() => {
    const zipKey = ["zip", language, props.router.query.zip].join(":")
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
          })
        )
      )
      .then(setDentists)
  }, [])

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
