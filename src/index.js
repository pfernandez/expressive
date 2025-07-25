import { body, h1, h2, head, header, hgroup, html, link, main, render, title } from './lib/expressive/elements.js'
import todos from './components/todos.js'

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
        h2('A functional todos app demo')
      )
    ),
    main(
      todos()
    )
  )
)

render(appTree)
