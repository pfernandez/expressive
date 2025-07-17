import { element } from '../lib/expressive/elements.js'
import hljs from '../lib/highlight/es/core.min.js'
import javascript from '../lib/highlight/es/languages/javascript.min.js'

hljs.registerLanguage('javascript', javascript)

const md = markdown => element(
  'md',
  { innerHTML: window.markdownit(
    { html: true,
      linkify: true,
      typographer: true,
      highlight: (str, language) =>
        hljs.highlight(str, { language }).value }).render(markdown) })

export default md
