
const assignProperties = (baseElement, properties) =>
  Object.entries(properties).reduce((el, [k, v]) =>
    (el[k] = v,
    typeof v === 'object' && !Array.isArray(v)
      && assignProperties(el[k], v),
    el),
  baseElement)

const replaceChildren = (baseElement, childNodes) =>
  (baseElement.replaceChildren(...childNodes), baseElement)

const replaceSubtree = (baseElement, properties, children) =>
  replaceChildren(
    assignProperties(baseElement, properties),
    children)

const selector = (tagName, { id, className }) =>
  tagName
    + (id ? `#${id}`
      : className ? `.${className.split(' ').filter(s => s).join('.')}`
        : '')

const withProperties = (tagName, x, childNodes) =>
  ({ tagName,
     ...typeof x === 'object' && !(x instanceof Node)
       ? { childNodes,
           properties: x,
           selector: selector(tagName, x) }
       : { childNodes: [x, ...childNodes],
           properties: {},
           selector: selector(tagName, {}) } })

const update = (selector, properties, childNodes) =>
  document.querySelectorAll(selector).forEach(
    el => el.replaceWith(
      replaceSubtree(el.cloneNode(), properties, childNodes)))

const baseElement = tagName =>
  ['html', 'head', 'body'].includes(tagName)
    ? 'html' === tagName ? document.documentElement : document[tagName]
    : document.createElement(tagName)

const isRootElement = args =>
  args.childNodes.some(
    node => node instanceof Element && node.parentNode === null)

const createLiveElement =
  ({ childNodes, properties, selector, tagName }) =>
    document.readyState === 'complete'
    && isRootElement({ childNodes, properties, selector, tagName })
      ? update(selector, properties, childNodes)
      : replaceSubtree(baseElement(tagName), properties, childNodes)

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
export const element = (tagName, nodeOrProperties, ...nodes) =>
  createLiveElement(withProperties(tagName, nodeOrProperties, nodes))

export const el = element

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
         element(tagName, nodeOrProperties, ...nodes) }),
  { fragment:
    (...childNodes) => replaceChildren(
      document.createDocumentFragment(), ...childNodes) })

export const {
  fragment, imgmap,
  a, abbr, address, area, article, aside, audio, b, base,
  bdi, bdo, blockquote, body, br, button, canvas, caption,
  cite, code, col, colgroup, data, datalist, dd, del, details,
  dfn, dialog, div, dl, dt, em, embed, fieldset, figcaption,
  figure, footer, form, h1, h2, h3, h4, h5, h6, head,
  header, hgroup, hr, html, i, iframe, img, input, ins, kbd,
  label, legend, li, link, main, map, mark, menu, meta,
  meter, nav, noscript, object, ol, optgroup, option, output,
  p, param, picture, pre, progress, q, rp, rt, ruby, s,
  samp, script, section, select, slot, small, source, span,
  strong, style, sub, summary, sup, table, tbody, td,
  template, textarea, tfoot, th, thead, time, title, tr,
  track, u, ul, video, wbr
} = defaultElements
