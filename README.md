# fluent-async-proxy

> Cool util for creating arbitrary async fluent APIs

Imagine you'll want fluent APIs like below ✨

Of course you can create chained objects/classes instances with load of boilerplate & some design restrictions. But there seems to be easier & more powerful way with ES6 proxies.

There are pros & cons of meta-programming, arguably it makes code harder to reason about so use responsibly. I had in mind creating/ auto-generating api clients while, but it's kind of generic path proxy for any util.

## Features

- create arbitrary fluent APIs for async functions
- delay callback execution till await/ start of promise chain
- just few lines, no dependencies (more for idea then a project)
- cjs/ esm/ typescript/ tested

```ts
const comments = await client
  .users({ email: 'vadistic@gmail.com' })
  .posts()
  .first(3)
  .comments()
  .withMetadata()

const propertiesOrFunctions = await client
  .create({type: 'user'})
  .name('Jakub')
  .refetch
  .literallyAnythingElse


const inLiterallyAnyShape = await client
  .create({type: 'user'})({arg: 2}, 'hello')()
  .name('Jakub')
  .refetch
  .literallyAnythingElse[2][3]

```

## Example

```ts
/*
 *
 * Paths are provided as array of tuples = Array<[key, calls]>
 * where calls are arrays of subsequent args arrays = any[][]
 *
 * It's not super human readable
 * but incredibly easy to reduce/map/filter/whatever
 *
 */

import {fluentAsyncProxy} from 'fluent-async-proxy'

// this handler prints paths back to code, why not^^
const handler = async (paths: Segments) =>
  paths
    .map(
      ([prop, calls]) =>
        '.' + prop +
        (calls.length === 0
          ? ''
          : calls
              .map(
                args => `(${args.map(a => JSON.stringify(a)).join(', ')})`
              )
              .join(''))
    )
    .join('\n')

const client = fluentAsyncProxy(handler)


const comments = await client
  .users({ email: 'vadistic@gmail.com' })
  .posts.first(3)
  .comments.withMetadata()

/*
 * paths:
 * [
 * [["users",[[{"email":"vadistic@gmail.com"}]]],
 * ["posts",[]],
 * ["first",[[3]]],
 * ["comments",[]],
 * ["withMetadata",[[]]]
 * ]
 *
 * result:
 * `
 * .users({"email":"vadistic@gmail.com"})
 * .posts
 * .first(3)
 * .comments
 * .withMetadata()
 * `
 */

```

## Unwrap

Before calling await or any of promise methods (then/catch/finally) the target of a proxy is only noop function.

To unwrap proxy to promise immediately (call handler), but without awaiting - there is `.UNWRAP` trap.

```ts
const t = client.something()

// still a proxy
t instanceof Promise === false

// promise from callback handler
t.UNWRAP instanceof Promise === true

```

Btw. This could be theoretically used for to use this sync-functions as well
