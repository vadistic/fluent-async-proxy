import { fluentAsyncProxy, Segments } from '../src'

describe('example', () => {
  it('works', async () => {
    /**
     *
     * Paths are provided as array of tuples of [key, calls],
     * where calls are arrays of subsequent args arrays
     *
     * It's not super human readable but incredibly easy to reduce/map/filter
     *
     */

    // prints paths back to code^^
    const handler = async (paths: Segments) =>
      paths
        .map(
          ([prop, calls]) =>
            '.' +
            prop +
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

    /*
     * callback paths:
     * ```
     * [["users",[[{"email":"vadistic@gmail.com"}]]],
     * ["posts",[]],
     * ["first",[[3]]],
     * ["comments",[]],
     * ["withMetadata",[[]]]]
     * ```
     */

    const comments = await client
      .users({ email: 'vadistic@gmail.com' })
      .posts.first(3)
      .comments.withMetadata()

    /*
     * result:
     * users({"email":"vadistic@gmail.com"})
     * posts
     * first(3)
     * comments
     * withMetadata()
     */

    const fixture = `
    .users({"email":"vadistic@gmail.com"})
    .posts
    .first(3)
    .comments
    .withMetadata()
    `
      .trim()
      .split('\n')
      .map(v => v.trim())
      .join('\n')

    expect(comments).toBe(fixture)
  })
})
