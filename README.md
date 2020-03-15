# fluent-async-proxy

> Cool util for creating arbitrary async fluent APIs

Imagine you'll want to create fluent APIs like below ✨

Of course - you can create chained objects/class instances (with load of boilerplate & some design restrictions) - but there seems to be easier & more powerful way with ES6 proxies.

There are pros & cons of meta-programming, arguably - it makes code harder to reason about (so use it responsibly).

My use case was auto-generating api clients, but it's kind of generic pattern for any path proxy.

## Features

- create arbitrary fluent APIs for async functions
- delay callback execution till await/ start of promise chain
- just few lines, no dependencies (more like idea than a project)
- cjs/ esm/ typescript/ tested

## Example

Paths segments are provided as array of tuples of propname and array of args arrays.

```ts
type Segments = Array<[Propname, ArgsArray[]]>
// or
type Segments = Array<[string, any[][]>
```

It's not super human readable, but (imho) incredibly handy to reduce/map/filter/validate/whatever

```ts
import { fluentAsyncProxy } from 'fluent-async-proxy'

// this handler does nothing
const handler = (paths: Segments) => {
  /* do smth */
}

const proxy = fluentAsyncProxy(handler)

const result = await proxy
  .users({ email: 'vadistic@gmail.com' })
  .posts()
  .first(3)
  .comments.withMetadata().literallyAnythingElse[2][3]

// paths poassed to handler
// [
//   ['users', [[{ email: 'vadistic@gmail.com' }]]],
//   ['posts', [[]]],
//   ['first', [[3]]],
//   ['comments', []],
//   ['withMetadata', [[]]],
//   ['literallyAnythingElse', []],
//   ['2', []],
//   ['3', []]
// ]
```

## Installation

```sh

$ yarn add fluent-async-proxy

```

## Another Example

```ts
import { fluentAsyncProxy } from 'fluent-async-proxy'

// this handler prints paths back to code, why not^^
const handler = async (paths: Segments) =>
  paths
    .map(
      ([prop, calls]) =>
        '.' +
        prop +
        (calls.length === 0
          ? ''
          : calls
              .map(args => `(${args.map(a => JSON.stringify(a)).join(', ')})`)
              .join(''))
    )
    .join('\n')

const client = fluentAsyncProxy(handler)

const comments = await client
  .users({ email: 'vadistic@gmail.com' })
  .posts.first(3)
  .comments.withMetadata()

// paths = [
//   ['users', [[{ email: 'vadistic@gmail.com' }]]],
//   ['posts', []],
//   ['first', [[3]]],
//   ['comments', []],
//   ['withMetadata', [[]]]
// ]

// result = `
//   .users({"email":"vadistic@gmail.com"})
//   .posts
//   .first(3)
//   .comments
//   .withMetadata()
//   `
```

## Unwrap

Before calling await or any of promise methods (then/catch/finally) the target of a proxy is only noop function.

To unwrap proxy to promise/ result immediately (to get call handler), but without awaiting - there is `.UNWRAP` trap.

```ts
const t = client.something()

// still a proxy
t instanceof Promise === false

// promise from callback handler
t.UNWRAP instanceof Promise === true
```
