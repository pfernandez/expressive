import { createServer } from 'livereload'
import express from 'express'

const main = 'index.js',
      path = 'src',
      port = 3000

express()
  .use(express.static(path))
  .get('/data', (_, res) => res.send({ count: 1 }))
  .get('/', (_, res) => res.send(`
    <!doctype html>
    <link rel="icon" href="data:x-icon">
    <script src="//localhost:35729/livereload.js"></script>
    <script type="module" src="${main}"></script>
  `))
  .listen(port, () => console.log(`Running at http://localhost:${port}`))

createServer().watch(path)
