// npm
import { useState, useEffect } from "react"

// self
import { jsonStoreUrl } from "../utils/json-store.js"

const details = {}

export default (props) => {
  const [dirty, setDirty] = useState()
  const [questions, setQuestions] = useState()
  const [message, setMessage] = useState()

  useEffect(() => {
    fetch(jsonStoreUrl("questions"))
      .then((res) => res.json())
      .then((json) => {
        const { result, ok } = json
        if (ok) return setQuestions(result || [])
        setMessage(`error: ${JSON.stringify(json)}`)
      })
  }, [])

  const more = (ev) => {
    ev.preventDefault()
    const prompts = [
      ...questions,
      { key: `q${questions.length + 1}`, text: "" },
    ]
    setQuestions(prompts)
  }

  const yup = dirty ? () => false : () => setDirty(true)

  const submit = (ev) => {
    ev.preventDefault()
    const x = Array.from(new FormData(ev.target).entries()).map(
      ([key, text]) => ({ key, text })
    )
    const headers = { "content-type": "application/json" }
    const method = "POST"
    const body = JSON.stringify(x)

    fetch(jsonStoreUrl("questions"), {
      headers,
      method,
      body,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) {
          setDirty(false)
          setMessage("Saved!")
          setQuestions(x)
          return
        }
        setMessage(`error: ${JSON.stringify(json)}`)
      })
  }

  return (
    <div>
      {!dirty && message && (
        <p>
          <b>{message}</b>
        </p>
      )}
      {questions ? (
        <form onSubmit={submit}>
          {questions.map(({ text, key }) => (
            <label key={key}>
              {key.toUpperCase()}
              <input
                onChange={yup}
                type="text"
                name={key}
                defaultValue={text}
              />
            </label>
          ))}
          <button onClick={more} type="button">
            More
          </button>
          <button disabled={!dirty}>Submit</button>
        </form>
      ) : (
        <p>Loading...</p>
      )}
      {!dirty && message && (
        <p>
          <b>{message}</b>
        </p>
      )}
    </div>
  )
}
