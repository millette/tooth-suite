// npm
import { useState, useEffect } from "react"

// self
import { jsonStoreUrl } from "../utils/json-store.js"

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

  return (
    <div>
      <h3>Questions...</h3>
      <pre>{JSON.stringify(props, null, "  ")}</pre>
      <pre>{JSON.stringify(questions, null, "  ")}</pre>
      <pre>{JSON.stringify(message, null, "  ")}</pre>
    </div>
  )
}
