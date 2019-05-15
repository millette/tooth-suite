// npm
import { useState, useEffect } from "react"

export default ({ place_id }) => {
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
        if (ok) return setDetails(result || {})
        setMessage(`error: ${JSON.stringify(json)}`)
      })
  }, [])

  const submit = (ev) => {
    ev.preventDefault()
    const method = "PUT"
    const action = [
      process.env.JSONSTORE_SERVICE,
      process.env.JSONSTORE,
      "details",
      place_id,
    ].join("/")
    const headers = { "content-type": "application/json" }
    const fd = new FormData(ev.target)
    const q1 = fd.get("q1")
    const q2 = fd.get("q2")

    const deets = { q1, q2 }
    const body = JSON.stringify(deets)

    fetch(action, {
      headers,
      method,
      body,
    })
      .then((res) => res.json())
      .then((json) => {
        const { ok } = json
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
