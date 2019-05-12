// npm
import { withRouter } from "next/router"
import { useState, useEffect } from "react"
import { get, set } from "idb-keyval"

// self
import Dentist from "./dentist.js"
import { cachedGetDetails, language } from "../utils/caching.js"

const Place = ({ router }) => {
  const [place, setPlace] = useState()

  useEffect(() => {
    const key = ["place", language, router.query.id].join(":")
    get(key)
      .then((place) => {
        if (!place) throw new Error("Place not in db.")
        return place
      })
      .then(setPlace)
  }, [])

  useEffect(() => {
    if (!place || place.website || place.formatted_phone_number) return
    const key = ["place", language, place.place_id].join(":")

    cachedGetDetails(place.place_id)
      .then((x) => {
        const oy = {
          ...place,
          ...x,
        }
        return oy
      })
      .then((y) => set(key, y).then(() => y))
      .then(setPlace)
  }, [place])

  if (!place) return <div>Loading...</div>

  return (
    <>
      <h2>{place.name}</h2>
      <Dentist {...place} single={true} />
    </>
  )
}

export default withRouter(Place)
