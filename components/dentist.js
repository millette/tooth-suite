const style = {
  margin: "1.5rem 0",
  borderBottom: "thin dashed",
  display: "flex",
  flexFlow: "row wrap",
}

export default ({
  formatted_phone_number,
  types,
  name,
  vicinity,
  rating,
  user_ratings_total,
}) => (
  <section style={style}>
    <div style={{ flex: 1 }}>
      <h3>{name}</h3>
      <h4>{formatted_phone_number}</h4>
    </div>
    <dl style={{ flex: 1 }}>
      <dt>Rating</dt>
      <dd>
        {rating} (of {user_ratings_total})
      </dd>

      <dt>Address</dt>
      <dd>{vicinity}</dd>

      <dt>Types</dt>
      <dd>{types.join(", ")}</dd>
    </dl>
  </section>
)
