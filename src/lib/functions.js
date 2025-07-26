/**
 * expressive/functions.js
 *
 * Minimalist functional utility library + symbolic interpreter.
 *
 * Purpose:
 * - Pure, composable utility functions with argument-first style.
 * - Consistent semantics: all helpers prefer immutability, return values,
 *   and functional clarity (e.g., map(array, fn) instead of array.map(fn)).
 * - Includes `evaluate()` for recursive interpretation of nested symbolic trees
 *   (Lisp-style S-expression evaluation).
 *
 * Core principles:
 * - No prototype pollution or hidden mutation.
 * - Designed to work seamlessly with expressive/elements.js.
 * - Enables meta-programming where "UI as code" can be transformed before evaluation.
 *
 * Suitable for:
 * - Building symbolic interpreters.
 * - Declarative composition.
 * - Prototype replacement for core JavaScript utilities to support a Lisp-like environment.
 */

/**
 * Logical AND.
 * @param {any} x
 * @param {any} y
 * @returns {boolean}
 */
export const and = (x, y) => Boolean(x && y)

/**
 * Logical OR.
 * @param {any} x
 * @param {any} y
 * @returns {boolean}
 */
export const or = (x, y) => Boolean(x || y)

/**
 * Logical NOT.
 * @param {any} value
 * @returns {boolean}
 */
export const not = value => !value

/**
 * Conditional evaluation from a flat list of predicate-result pairs.
 *
 * If no predicate matches and an extra final argument is provided (not part of a pair),
 * it is returned as the default value.
 *
 * Example:
 *
 * ```js
 * cond(
 *   x > 10, 'large',
 *   x > 5, 'medium',
 *   'small'  // default case
 * );
 * ```
 *
 * @param {...any} args
 * @returns {any}
 */
export const cond = (...args) => {
  const len = args.length
  let i = 0
  while (i + 1 < len) {
    if (args[i]) return args[i + 1]
    i += 2
  }
  if (i < len) return args[i]  // default fallback
}

/**
 * Appends value to array (returns new array).
 * @template T
 * @param {T} value
 * @param {Array<T>} array
 * @returns {Array<T>}
 */
export const append = (value, array) => [...array, value]

/**
 * Applies function to array as arguments.
 * @param {Function} fn
 * @param {Array} array
 * @returns {any}
 */
export const apply = (fn, array) => fn(...array)

/**
 * Boolean coercion.
 * @param {any} value
 * @returns {boolean}
 */
export const bool = value => Boolean(value)

/**
 * Recursively maps a function over arrays and objects.
 * @param {*} value
 * @param {(v: any) => any} fn
 * @returns {*}
 */
export const deepMap = (value, fn) =>
  isArray(value) ? map(value, v => deepMap(v, fn))
    : isObject(value) ? omap(value, v => deepMap(v, fn))
      : fn(value)

/**
 * Iterates over array values.
 * @template T
 * @param {Array<T>} array
 * @param {(v: T) => void} fn
 */
export const each = (array, fn) => array.forEach(fn)

/**
 * Returns object entries as [key, value] pairs.
 * @param {object} obj
 * @returns {Array<[string, any]>}
 */
export const entries = obj => Object.entries(obj)

/**
 * Strict equality check.
 * @param {any} x
 * @param {any} y
 * @returns {boolean}
 */
export const eq = (x, y) => x === y

/**
 * Returns true if all values are truthy.
 * @param {...any} values
 * @returns {boolean}
 */
export const every = (...values) => values.every(Boolean)

/**
 * Returns true if value is not null or undefined.
 * @param {any} value
 * @returns {boolean}
 */
export const exists = value => value != null

/**
 * Filters array.
 * @template T
 * @param {Array<T>} array
 * @param {(v: T) => boolean} predicate
 * @returns {Array<T>}
 */
export const filter = (array, predicate) => array.filter(predicate)

/**
 * Finds first matching element.
 * @template T
 * @param {Array<T>} array
 * @param {(v: T) => boolean} predicate
 * @returns {T|undefined}
 */
export const find = (array, predicate) => array.find(predicate)

/**
 * Returns first element.
 * @template T
 * @param {Array<T>} array
 * @returns {T}
 */
export const first = array => array[0]

/**
 * Attaches keys as globals (optional but included for symmetry).
 * @param {object} obj
 */
export const globalize = obj => Object.assign(globalThis, obj)

/**
 * Identity function.
 * @param {any} v
 * @returns {any}
 */
export const identity = v => v

/**
 * Returns true if argument is array.
 * @param {any} v
 * @returns {boolean}
 */
export const isArray = Array.isArray

/**
 * Returns true if argument is empty.
 * @param {any} v
 * @returns {boolean}
 */
export const isEmpty = v =>
  (isArray(v) || isObject(v)) && !Object.keys(v).length

/**
 * Returns true if argument is function.
 * @param {any} v
 * @returns {boolean}
 */
export const isFunction = v => typeof v === 'function'

/**
 * Returns true if argument is object (non-null).
 * @param {any} v
 * @returns {boolean}
 */
export const isObject = v => typeof v === 'object' && v !== null

/**
 * Joins array with separator.
 * @param {Array<string>} array
 * @param {string} sep
 * @returns {string}
 */
export const join = (array, sep) => array.join(sep)

/**
 * Object keys.
 * @param {object} obj
 * @returns {Array<string>}
 */
export const keys = obj => Object.keys(obj)

/**
 * Returns last element.
 * @template T
 * @param {Array<T>} array
 * @returns {T}
 */
export const last = array => array[array.length - 1]

/**
 * Array length.
 * @param {Array} array
 * @returns {number}
 */
export const length = array => array.length

/**
 * Logs values and returns last.
 * @param {...any} args
 * @returns {any}
 */
export const log = (...args) => (console.log(...args), args.at(-1))

/**
 * Maps array.
 * @template T,U
 * @param {Array<T>} array
 * @param {(v: T, i: number, arr: Array<T>) => U} fn
 * @returns {Array<U>}
 */
export const map = (array, fn) => array.map(fn)

/**
 * Object map.
 * @param {object} obj
 * @param {(v: any, k: string) => any} fn
 * @returns {object}
 */
export const omap = (obj, fn) =>
  Object.fromEntries(entries(obj).map(([k, v]) => [k, fn(v, k)]))

/**
 * Omit key from object.
 * @param {object} obj
 * @param {string} key
 * @returns {object}
 */
export const omit = (obj, key) => {
  const { [key]: _, ...rest } = obj
  return rest
}

/**
 * Partial application.
 * @param {Function} fn
 * @param {...any} args
 * @returns {Function}
 */
export const partial = (fn, ...args) => (...rest) => fn(...args, ...rest)

/**
 * Reduce array.
 * @template T,U
 * @param {Array<T>} array
 * @param {(acc: U, v: T, i: number, arr: Array<T>) => U} fn
 * @param {U} initial
 * @returns {U}
 */
export const reduce = (array, fn, initial) => array.reduce(fn, initial)

/**
 * Array tail.
 * @template T
 * @param {Array<T>} array
 * @returns {Array<T>}
 */
export const rest = array => array.slice(1)

/**
 * Reverses array (immutable).
 * @template T
 * @param {Array<T>} array
 * @returns {Array<T>}
 */
export const reverse = array => [...array].reverse()

/**
 * Array slice.
 * @template T
 * @param {Array<T>} array
 * @param {number} [start]
 * @param {number} [end]
 * @returns {Array<T>}
 */
export const slice = (array, start, end) => array.slice(start, end)

/**
 * Sum numbers.
 * @param {...number} values
 * @returns {number}
 */
export const sum = (...values) => values.reduce((a, b) => a + b, 0)

/**
 * Recursive evaluator for array as Lisp-like function application.
 * @param {any} v
 * @returns {any}
 */
export const evaluate = v =>
  isArray(v) && isFunction(v[0])
    ? v[0](...v.slice(1).map(evaluate))
    : v

/**
 * serializeTree:
 * Recursively converts a declarative tree containing functions as first elements
 * into a plain serializable tree where functions are replaced by their `.name` string.
 *
 * This is intended for transforming Expressive-style declarative trees into a form
 * that can be JSON.stringify-ed and later rehydrated via `deserializeTree`.
 *
 * Example:
 *
 * Input:
 * ```js
 * [log, 1, [sum, 1, 1]]
 * ```
 *
 * Output:
 * ```js
 * ["log", 1, ["sum", 1, 1]]
 * ```
 *
 * @param {*} node - A nested declarative tree.
 * @returns {*} - A tree suitable for JSON serialization.
 */
export const serializeTree = node =>
  Array.isArray(node)
    ? [
      typeof node[0] === 'function' ? node[0].name : node[0],
      node[1],
      ...node.slice(2).map(serializeTree)
    ]
    : node

/**
 * deserializeTree:
 * Recursively walk a serialized tree (e.g. from transpiled .lisp.js)
 * and replace string symbols with actual JS function references from env.
 *
 * @param {*} node
 * @param {Record<string, Function>} env
 * @returns {*}
 */
export const deserializeTree = (node, env = {}) =>
  Array.isArray(node)
    ? [
      typeof node[0] === 'string' && env[node[0]] ? env[node[0]] : node[0],
      ...node.slice(1).map(child => deserializeTree(child, env))
    ]
    : node

/**
 * parseLisp: Naive but useful S-expression -> JS array parser.
 *
 * Example:
 *
 * Input:
 *
 * ```
 * (log
 *   1
 *   (sum 1 1)
 *   (sum 1 (sum 1 1)))
 * ```
 *
 * Output:
 *
 * ```
 * ['log', 1, ['sum', 1, 1], ['sum', 1, ['sum', 1, 1]]]
 * ```
 */
export const parseLisp = src => {
  const tokenize = str =>
    str.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/)

  const read = tokens => {
    if (!tokens.length) throw new SyntaxError('Unexpected EOF while reading')
    const token = tokens.shift()

    if (token === '(') {
      const list = []
      while (tokens[0] !== ')') {
        list.push(read(tokens))
        if (!tokens.length) throw new SyntaxError('Missing )')
      }
      tokens.shift() // discard ')'
      return list
    } else if (token === ')') {
      throw new SyntaxError('Unexpected )')
    } else if (!isNaN(token)) {
      return Number(token)
    } else {
      return token
    }
  }

  return read(tokenize(src))
}

/*
evaluate(parseLisp(`
  (log
    1
    (sum 1 1)
    (sum
      1
      (sum 1 1)))
`))
*/
