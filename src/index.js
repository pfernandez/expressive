import { body, h1, h2, h3, head, header, html,
         link, main, render, section, title } from './lib/elements.js'
import { counter } from './components/counter.js'
import { todos } from './components/todos.js'

render(
  html(
    head(
      title('Expressive'),
      link({ rel: 'icon', href: 'img/favicon.ico' }),
      link({ rel: 'stylesheet',
             href: './css/pico.classless.sand.min.css' }),
      link({ rel: 'stylesheet', href: './css/style.css' })),
    body(
      header(
        h1('Elements.js Demo')),
      main(
        section(
          h2('Todos'),
          todos()),
        section(
          h2('Counters'),
          section(
            h3('Counter 1'),
            counter()),
          section(
            h3('Counter 2'),
            counter()))))))
