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
  details,
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
  <section
    title={details ? "With answers" : ""}
    style={style}
    className={details ? "with-answers" : ""}
  >
    <div style={{ flex: 1 }}>
      <h3>
        <>
          {details && (
            <small>
              <sup>*&nbsp;</sup>
            </small>
          )}

          {!single && (
            <Link prefetch href={{ pathname: "/place", query: { id } }}>
              <a>{name}</a>
            </Link>
          )}
        </>
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
