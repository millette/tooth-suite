// npm
import { useState, useEffect } from "react"
import { get, set } from "idb-keyval"

// self
import Dentist from "./dentist"

const num = () => Math.max(1000, Math.floor(Math.random() * 10000))

const fix = (x) => ({
  ...x,
  phone: `514-555-${num()}`,
})

const byRating = (a, b) => {
  if (a.rating > b.rating) return 1
  if (a.rating < b.rating) return -1
  if (a.user_ratings_total > b.user_ratings_total) return 1
  if (a.user_ratings_total < b.user_ratings_total) return -1
}

export default ({ step = 0.1 }) => {
  const [dentists, setDentists] = useState()
  const [selectedDentists, setSelectedDentists] = useState()
  const [min, setMin] = useState(5)
  const [dir, setDir] = useState(-step)

  const minRating = ({ rating }) => rating >= min

  useEffect(() => {
    const key = "data"
    get(key)
      .then((val) => {
        if (val) return val
        return fetch("/static/dentists.json")
          .then((res) => res.json())
          .then((json) => {
            const results = json.results.map(fix)
            return set(key, results).then(() => results)
          })
      })
      .then(setDentists)
  }, [])

  useEffect(() => {
    if (!dentists) return
    setSelectedDentists(
      dentists
        .filter(minRating)
        .sort(byRating)
        .reverse()
    )
  }, [dentists, min])

  const click = () => {
    const n = min + 2 * dir
    if (n < 2.5 || n > 5) setDir(-dir)
    setMin(min + dir)
  }

  return (
    <div>
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
      {selectedDentists ? (
        selectedDentists.map((dentist) => (
          <Dentist key={dentist.place_id} {...dentist} />
        ))
      ) : (
        <code>Loading...</code>
      )}
    </div>
  )
}
