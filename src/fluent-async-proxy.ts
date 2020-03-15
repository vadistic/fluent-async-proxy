/** array of function arguments */
export type Args = any[]
/** name of method or array element */
export type Property = string | number
/** paths segments are provided as array of tuples of propname and array of args arrays. */
export type Segments = Array<[Property, Args[]]>
/** handler function called with path segments as argument after promise trap */
export type FluenAsyncProxyHandler = (segments: Segments) => Promise<any>

/** temporary empty segments */
const idSegmenets: Segments = []

/**
 * temporary noop fn, used before async trap is triggered,
 * $$ for safe namespacing
 */
const $$fluentAsyncProxy = () => ({})

/**
 * create arbitrary fluent APIs for async functions
 */
export const fluentAsyncProxy = <T = any>(
  handler: FluenAsyncProxyHandler,
  prev: Segments = idSegmenets,
  level: number = -1
): T =>
  new Proxy($$fluentAsyncProxy as any, {
    apply: (target, thisArg, argArray) => {
      prev[level][1] = [...prev[level][1], argArray]

      return fluentAsyncProxy(handler, prev, level)
    },
    get: (target, key) => {
      /**
       * promise trap
       * - not binding anything since it seems pointless
       * - the way it is now supports chains, await & error handling
       */

      if (key === 'then') {
        return (...args: any) => handler(prev).then(...args)
      }
      if (key === 'catch') {
        return (...args: any) => handler(prev).catch(...args)
      }
      if (key === 'finally') {
        return (...args: any) => handler(prev).finally(...args)
      }

      /**
       * return promise
       */
      if (key === 'UNWRAP') {
        return handler(prev)
      }

      /**
       *  trap any string props with recursive pathProxy
       *
       *  skips symbols, because those are not safe to log here
       *  (used by node/jest etc.)
       */
      if (typeof key === 'string' || typeof key === 'number') {
        prev[level + 1] = [key, []]
        return fluentAsyncProxy(handler, prev, level + 1)
      }

      /**
       * noop but for semantics
       */

      if ((key as any) in target) {
        const value = (target as any)[key]
        return typeof value === 'function' ? value.bind(target) : value
      }
    }
  })
