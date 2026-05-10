# Quick Start Guide

Get started with Pay2Nature Widget SDK in 5 minutes!

## Installation

```bash
npm install @pay2nature/widget-sdk
```

## Basic Usage

### 1. Vanilla JavaScript (Simplest)

```html
<div id="pay2nature-widget"></div>

<script type="module">
    import Pay2NatureWidget from "@pay2nature/widget-sdk";

    new Pay2NatureWidget({
        widgetToken: "your-widget-token",
        baseUrl: "https://api.pay2nature.com",
        container: document.getElementById("pay2nature-widget"),
    });
</script>
```

### 2. React (Most Popular)

```tsx
import { Pay2NatureWidgetComponent } from "@pay2nature/widget-sdk";

function App() {
    return (
        <Pay2NatureWidgetComponent
            widgetToken="your-widget-token"
            baseUrl="https://api.pay2nature.com"
        />
    );
}
```

### 3. Next.js

```tsx
"use client";

import { Pay2NatureWidgetComponent } from "@pay2nature/widget-sdk";

export default function Page() {
    return (
        <Pay2NatureWidgetComponent
            widgetToken={process.env.NEXT_PUBLIC_WIDGET_TOKEN!}
            baseUrl={process.env.NEXT_PUBLIC_API_URL!}
        />
    );
}
```

### 4. Vue.js

```vue
<template>
    <Pay2NatureWidget :widget-token="widgetToken" :base-url="baseUrl" />
</template>

<script setup>
import Pay2NatureWidget from "@pay2nature/widget-sdk/vue/Pay2NatureWidget.vue";

const widgetToken = "your-widget-token";
const baseUrl = "https://api.pay2nature.com";
</script>
```

### 5. jQuery

```html
<div id="pay2nature-widget"></div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="node_modules/@pay2nature/widget-sdk/dist/index.umd.js"></script>

<script>
    $("#pay2nature-widget").pay2nature({
        widgetToken: "your-widget-token",
        baseUrl: "https://api.pay2nature.com",
    });
</script>
```

## Get Your Widget Token

1. Log in to your Pay2Nature dashboard
2. Navigate to Widget Settings
3. Copy your widget token
4. Use it in the `widgetToken` prop/option

## Handle Events

```typescript
const widget = new Pay2NatureWidget({
    widgetToken: "your-token",
    baseUrl: "https://api.pay2nature.com",
    container: document.getElementById("widget"),
    onContribution: (data) => {
        console.log("Contribution:", data);
        // data.amount, data.currency, data.paymentUrl
    },
    onError: (error) => {
        console.error("Error:", error);
    },
});
```

## Next Steps

- Read the [Full README](./README.md) for detailed API documentation
- Check [Implementation Guide](./IMPLEMENTATION_GUIDE.md) for advanced usage
- See [Examples](./examples/) folder for complete examples

## Need Help?

- GitHub Issues: [Create an issue](https://github.com/IndelibleIncLtd/pay2nature-web-sdk/issues)
- Email: london@indelible-inclusion.com
