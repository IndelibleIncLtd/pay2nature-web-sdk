# Pay2Nature Widget Web SDK

Universal SDK for integrating Pay2Nature payment widgets into any web application. Compatible with React, Vue.js, Next.js, jQuery, and Vanilla JavaScript.

## Installation

```bash
npm install @pay2nature/widget-sdk
```

or

```bash
yarn add @pay2nature/widget-sdk
```

## Configuration Parameters

Before integrating the widget, you'll need to configure the following parameters:

- **widgetToken**: Your unique widget token. To generate a token, visit [https://pay2nature-widget-testing-335180951943.europe-west4.run.app/widget](https://pay2nature-widget-testing-335180951943.europe-west4.run.app/widget)
- **baseUrl**: The base URL for the Pay2Nature API (e.g., `BASE_URL`)

## Quick Start

### HTML/CDN (Simplest Method)

Load the SDK from a public CDN such as **unpkg** or **jsDelivr**, then create a widget instance from a `<script>` block. The UMD bundle exposes `Pay2NatureWidget` on the global `window`.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Pay2Nature Widget</title>
        <!-- UMD bundle from CDN -->
        <script src="https://unpkg.com/@pay2nature/widget-sdk/dist/index.umd.js"></script>
    </head>
    <body>
        <div id="pay2nature-widget"></div>

        <script>
            new Pay2NatureWidget({
                widgetToken: "your-widget-token",
                baseUrl: "BASE_URL",
                container: document.getElementById("pay2nature-widget"),
                onContribution: (data) => console.log("Contribution:", data),
                onError: (error) => console.error("Error:", error),
            });
        </script>
    </body>
</html>
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Pay2Nature Widget</title>
    </head>
    <body>
        <div id="pay2nature-widget"></div>

        <script type="module">
            import Pay2NatureWidget from "@pay2nature/widget-sdk";

            const widget = new Pay2NatureWidget({
                widgetToken: "your-widget-token",
                baseUrl: "BASE_URL",
                container: document.getElementById("pay2nature-widget"),
                onContribution: (data) => {
                    console.log("Contribution made:", data);
                },
                onError: (error) => {
                    console.error("Error:", error);
                },
            });
        </script>
    </body>
</html>
```

### React

```tsx
import React from "react";
import { Pay2NatureWidgetComponent } from "@pay2nature/widget-sdk";

function App() {
    return (
        <Pay2NatureWidgetComponent
            widgetToken="your-widget-token"
            baseUrl="BASE_URL"
            onContribution={(data) => {
                console.log("Contribution made:", data);
            }}
            onError={(error) => {
                console.error("Error:", error);
            }}
        />
    );
}

export default App;
```

### Next.js

```tsx
"use client"; // For Next.js 13+ App Router

import { Pay2NatureWidgetComponent } from "@pay2nature/widget-sdk";

export default function DonationPage() {
    // Read env vars defensively rather than asserting non-null with `!`.
    // If a variable is missing, surface it instead of crashing inside the SDK.
    const widgetToken = process.env.NEXT_PUBLIC_WIDGET_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!widgetToken || !baseUrl) {
        return <p>Missing NEXT_PUBLIC_WIDGET_TOKEN or NEXT_PUBLIC_API_URL.</p>;
    }

    return (
        <div>
            <h1>Support Nature Conservation</h1>
            <Pay2NatureWidgetComponent
                widgetToken={widgetToken}
                baseUrl={baseUrl}
                onContribution={(data) => {
                    console.log("Contribution:", data);
                }}
            />
        </div>
    );
}
```

### Vue.js

```vue
<template>
    <Pay2NatureWidget
        :widget-token="widgetToken"
        :base-url="baseUrl"
        @contribution="handleContribution"
        @error="handleError"
    />
</template>

<script setup lang="ts">
import { ref } from "vue";
import Pay2NatureWidget from "@pay2nature/widget-sdk/vue/Pay2NatureWidget.vue";

const widgetToken = ref("your-widget-token");
const baseUrl = ref("BASE_URL");

const handleContribution = (data) => {
    console.log("Contribution made:", data);
};

const handleError = (error) => {
    console.error("Error:", error);
};
</script>
```

### jQuery

**Using UMD bundle (CDN/Script tag):**

```html
<!DOCTYPE html>
<html>
    <head>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <!-- Use a CDN in production rather than referencing node_modules. -->
        <script src="https://unpkg.com/@pay2nature/widget-sdk/dist/index.umd.js"></script>
    </head>
    <body>
        <div id="pay2nature-widget"></div>

        <script>
            $(document).ready(function () {
                $("#pay2nature-widget").pay2nature({
                    widgetToken: "your-widget-token",
                    baseUrl: "BASE_URL",
                    onContribution: function (data) {
                        console.log("Contribution made:", data);
                    },
                    onError: function (error) {
                        console.error("Error:", error);
                    },
                });
            });
        </script>
    </body>
</html>
```

**Using module bundler:**

```javascript
import $ from "jquery";
import "@pay2nature/widget-sdk/jquery"; // Registers the plugin

$(document).ready(function () {
    $("#pay2nature-widget").pay2nature({
        widgetToken: "your-widget-token",
        baseUrl: "BASE_URL",
    });
});
```

## API Reference

### Pay2NatureWidgetOptions

```typescript
interface Pay2NatureWidgetOptions {
    widgetToken: string; // Required: Your widget token
    baseUrl: string; // Required: API base URL
    container?: HTMLElement | string | null; // Optional: Container element or selector
    onContribution?: (data: ContributionData) => void; // Optional: Callback for contributions
    onToggle?: (isEnabled: boolean) => void; // Fires when setEnabled() changes the widget state
    onError?: (error: Error) => void; // Optional: Error callback
    requestTimeoutMs?: number; // Optional: Per-request timeout, default 30000ms
    mobileMoneyModalUrl?: string; // Optional: Override URL for the mobile-money modal script
}
```

### ContributionData

```typescript
interface ContributionData {
    amount: number;
    currency: string;
    paymentUrl?: string; // For Stripe payments
    projectName?: string;
    paymentToken?: string; // For mobile money payments
}
```

### Methods

#### `destroy()`

Destroys the widget instance and cleans up resources.

```typescript
const widget = new Pay2NatureWidget({...});
// ... later
widget.destroy();
```

#### `updateConfig(config: Partial<WidgetConfig>)`

Updates the widget configuration dynamically.

```typescript
widget.updateConfig({
    minAmount: 1.0,
    maxAmount: 10.0,
});
```

#### `setEnabled(isEnabled: boolean)`

Enables or disables the widget. When disabled, the contribute button is greyed out and clicks have no effect. Fires the `onToggle` callback with the new state.

```typescript
widget.setEnabled(false); // disables the widget; onToggle(false) fires
widget.setEnabled(true);  // re-enables; onToggle(true) fires
```

#### `isWidgetEnabled(): boolean`

Returns the current enabled state.

## Security & Content Security Policy

The widget renders inside a Shadow DOM and never uses `innerHTML` for any value sourced from your API (project names, error messages, etc.) — those are inserted via `textContent` or structured DOM APIs. If you operate under a strict Content Security Policy, the following directives are typically required:

- `connect-src` — must include the `baseUrl` you pass to the widget so the configuration and payment API calls succeed.
- `img-src` — must include `https://storage.googleapis.com` for the brand logo.
- `script-src` — must include the host serving the widget bundle (e.g. `https://unpkg.com` if loading from a public CDN). The widget also dynamically loads the mobile-money modal script from `${baseUrl}/widget/mobile-money-modal.js` when the configured currency is `GHS`.
- `frame-src` / `popup` — Stripe payment links open in a new tab via `window.open(...)`.

There is **no inline script execution** in the widget itself; `'unsafe-inline'` is not required for `script-src`.

## Mobile Money (GHS)

When the widget configuration returns a `currency` of `GHS`, the contribute
button opens a mobile-money modal instead of a Stripe payment link. The modal
script is loaded dynamically from `${baseUrl}/widget/mobile-money-modal.js` at
widget initialization time. If you self-host the widget bundle, you can
override this with `mobileMoneyModalUrl`:

```javascript
new Pay2NatureWidget({
    widgetToken: "your-widget-token",
    baseUrl: "https://api.example.com",
    mobileMoneyModalUrl: "https://cdn.example.com/p2n/mobile-money-modal.v1.js",
});
```

If the modal script fails to load, the widget will surface a user-facing
error and invoke `onError` rather than failing silently.

## Multiple Widgets on the Same Page

You can mount any number of widget instances on the same page. Each instance
gets its own Shadow DOM, its own configuration fetch, and (in React/Vue) an
auto-generated unique container `id` so the DOM remains valid. If you need a
stable selector for a specific instance, pass `containerId` explicitly:

```tsx
<Pay2NatureWidgetComponent containerId="header-widget" widgetToken={...} baseUrl={...} />
<Pay2NatureWidgetComponent containerId="footer-widget" widgetToken={...} baseUrl={...} />
```

For vanilla JavaScript, just construct each `Pay2NatureWidget` with a
different `container` element — there is no shared global state.

## Vue: ships as a single-file component

The Vue export (`@pay2nature/widget-sdk/vue/Pay2NatureWidget.vue`) ships as
the original `.vue` source so it can be compiled by your existing Vue
toolchain (Vite, vue-loader, Nuxt, etc.) against the Vue version you are
using. We do **not** pre-compile it because the SDK supports both Vue 2
(`^2.6.0`) and Vue 3 (`^3.0.0`) and shipping a single pre-compiled artifact
would force a runtime choice. If you encounter resolution issues, ensure
your bundler is configured to handle `.vue` imports (Vite does this out of
the box).

## React Component Props

```typescript
interface Pay2NatureWidgetProps {
    widgetToken: string;
    baseUrl: string;
    containerId?: string; // Auto-generated unique id if omitted (e.g., "pay2nature-widget-1")
    onContribution?: (data: ContributionData) => void;
    onToggle?: (isEnabled: boolean) => void;
    onError?: (error: Error) => void;
    className?: string;
    style?: React.CSSProperties;
}
```

> **Heads up (changed in 1.1.0):** `containerId` now defaults to an
> auto-generated unique value rather than the literal string
> `"pay2nature-widget"`. This prevents invalid duplicate-id HTML when you
> render multiple widgets on the same page. If you previously targeted
> `#pay2nature-widget` in CSS or tests, switch to a class on the wrapper
> via `className`, or pass an explicit `containerId` prop.

## jQuery Plugin Methods

### Initialize

```javascript
$("#widget-container").pay2nature({
    widgetToken: "your-token",
    baseUrl: "BASE_URL",
});
```

### Destroy

```javascript
$("#widget-container").pay2nature("destroy");
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## TypeScript Support

The SDK includes full TypeScript definitions. Import types as needed:

```typescript
import type {
    Pay2NatureWidgetOptions,
    ContributionData,
    WidgetConfig,
} from "@pay2nature/widget-sdk";
```

## Environment Variables

For Next.js and other frameworks, you can use environment variables:

```env
NEXT_PUBLIC_WIDGET_TOKEN=your-widget-token
NEXT_PUBLIC_API_URL=BASE_URL
```

## Error Handling

Always provide an `onError` callback to handle errors gracefully:

```typescript
const widget = new Pay2NatureWidget({
    // ... other options
    onError: (error) => {
        console.error("Widget error:", error);
        // Show user-friendly error message
        alert("Unable to load payment widget. Please try again later.");
    },
});
```

## Styling

The widget uses Shadow DOM for style isolation, so it won't be affected by your site's CSS. The widget comes with a default green theme that matches Pay2Nature branding.

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

## License

MIT

## Support

For issues and questions:

- GitHub Issues: https://github.com/IndelibleIncLtd/pay2nature-web-sdk/issues
- Email: support@pay2nature.co.uk
