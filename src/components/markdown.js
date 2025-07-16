import hljs from '../lib/highlight/es/core.min.js'
import javascript from '../lib/highlight/es/languages/javascript.min.js'

hljs.registerLanguage('javascript', javascript)

export default (markdown, el = document.createElement('md')) =>
  Object.assign(el,
    { innerHTML: window
      .markdownit(
        { html: true,
          linkify: true,
          typographer: true,
          highlight: (str, language) =>
            hljs.highlight(str, { language }).value })
      .render(markdown) })
