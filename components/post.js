import md from './markdown.js'
import posts from '../posts/index.js'

export default pathname => {
  // Look for a file with the pathname as key, otherwise strip the leading
  // segment in case the site is served from a path like "github.com/my-blog/".
  let post
  let prefix = '/'

  try {
    post = `/posts/${posts[pathname].filename}` }
  catch {
    const segments = pathname.split('/')
    const path = '/' + segments.slice('2').join('/')
    post = '/' + segments[1] + '/posts/' + posts[path].filename }

  console.log(pathname, post)
  console.log(md(post))

  return createElement('post', article(md(post))) }

