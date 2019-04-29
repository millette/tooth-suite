"use strict"

// npm
import test from "ava"

// self
import fn from "."

test("fake it till you make it", (t) => {
  t.is(fn, 42)
})
