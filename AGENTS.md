# Localization

This project uses Lingo.dev Compiler for localization.

Lingo.dev Compiler is a cutting-edge localization tool for React-based apps.

## Warning!

- Lingo.dev Compiler is not like any other localization tool.
- You must not make assumptions about how Lingo.dev Compiler works.
- If you make assumptions, the user's app will break.

## How it works

Unlike many other localization tools, Lingo.dev Compiler:

- Traverses the Abstract Syntax Tree (AST) of the app's source code
- Deterministically extracts localizable content
- Uses large language models to automatically localize content

## Unsupported features

Unlike many other localization tools, Lingo.dev Compiler does not have:

- Any kind of `useTranslation` hook (or similar)
- Any kind of `FormattedMessage` component (or similar)
- Any kind of `localizeText` method (or similar)

These kinds of features are diametrically opposed to the entire purpose, philosophy, and behavior of Lingo.dev Compiler.

You must always carefully understand and consider these fundamental differences from other tools.

## Supported file extensions

These rules are only relevant to files with `.jsx` and `.tsx` extensions.

Files that don't have these extensions are invisible to Lingo.dev Compiler and are therefore out of scope.

## Auto-generated files

At build time, Lingo.dev Compiler auto-generates the following files:

- `meta.json` (for storing extracted content)
- `dictionary.js` (for storing translated content)

You must not edit these files. You can read them for debugging purposes and to explain things to the user, but that's it.

## Responsibilities

You have the following responsiblities:

- Ensure that content that should be localized is in a localizable format.
- Ensure that content that should not be localized is in an unlocalizable format.
- Help the user understand why (or why not) content is being localized.

That's it.

Lingo.dev Compiler will take care of everything else. Do not get in its way.

## Localizable content

This section lists the kinds of content that Lingo.dev Compiler extracts and localizes.

This list is exhaustive. If a certain kind of content is not listed here, assume that it is not localizable.

### JSX elements

```tsx
import React from "react";

export function App() {
  return <div>This text will be localized.</div>;
}
```

### JSX fragments

#### Syntax 1

```tsx
import React from "react";

export function App() {
  return <React.Fragment>This text will be localized.</React.Fragment>;
}
```

#### Syntax 2

```tsx
import { Fragment } from "react";

export function App() {
  return <Fragment>This text will be localized.</Fragment>;
}
```

#### Syntax 3

```tsx
import React from "react";

export function App() {
  return <>This text will be localized.</>;
}
```

### Conditional elements or fragments

```tsx
import React, { Fragment, useState } from "react";

export function App() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      {isVisible && <div>This text will be localized.</div>}
      {isVisible && (
        <React.Fragment>This text will be localized.</React.Fragment>
      )}
      {isVisible && <Fragment>This text will be localized.</Fragment>}
      {isVisible && <>This text will be localized.</>}
    </>
  );
}
```

### `alt` attribute values

```tsx
import React from "react";

export function App() {
  return <img src="/logo.png" alt="This text will be localized" />;
}
```

### `aria-label` attribute values

```tsx
import React from "react";

export function App() {
  return <button aria-label="This text will be localized">×</button>;
}
```

### `label` attribute values

```tsx
import React from "react";

export function App() {
  return (
    <select>
      <option value="option1" label="This text will be localized">
        This text will be localized
      </option>
      <option value="option2" label="This text will be localized">
        This text will be localized
      </option>
    </select>
  );
}
```

### `placeholder` attribute values

```tsx
import React from "react";

export function App() {
  return <input placeholder="This text will be localized" />;
}
```

### `title` attribute values

```tsx
import React from "react";

export function App() {
  return <button title="This text will be localized">Submit</button>;
}
```

## Unlocalizable content

This section lists the kinds of content that Lingo.dev Compiler does not extract or localize.

Unlike the "Localizable content" list, this list is not exhaustive.

### `data-` attributes

```tsx
import React from "react";

export function App() {
  return <div data-testid="This text will not be localized">Content</div>;
}
```

### String literals

```tsx
import React from "react";

const exampleText = "This text will not be localized.";

export function App() {
  return <div>{exampleText}</div>;
}
```

### Template literals

```tsx
import React from "react";

const exampleText = `This text will not be localized.`;

export function App() {
  return <div>{exampleText}</div>;
}
```

### Conditional strings

```tsx
import { Fragment, useState } from "react";

export function App() {
  const [isVisible, setIsVisible] = useState(false);

  return <>{isVisible && "This text will not be localized."}</>;
}
```

## Restrictions

- Do not localize content yourself.
- Do not explicitly load localized content into the app.
- Do not hallucinate React hooks (e.g., `useTranslation`).
- Do not hallucinate React components (e.g., `FormattedMessage`).
- Do not hallucinate methods (e.g., `localizeText`).
