// npm
import { useState, useEffect } from "react"

// self
import { jsonStoreUrl } from "../utils/json-store.js"

export default ({ place_id }) => {
  const [questions, setQuestions] = useState()
  const [details, setDetails] = useState()
  const [message, setMessage] = useState()

  useEffect(() => {
    fetch(jsonStoreUrl("questions"))
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) return json.result || []
        throw new Error(JSON.stringify(json))
      })
      .then((qqq) => {
        fetch(jsonStoreUrl(["details", place_id]))
          .then((res) => res.json())
          .then((json) => {
            const { result, ok } = json
            if (ok) {
              setQuestions(qqq)
              setDetails(result || {})
              return
            }
            throw new Error(JSON.stringify(json))
          })
      })
      .catch(setMessage)
  }, [])

  const submit = (ev) => {
    ev.preventDefault()
    const method = "PUT"
    const action = jsonStoreUrl(["details", place_id])
    const headers = { "content-type": "application/json" }

    const deets = {}
    for (const [k, v] of new FormData(ev.target).entries()) {
      if (v) deets[k] = v
    }

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
      {message && <p>{message}</p>}
      {details && (
        <form onSubmit={submit}>
          {questions.map(({ text, key }) => (
            <label key={key}>
              {key.toUpperCase()}: {text}
              <textarea name={key} defaultValue={details[key]} />
            </label>
          ))}
          <button>Submit</button>
        </form>
      )}
      {message && <p>{message}</p>}
    </div>
  )
}
