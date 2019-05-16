// npm
import { useState, useEffect } from "react"

// self
import { jsonStoreUrl } from "../utils/json-store.js"

const details = {}

export default (props) => {
  const [questions, setQuestions] = useState(false)
  const [message, setMessage] = useState(false)

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
    console.log("PROMPTS", prompts)
    setQuestions(prompts)
  }

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
        if (json.ok) return setQuestions(x)
        setMessage(`error: ${JSON.stringify(json)}`)
      })
  }

  return (
    <div>
      {message && <p>{message}</p>}
      {questions && (
        <form onSubmit={submit}>
          {questions.map(({ text, key }) => (
            <label key={key}>
              {key.toUpperCase()}
              <input type="text" name={key} defaultValue={text} />
            </label>
          ))}
          <button onClick={more} type="button">
            More
          </button>
          <button>Submit</button>
        </form>
      )}
      {message && <p>{message}</p>}
    </div>
  )
}