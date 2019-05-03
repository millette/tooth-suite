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

// <p>And one more thing: <b>{process.env.GOOGLE_MAPS}</b>.</p>

export default ({ step = 0.1 }) => {
  const [dentists, setDentists] = useState()
  const [selectedDentists, setSelectedDentists] = useState([])
  const [near, setNear] = useState("")
  const [min, setMin] = useState(5)
  const [dir, setDir] = useState(-step)

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

  const click = () => {
    const n = min + 2 * dir
    if (n < 2.5 || n > 5) setDir(-dir)
    setMin(min + dir)
  }

  const submit = (ev) => {
    ev.preventDefault()
    const near = new FormData(ev.target).get("near")
    setNear(near)
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
            <input
              name="near"
              defaultValue={near}
              placeholder="H2K 4B2"
              type="text"
            />
          </label>
          {near && (
            <p>
              Near: <b>{near}</b>.
            </p>
          )}
        </form>
      </div>
      <div>
        {selectedDentists.length ? (
          selectedDentists.map((dentist) => (
            <Dentist key={dentist.place_id} {...dentist} />
          ))
        ) : (
          <p>Enter a postal code to search near.</p>
        )}
      </div>
    </>
  )
}
