# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/IndelibleIncLtd/pay2nature-web-sdk/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/IndelibleIncLtd/pay2nature-web-sdk/releases/tag/v1.0.0
