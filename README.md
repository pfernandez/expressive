# Expressive JS

A minimalist declarative UI toolkit + functional toolkit designed around purity, simplicity, and immutable data.

---

## 🔥 Why does this exist?

React introduced a declarative syntax that transformed front-end development—but it remains deeply tied to mutable state abstractions, component lifecycle hooks, and imperative reconciliation machinery.

Expressive JS asks a radical question:

> **Can we go further?**

- **What if all UI were simply pure functions?**  
- **What if state could live _entirely_ in the DOM itself?**  
- **What if reconciliation could be _eliminated as a concept_ because every "re-render" is simply the next pure function invocation?**  
- **What if the core primitives required to build apps could reduce to just "functions returning data"?**

---

## 🧠 Core philosophy

### 🔹 No implicit state

In React:

- Components encapsulate mutable state internally  
- Hooks, reducers, effects and context manage synchronization

In Expressive:

- Components are simply pure functions  
- If you want to "update", you just _call them again with new arguments_

> **The DOM itself is the _only_ stateful object.**

---

### 🔹 No lifecycle hooks, no effects

Every invocation of a function element is treated as the full truth about its subtree.

---

### 🔹 Minimal abstraction

Rather than virtual DOM diffing by comparing two opaque tree snapshots, Expressive’s reconciliation strategy is:

- **Direct correspondence between a node and the pure function that produced it**  
- No `key` or `id` attributes required for reconciliation  
- Event handlers can simply "re-run" the component, replacing it declaratively

---

### 🔹 Built for compositional metaprogramming

Expressive JS complements its UI toolkit (`elements.js`) with `functions.js`:  
a pure functional toolkit + minimal Lisp-style interpreter that treats **code itself as immutable data**.

---

## 🚀 Example usage

```js
import {
  render, element,
  html, head, body, main, h1, h2, pre, button, div
} from './lib/expressive/elements.js';

const counter = element((count = 0) =>
  div(
    pre(count),
    button(
      { onclick: (prev) => counter(prev + 1) },
      'Increment'
    )
  )
);

const appTree = html(
  head(),
  body(
    h1('Expressive JS'),
    h2('Declarative components'),
    main(
      counter(),
      counter()
    )
  )
);

render(appTree);
````

✅ **This will render two independent counters on the page —
with no lifecycle, state management or external abstraction required.**

---

# 📐 Elements.js

Expressive’s UI layer is based on a single principle:

> **Any function that returns a declarative tree can be treated as a reusable, composable component.**

---

### 🔹 Stateless Components

```js
const counter = element((count = 0) =>
  div(
    pre(count),
    button(
      { onclick: (prev) => counter(prev + 1) },
      'Increment'
    )
  )
);

render(counter());
```

---

### 🔹 Composition by default

Function elements nest naturally:

```js
main(
  section(
    h1('Title'),
    counter()
  )
)
```

---

### 🔹 Event handling without hooks

```js
button({ onclick: (prev) => counter(prev + 1) }, 'Increment')
```

The framework automatically passes the "previous state" (inferred from the DOM itself!) as `prev` —
no useState, useReducer, or proxy abstraction required.

---

### 🔹 API Data

```js
fetch('/data')
  .then(res => res.json())
  .then(({ count }) => counter(count));
```

Pure composition: async API calls simply provide arguments for declarative render calls.

---

# 🧩 Functions.js

Pure utilities that align with Expressive’s style:

✅ Argument-first
✅ Immutable
✅ Composable
✅ No prototype or OO inheritance pollution
✅ `evaluate()` for Lisp-style symbolic computing

---

### 🔹 Example utilities

```js
map(array, fn)      // instead of array.map(fn)
keys(obj)           // instead of Object.keys(obj)
reverse(array)      // immutable reverse
deepMap(value, fn)  // recursive structure mapper
log(...args)        // console.log passthrough returning last arg
```

---

### 🔹 `evaluate()`: minimal Lisp-style interpreter

Treat nested arrays as data or code.

```js
evaluate([sum, 1, [sum, 2, 3]])  // 6
```

---

### 🔹 `cond`: declarative conditionals

```js
cond(
  x > 10, 'large',
  x > 5, 'medium',
  'small'  // fallback
)
```

---

## 🧠 Theory and justification

Expressive JS emerges from this premise:

### 🔹 **Object-orientation encourages accidental complexity**

OO UI libraries (even React) blur concerns:

* Internal mutable state, lifecycles, hooks
* Implicit subscriptions and closures
* Reconciliation diffing as a separate problem

Expressive reframes UI as pure, declarative functions that **always tell the full truth about their subtree**.

---

### 🔹 **No hidden observer model**

In React, useState + useEffect establish a hidden observer graph
(where dependencies must be manually managed with arrays like `[]` or `[x]`).

In Expressive, **the DOM itself is the state repository** —
the physical HTML node that exists is the *only* mutable thing in the system.

---

### 🔹 **Powerful metaprogramming fallback**

Expressive JS makes this possible:

```js
const ui = [html, [body, [main, [counter, 0]]]];

evaluate(deepMap(ui, x => x === 0 ? 2 : x));  // render counter starting at 2
```

In other words:

> **All UI can be represented, transformed, and manipulated as pure declarative structures before evaluation.**

This makes Expressive naturally macro-capable
(while still using plain JavaScript — no parser, no transpiler, no JSX).

---

### Example symbolic program with native functions and symbolic vars:

```js
import { evaluate } from './lib/expressive/functions.js';

const env = {
  sum: (a, b) => a + b
};

const program = [
  'let',
  [['x', 1], ['y', 2]],
  ['sum', 'x', 'y']
];

console.log(evaluate(program, env));  // Output: 3
```
---

### Hydration step

When using `.lisp.js` files transpiled from `.lisp` sources,  
deserialize the tree before calling `evaluate()`:

---

```js
import program from './my-program.lisp.js';
import { deserializeTree, evaluate, sum } from './lib/expressive/functions.js';

const env = { sum };

const hydrated = deserializeTree(program, env);
evaluate(hydrated);
```

## 🚨 Status

* Early stage but stable enough to build real apps now
* No transpiler required
* Works natively in browser or Node (`node --test` fully supported)
* Extremely small and ergonomic

---

## ❤️ Summary

Expressive JS is an exploration of what happens when we:

* Treat UI as pure functions
* Eliminate component-local state
* Avoid reconciliation heuristics
* Treat the DOM itself as the single mutable substrate
* Add a pure functional toolkit alongside it for composition and metaprogramming

---

🔔 **Get started:**

```bash
npm install expressive
```

(or clone locally and import as an ES module)

---

👏 **Thank you for exploring this radical, minimalist take on declarative UI.**
Experimental — but fast, fun, and deeply aligned with Lisp-style simplicity.

```

