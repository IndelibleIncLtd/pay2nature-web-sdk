# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-05-10

### Security

- **XSS fix:** API-sourced `activeProjectName` and `result.projectName` are now
  rendered via `textContent` instead of being interpolated into `innerHTML`.
  Previously a malicious project name could execute script in the host page.
- **XSS fix:** `renderError` now uses `textContent` for the error message so
  that error strings originating from the API can never inject markup.

### Added

- New `requestTimeoutMs` option on `Pay2NatureWidgetOptions` (default `30000`).
  All widget HTTP requests now run through an `AbortController` with this
  timeout; the config GET also retries up to 3 times with exponential backoff
  on network/5xx errors. Payment POSTs use the timeout but are **never**
  retried, to avoid double-charge risk.
- New `mobileMoneyModalUrl` option to override the URL the widget uses to
  load the mobile-money modal script. Useful for self-hosted deployments
  and for pinning a specific modal version.
- Public `setEnabled(isEnabled)` method on `Pay2NatureWidget`. The previously
  declared `onToggle` callback now actually fires when this method changes
  the widget's enabled state.
- Public `isWidgetEnabled()` getter.
- Vue component now declares `emits: ['contribution', 'error', 'toggle']` and
  emits each event in addition to invoking the corresponding prop callback.
  This unblocks `@contribution`, `@error`, and `@toggle` template syntax.
- jQuery plugin now warns and exits early if jQuery is not present, instead
  of silently failing.
- `displayName` set on `Pay2NatureWidgetComponent` for better React DevTools
  output.
- **Accessibility:** the widget root now has `role="region"` with an
  `aria-label`; amount buttons expose `aria-pressed` and `aria-label`; the
  custom-amount input has a properly associated `<label>` and `aria-label`;
  the contribute button has `aria-label`; a visually-hidden `aria-live`
  region announces error/status updates to screen readers.

### Changed

- **Behavior change:** `containerId` in both the React and Vue wrappers no
  longer defaults to the literal `"pay2nature-widget"`. If omitted, the
  component now generates a unique id (e.g. `pay2nature-widget-1`) so
  multiple instances on the same page produce valid HTML. **Migration:** if
  you previously targeted `#pay2nature-widget` in CSS or tests for the
  default-mounted widget, switch to `className` or pass `containerId`
  explicitly.
- When the mobile-money modal script fails to load and the user attempts a
  GHS payment, the widget now surfaces a user-facing error and invokes
  `onError` instead of silently logging to the console.
- Vue `style` prop now accepts `string | Record<string, string | number>`
  instead of only object form.
- Vue component watches `widgetToken` and `baseUrl` separately and stores
  watcher stop handles, which are called in `onBeforeUnmount`.
- React component no longer wraps init in `requestAnimationFrame` — the
  delay was unnecessary and slowed first paint slightly.
- All event listeners attached inside `attachEventListeners()` are now
  tracked and removed in `destroy()` (and re-attach cycles).
- Removed the duplicate `attachEventListeners()` call from `init()`; it was
  attaching every handler twice on first load, causing each click to fire
  the contribute action twice.
- TypeScript: `moduleResolution` switched from `"node"` to `"bundler"`;
  `types: ["node"]` removed (this is a browser SDK and doesn't need Node
  type definitions).
- `package.json`: added `sideEffects: false` for tree-shaking; added
  `src/vue` and `CHANGELOG.md` to `files`; replaced placeholder failing
  `test` script with a non-blocking placeholder.
- `.npmignore`: now correctly includes `src/vue/` in published package so
  the `./vue` export resolves for consumers.

### Documentation

- New **Security & CSP** section covering required directives.
- New **Mobile Money (GHS)** section explaining the dynamic modal load and
  how to override the modal URL.
- New **Multiple Widgets on the Same Page** section.
- New **Vue: ships as a single-file component** section explaining why we
  do not pre-compile the `.vue` export (cross-version Vue support).

### Removed

- Dead instance fields `isLoading` and `showMobileMoneyPrompt` (set but
  never read).

## [1.0.3] - 2025-01-XX

### Fixed

- Fixed Shadow DOM creation error in React StrictMode
  - Added race condition protection when creating shadow roots
  - Improved error handling to gracefully handle cases where shadow root already exists
  - Added defensive checks before and during shadow root attachment
  - Fixed TypeScript type inference issues in shadow DOM creation

## [1.0.2] - 2025-01-XX

### Fixed

- Fixed Shadow DOM error: "Shadow root cannot be created on a host which already hosts a shadow tree"
  - React component now properly destroys existing widget instances before creating new ones
  - Shadow DOM creation now reuses existing shadow roots and clears content instead of attempting to create duplicate shadow roots
  - Improved error handling in `createShadowDOM()` method

- Fixed DOM manipulation error: "Failed to execute 'removeChild' on 'Node'"
  - Updated `destroy()` method to properly clear shadow root content instead of attempting to remove it as a child
  - Shadow roots are now properly managed during widget lifecycle

- Fixed React component re-initialization issues
  - Callbacks are now stored in a ref to prevent unnecessary re-renders
  - Widget only re-initializes when `widgetToken` or `baseUrl` change, not when callbacks change
  - Proper cleanup of widget instances before creating new ones

## [1.0.1] - 2024-01-XX

### Fixed

- Initial bug fixes and improvements

## [1.0.0] - 2024-01-XX

### Added

- Initial release of Pay2Nature Widget SDK
- Core widget class with Shadow DOM support
- React component wrapper
- Vue.js component wrapper
- jQuery plugin wrapper
- TypeScript definitions
- Support for multiple module formats (CJS, ESM, UMD)
- Stripe payment integration
- Mobile money payment integration
- Event callbacks (onContribution, onError, onToggle)
- Comprehensive documentation
- Usage examples for all supported frameworks

### Framework Support

- React 16.8+
- Vue.js 2.6+ and 3.0+
- Next.js (App Router and Pages Router)
- jQuery 1.7+
- Vanilla JavaScript

### Features

- Style isolation via Shadow DOM
- Responsive design
- Error handling
- Payment flow support (Stripe and Mobile Money)
- Dynamic configuration loading
- Widget lifecycle management

[Unreleased]: https://github.com/IndelibleIncLtd/pay2nature-web-sdk/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/IndelibleIncLtd/pay2nature-web-sdk/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/IndelibleIncLtd/pay2nature-web-sdk/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/IndelibleIncLtd/pay2nature-web-sdk/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/IndelibleIncLtd/pay2nature-web-sdk/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/IndelibleIncLtd/pay2nature-web-sdk/releases/tag/v1.0.0
