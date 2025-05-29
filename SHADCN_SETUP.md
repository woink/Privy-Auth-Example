# shadcn/ui Setup Documentation

This project has been successfully configured with shadcn/ui components library working alongside Tailwind CSS v4.

## 🎯 Installation Summary

### ✅ What's Installed

- **shadcn/ui** - Modern, accessible UI components
- **Tailwind CSS v4.1.8** - Latest version with PostCSS integration
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Class Variance Authority** - Component variants system
- **Tailwind Merge** - Utility class merging

### 📦 Available Components

The following shadcn/ui components are ready to use:

- `Button` - Various button styles and sizes
- `Card` - Card container with header/content sections
- `Input` - Form input fields
- `Label` - Form labels
- `Alert` - Alert/notification messages
- `Badge` - Status badges and tags
- `Skeleton` - Loading placeholders

## 🚀 Usage Examples

### Basic Button

```tsx
import { Button } from "@/components/ui/button";

<Button>Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Small outline</Button>
```

### Card Component

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card className="w-96">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

### Form Controls

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="Enter your email" />
</div>
```

### Alert Messages

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>
    This is an alert message.
  </AlertDescription>
</Alert>
```

## 🔧 Configuration Files

### components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.scss",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "iconLibrary": "lucide-react"
}
```

### PostCSS Configuration
```javascript
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

## ➕ Adding More Components

To add additional shadcn/ui components:

```bash
# Add a single component
pnpm dlx shadcn@latest add dialog

# Add multiple components
pnpm dlx shadcn@latest add dialog dropdown-menu tabs

# List all available components
pnpm dlx shadcn@latest add --help
```

## 🎨 Styling & Theming

### CSS Variables
The project uses CSS variables for theming, defined in `src/app/globals.scss`:

```scss
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  // ... more variables
}
```

### Custom Utility Classes
Custom component styles using Tailwind's `@apply`:

```scss
.button-primary {
  @apply bg-emerald-500 border-0 rounded-lg text-white text-base font-semibold px-6 py-4;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply hover:bg-emerald-600 hover:disabled:bg-emerald-500;
}
```

## 🔧 Utility Functions

### cn() Helper
Located in `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

This function combines and deduplicates Tailwind CSS classes.

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── AuthStatus.tsx         # Updated to use Button
│   ├── UserWallet.tsx         # Updated to use Card
│   ├── Transfer.tsx           # Updated to use Card, Input, Label
│   └── WalletLoading.tsx      # Updated to use Skeleton
├── lib/
│   └── utils.ts              # Utility functions
└── app/
    ├── globals.scss          # Global styles + shadcn variables
    └── ...
```

## 🎯 Component Updates Made

### AuthStatus.tsx
- Replaced custom buttons with shadcn `Button` component
- Uses `variant="destructive"` for logout button

### UserWallet.tsx
- Wrapped in shadcn `Card` component
- Uses `CardHeader`, `CardTitle`, and `CardContent`
- Better semantic structure

### Transfer.tsx
- Complete redesign using shadcn components
- Uses `Card`, `Input`, `Label`, and `Button`
- Proper form spacing with `space-y-*` classes

### WalletLoading.tsx
- Uses shadcn `Skeleton` component for loading states
- Cleaner loading animation

## ✅ Best Practices

1. **Import from ui folder**: Always import components from `@/components/ui/`
2. **Use cn() utility**: Combine classes with the `cn()` helper function
3. **Follow component patterns**: Use the established Card → CardHeader → CardContent structure
4. **Leverage variants**: Use component variants instead of custom styling
5. **Maintain accessibility**: shadcn/ui components are built with accessibility in mind

## 🚨 Known Compatibility Notes

- **Tailwind v4**: This setup works with Tailwind CSS v4.1.8
- **No traditional config**: Tailwind v4 doesn't require a traditional `tailwind.config.js` when using PostCSS
- **CSS Variables**: Uses HSL color values in CSS variables for theming
- **Next.js 15**: Fully compatible with Next.js 15 and React 19

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Lucide Icons](https://lucide.dev)
