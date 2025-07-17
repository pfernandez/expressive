// transpile.js
import fs from 'fs/promises'
import { parseLisp } from './functions.js'
import path from 'path'

/**
 * Recursively walk project to find all .lisp files
 */
const walk = async (dir, files = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full, files)
    } else if (entry.isFile() && entry.name.endsWith('.lisp')) {
      files.push(full)
    }
  }
  return files
}

/**
 * Transpile a single .lisp file to .lisp.js
 */
const transpileFile = async file => {
  const content = await fs.readFile(file, 'utf8')

  console.log({ file, content })

  const parsed = parseLisp(content)
  const output = `export default ${JSON.stringify(parsed, null, 2)};\n`
  const outPath = file + '.js'
  await fs.writeFile(outPath, output, 'utf8')
  console.log(`Transpiled: ${file} -> ${outPath}`)
}

/**
 * Main entrypoint
 */
const main = async () => {
  const root = process.cwd()
  const files = await walk(root)

  console.log({ files })

  await Promise.all(files.map(transpileFile))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

