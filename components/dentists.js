import React, { useState, useEffect } from "react"

export default () => {
  const [results, setResults] = useState()

  useEffect(() => {
    if (results) return
    fetch("/static/dentists.json")
      .then((res) => res.json())
      .then((json) => json.results)
      .then(setResults)
  })

  return (
    <div>
      <h2>List</h2>
      {results ? (
        <ul>
          {results.map((dentist, i) => (
            <li key={i}>
              <pre>{JSON.stringify(dentist, null, "  ")}</pre>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}
