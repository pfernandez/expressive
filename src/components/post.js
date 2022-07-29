import md from '/components/markdown.js'
import posts from '/posts/index.js'

export default pathname =>
  createElement('post', article(md(posts[pathname].filename)))
