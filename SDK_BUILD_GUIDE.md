# Pay2Nature SDK Build Guide

This guide explains how to build, test, and publish the Pay2Nature Widget SDK to npm.

## Project Structure

```
pay2nature-sdk/
├── src/
│   ├── core/
│   │   └── Pay2NatureWidget.ts      # Core widget class (framework-agnostic)
│   ├── react/
│   │   └── Pay2NatureWidget.tsx      # React component wrapper
│   ├── vue/
│   │   └── Pay2NatureWidget.vue      # Vue component wrapper
│   ├── jquery/
│   │   └── pay2nature.jquery.ts      # jQuery plugin wrapper
│   └── index.ts                      # Main entry point
├── dist/                             # Built files (generated)
├── package.json
├── tsconfig.json
├── rollup.config.js
└── README.md
```

## Prerequisites

1. Node.js 18+ and npm
2. TypeScript knowledge
3. Understanding of module bundling (ESM, CommonJS, UMD)

## Build Process

### 1. Install Dependencies

```bash
cd pay2nature-sdk
npm install
```

### 2. Build the SDK

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Generate multiple output formats:
  - `dist/index.cjs.js` - CommonJS (for Node.js)
  - `dist/index.esm.js` - ES Modules (for modern bundlers)
  - `dist/index.umd.js` - UMD (for browser script tags)
  - `dist/index.d.ts` - TypeScript definitions

### 3. Watch Mode (Development)

```bash
npm run build:watch
```

## Module Formats Explained

### CommonJS (CJS)
- Used by Node.js and older bundlers
- Entry point: `dist/index.cjs.js`
- Import: `const Pay2NatureWidget = require('@pay2nature/widget-sdk')`

### ES Modules (ESM)
- Modern JavaScript standard
- Entry point: `dist/index.esm.js`
- Import: `import Pay2NatureWidget from '@pay2nature/widget-sdk'`

### UMD (Universal Module Definition)
- Works in browsers (with script tag) and AMD/CommonJS
- Entry point: `dist/index.umd.js`
- Global variable: `Pay2NatureWidget`
- Script tag: `<script src="dist/index.umd.js"></script>`

## Testing Locally

### 1. Link the Package Locally

```bash
cd pay2nature-sdk
npm link
```

### 2. Use in Another Project

```bash
cd ../your-test-project
npm link @pay2nature/widget-sdk
```

### 3. Test Different Frameworks

Create test projects for each framework:

#### React Test
```bash
npx create-react-app test-react
cd test-react
npm link @pay2nature/widget-sdk
```

#### Vue Test
```bash
npm create vue@latest test-vue
cd test-vue
npm link @pay2nature/widget-sdk
```

#### Next.js Test
```bash
npx create-next-app@latest test-nextjs
cd test-nextjs
npm link @pay2nature/widget-sdk
```

## Publishing to npm

### 1. Prepare for Publishing

- Update version in `package.json`
- Update `CHANGELOG.md`
- Smoke-test the build in a real consumer app (a test suite is on the roadmap but not yet shipped)
- Build the package: `npm run build`

### 2. Check What Will Be Published

```bash
npm pack --dry-run
```

This shows what files will be included in the package.

### 3. Login to npm

```bash
npm login
```

### 4. Publish

For first release:
```bash
npm publish --access public
```

For updates:
```bash
npm version patch  # or minor, major
npm publish
```

### 5. Verify Publication

```bash
npm view @pay2nature/widget-sdk
```

## Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

## Package.json Configuration

Key fields explained:

- `main`: CommonJS entry point (Node.js)
- `module`: ES Module entry point (modern bundlers)
- `browser`: UMD bundle (browser script tags)
- `types`: TypeScript definitions
- `files`: What gets published (only `dist/` folder)

## Framework Compatibility

### React
- Uses React hooks (useEffect, useRef)
- Compatible with React 16.8+
- Works with React 17 and 18

### Vue.js
- Uses Composition API
- Compatible with Vue 2.6+ and Vue 3
- Requires Vue SFC compiler

### Next.js
- Works with both Pages Router and App Router
- Use `'use client'` directive for App Router
- Server-side rendering compatible

### jQuery
- Auto-initializes when jQuery is detected
- No jQuery version dependency
- Works with jQuery 1.7+

### Vanilla JavaScript
- Pure JavaScript, no dependencies
- Works in any modern browser
- Shadow DOM for style isolation

## Troubleshooting

### Build Errors

1. **TypeScript errors**: Check `tsconfig.json` settings
2. **Rollup errors**: Verify `rollup.config.js` configuration
3. **Missing types**: Ensure `@types/*` packages are installed

### Import Errors

1. **Module not found**: Check package.json `exports` field
2. **Type errors**: Ensure TypeScript definitions are generated
3. **Framework-specific errors**: Check peer dependencies

### Publishing Errors

1. **403 Forbidden**: Check npm login and package name availability
2. **Version exists**: Increment version number
3. **Missing files**: Check `.npmignore` and `files` in package.json

## Best Practices

1. **Always test locally** before publishing
2. **Use semantic versioning** consistently
3. **Update README** with new features
4. **Write changelog** entries
5. **Test in all target frameworks** before release
6. **Keep bundle size small** (check with `npm run build` output)
7. **Document breaking changes** clearly

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

## Additional Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Rollup Documentation](https://rollupjs.org/)
- [Semantic Versioning](https://semver.org/)

