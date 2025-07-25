/**
 * expressive/elements.js
 *
 * Minimalist declarative UI framework based on pure functional composition.
 *
 * Purpose:
 * - All UI defined as pure functions that return declarative arrays.
 * - Directly composable into a symbolic substrate compatible with Lisp-like dialects.
 * - No internal mutable state required: DOM itself is the substrate for state.
 * - No JSX, no keys, no reconciler heuristics — just pure structure + replacement.
 *
 * Core principles:
 * - Each "element helper" (e.g., div(), span(), svg()) returns a simple array:
 *   ['div', { props }, ...children]
 * - `element(fn)` wraps a component function to enable automatic self-replacement
 *   when invoked via event handlers.
 * - `render(vtree, container?)` mounts any declarative tree into the DOM.
 *
 * Suitable for:
 * - Symbolic computation experiments.
 * - Pure declarative UI without hooks/lifecycle abstractions.
 * - Foundations for a self-hosting Lisp or declarative symbolic OS.
 */

const htmlTagNames = [
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo',
  'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col',
  'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl',
  'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2',
  'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img',
  'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu',
  'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p',
  'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script',
  'section', 'select', 'slot', 'small', 'source', 'span', 'strong', 'style', 'sub',
  'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead',
  'time', 'title', 'tr', 'track', 'u', 'ul', 'video', 'wbr'
]

const svgTagNames = [
  'svg', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect',
  'g', 'defs', 'linearGradient', 'radialGradient', 'stop', 'symbol', 'use',
  'text', 'viewBox'
]

const svgNS = 'http://www.w3.org/2000/svg'

const stateMap = new WeakMap()

const isNodeEnv = typeof document === 'undefined'

/**
 * Determines whether two vnodes differ enough to trigger a replacement.
 * Compares by type, string value, or tag name if both are arrays.
 *
 * @param {*} a - First vnode
 * @param {*} b - Second vnode
 * @returns {boolean} - True if nodes are meaningfully different
 */
const changed = (a, b) =>
  typeof a !== typeof b
  || typeof a === 'string' && a !== b
  || Array.isArray(a) && Array.isArray(b) && a[0] !== b[0]

/**
 * Computes the difference between two vnodes and returns a patch object.
 * Patch types include: CREATE, REMOVE, REPLACE, or UPDATE with child diffs.
 *
 * @param {*} a - Previous vnode
 * @param {*} b - New vnode
 * @returns {Object} patch - Instructions for transforming a into b
 */
const diffTree = (a, b) => {
  if (!a) return { type: 'CREATE', newNode: b }
  if (!b) return { type: 'REMOVE' }
  if (changed(a, b)) return { type: 'REPLACE', newNode: b }
  if (Array.isArray(a) && Array.isArray(b)) {
    return {
      type: 'UPDATE',
      children: diffChildren(a.slice(2), b.slice(2))
    }
  }
}

/**
 * Recursively diffs children arrays of two vnodes.
 * Returns an array of patch objects for each child index.
 *
 * @param {Array} aChildren - Previous child vnodes
 * @param {Array} bChildren - New child vnodes
 * @returns {Array} patches - List of patch objects
 */
const diffChildren = (aChildren, bChildren) => {
  const patches = []
  const len = Math.max(aChildren.length, bChildren.length)
  for (let i = 0; i < len; i++) {
    patches[i] = diffTree(aChildren[i], bChildren[i])
  }
  return patches
}

/**
 * Applies props to a DOM element.
 * Handles standard DOM attributes, inline styles, event listeners,
 * and SVG compatibility. Supports functional event handlers with
 * automatic rerendering of the component.
 *
 * @param {HTMLElement} el - The DOM element to assign props to
 * @param {Object} props - Props object with attributes and event handlers
 */
const assignProperties = (el, props) =>
  Object.entries(props).forEach(([k, v]) => {
    if (k.startsWith('on') && typeof v === 'function') {
      el[k] = (...args) => {
        let target = el
        while (target && !target.__root) target = target.parentNode
        if (!target) return

        const prev = stateMap.get(target) ?? 0
        try {
          const result =
        v.length === 1  // DOM form: event => ...
          ? v.call(el, args[0])
          : v.call(el, prev, ...args)

          if (Array.isArray(result)) {
            const nextCount = prev + 1
            const parent = target.parentNode
            if (!parent) return

            const replacement = renderTree(result, true)
            parent.replaceChild(replacement, target)
            replacement.__vnode = result
            stateMap.set(replacement, nextCount)
          }
        } catch (err) {
          console.error('Error in handler:', err)
        }
      }
    }
    else if (k === 'style' && typeof v === 'object') {
      Object.assign(el.style, v)
    } else if (k === 'innerHTML') {
      el.innerHTML = v
    } else {
      try {
        if (el.namespaceURI === svgNS) {
          el.setAttributeNS(null, k, v)
        } else {
          el.setAttribute(k, v)
        }
      } catch {
        console.warn(
          `Illegal DOM property assignment for ${el.tagName}: ${k}: ${v}`)
      }
    }
  })

const renderTree = (node, isRoot = true) => {
  if (typeof node === 'string' || typeof node === 'number') {
    return isNodeEnv ? node : document.createTextNode(node)
  }

  if (!node || node.length === 0) {
    return document.createComment('Empty vnode')
  }

  if (!Array.isArray(node)) {
    console.error('Malformed vnode (not an array):', node)
    return document.createComment('Invalid vnode')
  }

  if (Array.isArray(node) && node[0] === 'wrap') {
    const [_tag, _props, child] = node
    return renderTree(child, true)
  }

  const [tag, props = {}, ...children] = node

  if (typeof tag !== 'string') {
    console.error('Malformed vnode (non-string tag):', node)
    return document.createComment('Invalid vnode')
  }

  let el =
    tag === 'html'
      ? document.documentElement
      : tag === 'head'
        ? document.head
        : tag === 'body'
          ? document.body
          : svgTagNames.includes(tag)
            ? document.createElementNS(svgNS, tag)
            : document.createElement(tag)

  el.__vnode = node

  if (isRoot && tag !== 'html' && tag !== 'head' && tag !== 'body') {
    el.__root = true
    const initialState = typeof node[2] === 'number' ? node[2] : 0
    stateMap.set(el, initialState)
  }

  assignProperties(el, props)

  children.forEach(child => {
    const childEl = renderTree(child, false)
    el.appendChild(childEl)
  })

  return el
}

/**
 * Applies a patch object to a DOM node, modifying its children
 * to bring them into sync with the updated vnode.
 *
 * @param {HTMLElement} parent - The parent DOM element
 * @param {Object} patch - Patch object from diffTree
 * @param {number} [index=0] - Child index to apply the patch to
 */
const applyPatch = (parent, patch, index = 0) => {
  if (!patch) return

  const child = parent.childNodes[index]

  switch (patch.type) {
  case 'CREATE': {
    const newEl = renderTree(patch.newNode)
    parent.appendChild(newEl)
    break
  }
  case 'REMOVE':
    if (child) parent.removeChild(child)
    break
  case 'REPLACE': {
    const newEl = renderTree(patch.newNode)
    parent.replaceChild(newEl, child)
    break
  }
  case 'UPDATE':
    patch.children.forEach((p, i) => applyPatch(child, p, i))
    break
  }
}

export const render = (vtree, container = null) => {
  const target =
    !container && Array.isArray(vtree) && vtree[0] === 'html'
      ? document.documentElement
      : container

  if (!target) {
    throw new Error('render() requires a container for non-html() root')
  }

  const prevVNode = target.__vnode

  if (!prevVNode) {
    const dom = renderTree(vtree)
    if (target === document.documentElement) {
      document.replaceChild(dom, document.documentElement)
    } else {
      target.appendChild(dom)
    }
  } else {
    const patch = diffTree(prevVNode, vtree)
    applyPatch(target, patch)
  }

  target.__vnode = vtree
}

export const wrap = vnode => ['wrap', {}, vnode]

/**
 * Wraps a function component so that it participates in reconciliation.
 *
 * @template T
 * @param {(...args: any[]) => any} fn - A pure function that returns a declarative tree (array format).
 * @returns {(...args: any[]) => any} - A callable component that can manage its own subtree.
 */
export const element = fn => {
  return (...args) => {
    try {
      const vnode = fn(...args)
      return ['wrap', {}, vnode]
    } catch (err) {
      console.error('Component error:', err)
      return ['div', {}, `Error: ${err.message}`]
    }
  }
}

const tagNames = [...htmlTagNames, ...svgTagNames]

const isPropsObject = x =>
  typeof x === 'object' && x !== null
  && !Array.isArray(x)
  && !(typeof Node !== 'undefined' && x instanceof Node)

/**
 * A map of supported HTML and SVG element helpers.
 *
 * Each helper is a function that accepts optional props as first argument
 * and children as subsequent arguments.
 *
 * Example:
 *
 * ```js
 * div({ id: 'foo' }, 'Hello World')
 * ```
 *
 * Produces:
 *
 * ```js
 * ['div', { id: 'foo' }, 'Hello World']
 * ```
 *
 * The following helpers are included:
 * `div`, `span`, `button`, `svg`, `circle`, etc.
 *
 * @typedef {function([propsOrChild], ...children): Array} ElementHelper
 *
 * @type {Record<string, ElementHelper>}
 */
export const elements = tagNames.reduce(
  (acc, tag) => ({
    ...acc,
    [tag]: (propsOrChild, ...children) => {
      const props = isPropsObject(propsOrChild) ? propsOrChild : {}
      const actualChildren = props === propsOrChild ? children : [propsOrChild, ...children]
      return [tag, props, ...actualChildren]
    }
  }),
  {
    fragment: (...children) => ['fragment', {}, ...children]
  }
)

/**
 * Individual element helper functions:
 *
 * These are dynamically generated but equivalent to:
 *
 * ```js
 * export const div = (propsOrChild, ...children) => ['div', props, ...children]
 * export const span = ...
 * ```
 *
 * Example usage:
 *
 * ```js
 * div({ class: 'foo' }, 'Hello')
 * ```
 *
 * Produces:
 *
 * ```js
 * ['div', { class: 'foo' }, 'Hello']
 * ```
 */
export const {
  fragment, a, abbr, address, area, article, aside, audio, b, base, bdi, bdo, blockquote, body,
  br, button, canvas, caption, cite, code, col, colgroup, data, datalist, dd, del, details,
  dfn, dialog, div, dl, dt, em, embed, fieldset, figcaption, figure, footer, form, h1, h2,
  h3, h4, h5, h6, head, header, hgroup, hr, html, i, iframe, img, input, ins, kbd, label,
  legend, li, link, main, map, mark, menu, meta, meter, nav, noscript, object, ol, optgroup,
  option, output, p, param, picture, pre, progress, q, rp, rt, ruby, s, samp, script, section,
  select, slot, small, source, span, strong, style, sub, summary, sup, table, tbody, td,
  template, textarea, tfoot, th, thead, time, title, tr, track, u, ul, video, wbr,
  svg, circle, ellipse, line, path, polygon, polyline, rect, g, defs, linearGradient,
  radialGradient, stop, symbol, use, text, viewBox
} = elements
