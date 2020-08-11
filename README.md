# Make Directory Tree (for those who need support for Node.js v8.0.0)

This function encapsulates the logic necessary to create a full directory tree (recursively). Since the *recursive* flag was only added to the *mkdir* function from the native *fs* package on version 10.x, I created this function to fill this gap

## Installation

```bash
npm install --save mkdirt
```

## Usage / Example

```javascript
const mkdirt = require('mkdirt');

async function main() {
    await mkdirt('x/y/z', 0o775);
}

main();
```
