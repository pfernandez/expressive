const stateMap = new WeakMap()

export const wrap = vnode => ['wrap', {}, vnode]

const changed = (a, b) =>
  typeof a !== typeof b
  || typeof a === 'string' && a !== b
  || Array.isArray(a) && Array.isArray(b) && a[0] !== b[0]

const diffTree = (a, b) => {
  if (!a) return { type: 'CREATE', newNode: b }
  if (!b) return { type: 'REMOVE' }
  if (changed(a, b)) return { type: 'REPLACE', newNode: b }
  if (Array.isArray(a) && Array.isArray(b)) {
    return {
      type: 'UPDATE',
      children: diffChildren(a.slice(2), b.slice(2))
    }
  }
}

const diffChildren = (aChildren, bChildren) => {
  const patches = []
  const len = Math.max(aChildren.length, bChildren.length)
  for (let i = 0; i < len; i++) {
    patches[i] = diffTree(aChildren[i], bChildren[i])
  }
  return patches
}

const assignProperties = (el, props) =>
  Object.entries(props).forEach(([k, v]) => {
    if (k.startsWith('on') && typeof v === 'function') {
      console.log(`attach handler: <${el.tagName.toLowerCase()}>`, el)
      el[k] = (...args) => {
        let target = el
        const path = []
        while (target && !target.__root) {
          path.push(target.tagName)
          target = target.parentNode
        }
        console.log(`CLICK on <${el.tagName.toLowerCase()}> walk path: ${path.join(' -> ')}`)
        if (!target) {
          console.warn('NO __root FOUND for event', el)
          return
        }

        const prev = stateMap.get(target) ?? 0
        console.log(`FOUND __root at <${target.tagName.toLowerCase()}> prev=${prev}`)

        const result = v.call(el, prev, ...args)

        if (Array.isArray(result)) {
          const nextCount = prev + 1
          const parent = target.parentNode
          if (!parent) {
            console.warn('NO parentNode for target', target)
            return
          }

          console.log(`REPLACING <${target.tagName.toLowerCase()}> in <${parent.tagName.toLowerCase()}>`)
          const replacement = renderTree(result, true)

          parent.replaceChild(replacement, target)
          replacement.__vnode = result
          stateMap.set(replacement, nextCount)
        }
      }
    } else if (k === 'style' && typeof v === 'object') {
      Object.assign(el.style, v)
    } else if (k === 'innerHTML') {
      el.innerHTML = v
    } else {
      try {
        el[k] = v
      } catch {}
    }
  })

export const renderTree = (node, isRoot = true) => {
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node)
  }

  if (Array.isArray(node) && node[0] === 'wrap') {
    console.log('wrap detected -> forcing isRoot=true for wrapped vnode')
    const [_tag, _props, child] = node
    return renderTree(child, true)
  }

  const [tag, props = {}, ...children] = node
  let el =
    tag === 'html'
      ? document.documentElement
      : tag === 'head'
        ? document.head
        : tag === 'body'
          ? document.body
          : document.createElement(tag)

  console.log(`renderTree: <${tag}> isRoot=${isRoot}`)

  el.__vnode = node

  if (isRoot && tag !== 'html' && tag !== 'head' && tag !== 'body') {
    console.log(`MARKING __root: <${tag}>`, el)
    el.__root = true
    const initialState = typeof node[2] === 'number' ? node[2] : 0
    stateMap.set(el, initialState)
  }

  assignProperties(el, props)

  children.forEach(child => {
    const childEl = renderTree(child, false)
    el.appendChild(childEl)
  })

  return el
}

const applyPatch = (parent, patch, index = 0) => {
  if (!patch) return

  const child = parent.childNodes[index]

  switch (patch.type) {
  case 'CREATE': {
    const newEl = renderTree(patch.newNode)
    parent.appendChild(newEl)
    break
  }
  case 'REMOVE':
    if (child) parent.removeChild(child)
    break
  case 'REPLACE': {
    const newEl = renderTree(patch.newNode)
    parent.replaceChild(newEl, child)
    break
  }
  case 'UPDATE':
    patch.children.forEach((p, i) => applyPatch(child, p, i))
    break
  }
}

export const render = (vtree, container = null) => {
  const target =
    !container && Array.isArray(vtree) && vtree[0] === 'html'
      ? document.documentElement
      : container

  if (!target) {
    throw new Error('render() requires a container for non-html() root')
  }

  const prevVNode = target.__vnode

  if (!prevVNode) {
    const dom = renderTree(vtree)
    if (target === document.documentElement) {
      document.replaceChild(dom, document.documentElement)
    } else {
      target.appendChild(dom)
    }
  } else {
    const patch = diffTree(prevVNode, vtree)
    applyPatch(target, patch)
  }

  target.__vnode = vtree
}
