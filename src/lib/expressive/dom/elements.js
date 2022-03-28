
const assignProperties = (element, properties) =>
  Object.entries(properties).reduce(
    (el, [k, v]) =>
      (el[k] = v,
      typeof v === 'object' && !Array.isArray(v)
      && assignProperties(el[k], v),
      el),
    element)

const attachSubtree = ({ element, properties, childNodes }) =>
  (childNodes.length && element.replaceChildren(...childNodes),
  assignProperties(element, properties))

const baseElement = tagName =>
  'html' === tagName ? document.documentElement
    : ['head', 'body'].includes(tagName) ? document[tagName]
      : 'imgmap' === tagName ? document.createElement('map')
        : document.createElement(tagName)

const prepare = (tagName, x, childNodes) =>
  ({ element: baseElement(tagName),
     ...typeof x === 'object' && !(Array.isArray(x) || x instanceof Node)
       ? { childNodes: childNodes.flat(), properties: x }
       : { childNodes: [x, ...childNodes].flat(), properties: {} } })

/**
 * Generates an HTMLElement with children and inserts it into the DOM.
 *
 * @param {string} tagName
 *
 * @param {Partial<HTMLElement> | string | number} [nodeOrProperties]
 * Either an object of [HTMLElement properties](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#properties)
 * or a child node.
 *
 * @param {...(HTMLElement | string | number)} [childNodes]
 *
 * @returns HTMLElement
 */
export const createElement = (tagName, nodeOrProperties, ...nodes) =>
  attachSubtree(prepare(tagName, nodeOrProperties, nodes))

const appendChildren = (element, ...children) =>
  (element.append(...children), element)

const tagNames = [
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base',
  'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption',
  'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details',
  'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption',
  'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head',
  'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd',
  'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'meta',
  'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output',
  'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's',
  'samp', 'script', 'section', 'select', 'slot', 'small', 'source', 'span',
  'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td',
  'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr',
  'track', 'u', 'ul', 'var', 'video', 'wbr'
]

const defaultElements = tagNames.reduce(
  (functions, tagName) =>
    ({ ...functions,
       [tagName]: (nodeOrProperties, ...nodes) =>
         createElement(tagName, nodeOrProperties, ...nodes) }),
  { fragment:
    (...childNodes) =>
      appendChildren(document.createDocumentFragment(), ...childNodes) })

export const {
  fragment, imgmap,
  a, abbr, address, area, article, aside, audio, b, base,
  bdi, bdo, blockquote, body, br, button, canvas, caption,
  cite, code, col, colgroup, data, datalist, dd, del, details,
  dfn, dialog, div, dl, dt, em, embed, fieldset, figcaption,
  figure, footer, form, h1, h2, h3, h4, h5, h6, head,
  header, hgroup, hr, html, i, iframe, img, input, ins, kbd,
  label, legend, li, link, main, mark, menu, meta,
  meter, nav, noscript, object, ol, optgroup, option, output,
  p, param, picture, pre, progress, q, rp, rt, ruby, s,
  samp, script, section, select, slot, small, source, span,
  strong, style, sub, summary, sup, table, tbody, td,
  template, textarea, tfoot, th, thead, time, title, tr,
  track, u, ul, video, wbr
} = defaultElements

const selector = el =>
  el.tagName
    + (el.id ? `#${el.id}`
      : el.className ? `.${el.className.split(' ').filter(s => s).join('.')}`
        : '')

/**
 * Replaces all matching live elements with a new element, then returns an array
 * of references to the updated elements. An existing element is considered a
 * match if it shares a `tagName` + `id` + `className` combination with the
 * replacement.
 *
 * @param {HTMLElement} element
 * @returns {HTMLElement[]}
 */
export const update = element =>
  [...document.querySelectorAll(selector(element))].map(
    el => (el.replaceWith(element), el))

