const jsonStoreUrl = (p) =>
  new URL(
    p
      ? [process.env.JSONSTORE, ...(Array.isArray(p) ? p : [p])].join("/")
      : process.env.JSONSTORE,
    process.env.JSONSTORE_SERVICE
  ).href

export { jsonStoreUrl }
