// npm
import { useState, useEffect } from "react"
import { get, set } from "idb-keyval"

// const Details = ({ router, place_id, name }) => {
export default ({ place_id, name }) => {
  const [details, setDetails] = useState()
  const [message, setMessage] = useState()

  useEffect(() => {
    fetch(
      [
        process.env.JSONSTORE_SERVICE,
        process.env.JSONSTORE,
        "details",
        place_id,
      ].join("/")
    )
      .then((res) => res.json())
      .then((json) => {
        const { result, ok } = json
        console.log("JSON: GET, ", json)
        if (ok) return setDetails(result || {})
        setMessage(`error: ${JSON.stringify(json)}`)
      })
  }, [])

  const submit = (ev) => {
    ev.preventDefault()
    console.log("submit", ev.target.method, ev.target.action)
    const method = "PUT"
    const action = [
      process.env.JSONSTORE_SERVICE,
      process.env.JSONSTORE,
      "details",
      place_id,
    ].join("/")
    const headers = { "content-type": "application/json" }

    console.log("ACTIONS", action)
    console.log("METHOD", method)

    const fd = new FormData(ev.target)
    const q1 = fd.get("q1")
    console.log("q1", q1)
    const q2 = fd.get("q2")
    console.log("q2", q2)
    // const details = {}
    // details[place_id] = { q1, q2 }
    const deets = { q1, q2 }

    // const body = JSON.stringify({ details })
    const body = JSON.stringify(deets)

    fetch(action, {
      headers,
      method,
      body,
    })
      .then((res) => res.json())
      .then((json) => {
        console.log("JSON:", method, json)
        const { ok } = json
        // if (ok) return setDetails(details[place_id])
        if (ok) return setDetails(deets)
        setMessage(`error: ${JSON.stringify(json)}`)
      })
  }

  return (
    <div>
      <h2>
        Details <small>({place_id})</small>
      </h2>

      {details && (
        <form onSubmit={submit}>
          <label>
            Q1...
            <textarea name="q1" defaultValue={details.q1} />
          </label>
          <label>
            Q2...
            <textarea name="q2" defaultValue={details.q2} />
          </label>
          <button>Submit</button>
        </form>
      )}
      {details && <pre>DETAILS: {JSON.stringify(details, null, "  ")}</pre>}
      {message && <p>{message}</p>}
    </div>
  )
}

// export default withRouter(Details)

/*

// npm
import Link from "next/link"

// self
import { locationKey, cachedNearbySearch } from "../utils/caching.js"

const style = {
  margin: "1.5rem 0",
  borderBottom: "thin dashed",
  display: "flex",
  flexFlow: "row wrap",
}

export default ({
  single,
  formatted_phone_number,
  types,
  name,
  vicinity,
  rating,
  user_ratings_total,
  website,
  place_id: id,
  geometry: { location },
}) => (
  <section style={style}>
    <div style={{ flex: 1 }}>
      <h3>
        {single ? (
          name
        ) : (
          <Link prefetch href={{ pathname: "/place", query: { id } }}>
            <a>{name}</a>
          </Link>
        )}
      </h3>
      {single && (
        <Link
          prefetch
          href={{ pathname: "/near", query: { coords: locationKey(location) } }}
        >
          <a>More nearby</a>
        </Link>
      )}
      {formatted_phone_number && <h4>☎&nbsp;{formatted_phone_number}</h4>}
      {website && (
        <h4>
          ⌂&nbsp;
          <a target="_blank" rel="noopener noreferrer" href={website}>
            {website
              .replace(/^https{0,1}:\/\/www\./, "")
              .replace(/^https{0,1}:\/\//, "")
              .replace(/\/$/, "")}
          </a>
        </h4>
      )}
    </div>
    <dl style={{ flex: 1 }}>
      {rating && (
        <>
          <dt>Rating</dt>
          <dd>
            {rating} (of {user_ratings_total})
          </dd>
        </>
      )}

      <dt>Address</dt>
      <dd>{vicinity}</dd>

      <dt>Types</dt>
      <dd>{types.join(", ")}</dd>
    </dl>
  </section>
)

*/
