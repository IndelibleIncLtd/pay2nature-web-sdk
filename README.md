# Pay2Nature Widget SDK

Universal SDK for integrating Pay2Nature payment widgets into any web application. Compatible with React, Vue.js, Next.js, jQuery, and Vanilla JavaScript.

## Installation

```bash
npm install @pay2nature/widget-sdk
```

or

```bash
yarn add @pay2nature/widget-sdk
```

## Quick Start

### HTML/CDN (Simplest Method)

The easiest way to integrate the Pay2Nature widget is by adding a script tag in the `<head>` and a div in the `<body>` with data attributes.

**Important:**

- The `<script>` tag must be placed within the `<head>` section
- The `<div>` element must be placed within the `<body>` section

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Pay2Nature Widget</title>
        <script src="https://pay2nature-widget-testing-335180951943.europe-west4.run.app/widget/pay2nature.js"></script>
    </head>
    <body>
        <div
            id="pay2nature-widget"
            data-widget-token="59a7745632f08223fc2caa1f59fca7b6"
            data-base-url="https://pay2nature-widget-testing-335180951943.europe-west4.run.app"
        ></div>
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
                baseUrl: "https://api.pay2nature.com",
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
            baseUrl="https://api.pay2nature.com"
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
    return (
        <div>
            <h1>Support Nature Conservation</h1>
            <Pay2NatureWidgetComponent
                widgetToken={process.env.NEXT_PUBLIC_WIDGET_TOKEN!}
                baseUrl={process.env.NEXT_PUBLIC_API_URL!}
                onContribution={(data) => {
                    // Handle contribution
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
const baseUrl = ref("https://api.pay2nature.com");

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
        <script src="node_modules/@pay2nature/widget-sdk/dist/index.umd.js"></script>
    </head>
    <body>
        <div id="pay2nature-widget"></div>

        <script>
            $(document).ready(function () {
                $("#pay2nature-widget").pay2nature({
                    widgetToken: "your-widget-token",
                    baseUrl: "https://api.pay2nature.com",
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
        baseUrl: "https://api.pay2nature.com",
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
    onToggle?: (isEnabled: boolean) => void; // Optional: Callback for widget state changes
    onError?: (error: Error) => void; // Optional: Error callback
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

## React Component Props

```typescript
interface Pay2NatureWidgetProps {
    widgetToken: string;
    baseUrl: string;
    containerId?: string; // Default: 'pay2nature-widget'
    onContribution?: (data: ContributionData) => void;
    onToggle?: (isEnabled: boolean) => void;
    onError?: (error: Error) => void;
    className?: string;
    style?: React.CSSProperties;
}
```

## jQuery Plugin Methods

### Initialize

```javascript
$("#widget-container").pay2nature({
    widgetToken: "your-token",
    baseUrl: "https://api.pay2nature.com",
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
NEXT_PUBLIC_API_URL=https://api.pay2nature.com
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

- GitHub Issues: https://github.com/IndelibleIncLtd/Pay2nature-web-sdk/issues
- Email: support@pay2nature.co.uk
