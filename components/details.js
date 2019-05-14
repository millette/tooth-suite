// npm
import { useState, useEffect } from "react"
import { get, set } from "idb-keyval"

// const Details = ({ router, place_id, name }) => {
export default ({ place_id, name }) => {
  const [details, setDetails] = useState()

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
        console.log("JSON:", json)
        setDetails(json)
      })
  }, [])

  const submit = (ev) => {
    ev.preventDefault()
    console.log("submit", ev.target.action, ev.target.method)

    const fd = new FormData(ev.target)
    const z = fd.get("q1")
    console.log("z", z)
    const details = {}
    details[place_id] = {
      q1: z,
    }

    fetch([process.env.JSONSTORE_SERVICE, process.env.JSONSTORE].join("/"), {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      // body: JSON.stringify({ details }),
      body: JSON.stringify({ details }),
    })
      .then((res) => res.json())
      .then((json) => {
        console.log("JSON:", json)
      })
  }

  return (
    <div>
      <h2>Details about {name}</h2>
      <h3>({place_id})</h3>
      <form
        onSubmit={submit}
        method="post"
        action={[
          process.env.JSONSTORE_SERVICE,
          process.env.JSONSTORE,
          "details",
          place_id,
        ].join("/")}
      >
        <label>
          Q1...
          <textarea name="q1" />
        </label>
        <button>Submit</button>
      </form>
      <p>{process.env.JSONSTORE_SERVICE}</p>
      <p>{process.env.JSONSTORE}</p>
      {details && <pre>DETAILS: {JSON.stringify(details, null, "  ")}</pre>}
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
