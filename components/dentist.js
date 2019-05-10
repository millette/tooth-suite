import Link from "next/link"

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
          <Link href={{ pathname: "/place", query: { id } }}>
            <a>{name}</a>
          </Link>
        )}
      </h3>
      {single && <pre>{JSON.stringify(location, null, "  ")}</pre>}
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
