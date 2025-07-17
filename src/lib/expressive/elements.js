const stateMap = new WeakMap()

const isNodeEnv = typeof document === 'undefined'

export const wrap = vnode => ['wrap', {}, vnode]

const changed = (a, b) =>
  typeof a !== typeof b
  || typeof a === 'string' && a !== b
  || Array.isArray(a) && Array.isArray(b) && a[0] !== b[0]

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

const diffChildren = (aChildren, bChildren) => {
  const patches = []
  const len = Math.max(aChildren.length, bChildren.length)
  for (let i = 0; i < len; i++) {
    patches[i] = diffTree(aChildren[i], bChildren[i])
  }
  return patches
}

const assignProperties = (el, props) =>
  Object.entries(props).forEach(([k, v]) => {
    if (k.startsWith('on') && typeof v === 'function') {
      el[k] = (...args) => {
        let target = el
        while (target && !target.__root) {
          target = target.parentNode
        }
        if (!target) return

        const prev = stateMap.get(target) ?? 0
        const result = v.call(el, prev, ...args)

        if (Array.isArray(result)) {
          const nextCount = prev + 1
          const parent = target.parentNode
          if (!parent) return

          const replacement = renderTree(result, true)
          parent.replaceChild(replacement, target)
          replacement.__vnode = result
          stateMap.set(replacement, nextCount)
        }
      }
    } else if (k === 'style' && typeof v === 'object') {
      Object.assign(el.style, v)
    } else if (k === 'innerHTML') {
      el.innerHTML = v
    } else {
      try { el[k] = v } catch {}
    }
  })

export const renderTree = (node, isRoot = true) => {
  if (typeof node === 'string' || typeof node === 'number') {
    return isNodeEnv ? node : document.createTextNode(node)
  }

  if (Array.isArray(node) && node[0] === 'wrap') {
    const [_tag, _props, child] = node
    return renderTree(child, true)
  }

  const [tag, props = {}, ...children] = node

  if (isNodeEnv) {
    return {
      tag,
      props,
      children: children.map(c => renderTree(c, false))
    }
  }

  let el =
    tag === 'html'
      ? document.documentElement
      : tag === 'head'
        ? document.head
        : tag === 'body'
          ? document.body
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

export const element = fn => {
  return (...args) => wrap(fn(...args))
}

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

const tagNames = [...htmlTagNames, ...svgTagNames]

const isPropsObject = x =>
  typeof x === 'object' && x !== null
  && !Array.isArray(x)
  && !(typeof Node !== 'undefined' && x instanceof Node)

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
