import * as functions from './lib/expressive/functions.js'
import { body, h1, h2, head, header, hgroup, html, link, main, render, title } from './lib/expressive/elements.js'
import counter from './components/counter.js'

// Define your top-level tree declaratively:
const appTree = html(
  head(
    title('Expressive'),
    link({ rel: 'icon', href: 'img/favicon.ico' }),
    link({ rel: 'stylesheet', href: '@picocss/pico/css/pico.classless.min.css' }),
    link({ rel: 'stylesheet', href: 'style.css' }),
    link({ rel: 'stylesheet', href: 'lib/highlight/styles/github.min.css' })
  ),
  body(
    header(
      hgroup(
        h1('Expressive JS'),
        h2('An experiment in functional JavaScript')
      )
    ),
    main(
      counter(),
      counter()
    )
  )
)

// Mount your tree explicitly — reconciler will auto-handle `html()` root!
render(appTree)


// Deomonstrate basic Lisp parsing
const { deserializeTree, evaluate, log, parseLisp } = functions

const parsed = parseLisp(`
  (log
    1
    (sum 1 1)
    (sum
      1
      (sum 1 1)))
`)

const deserialized = deserializeTree(parsed, functions)
const evaluated = evaluate(deserialized)
log({ parsed, deserialized, evaluated })

