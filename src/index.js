import './lib/expressive/global.js'
import home from './pages/home.js'

html(
  head(
    title('Expressive'),
    link({ rel: 'icon', href: 'img/favicon.ico' }),
    link({ rel: 'stylesheet',
           href: '@picocss/pico/css/pico.classless.min.css' }),
    link({ rel: 'stylesheet', href: 'style.css' }),
    link({ rel: 'stylesheet', href: 'lib/highlight/styles/github.min.css' })),
  body(
    header(
      hgroup(
        h1('Expressive JS'),
        h2('An experiment in functional JavaScript'))),
    main(
      home())))
