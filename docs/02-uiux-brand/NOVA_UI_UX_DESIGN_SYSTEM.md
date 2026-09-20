# Nova UI/UX Design System Specification

Version: 1.0
Product: Nova
Platforms: Web and Mobile
Framework: Next.js + React
Design Tool: Figma
Status: Source of Truth

## 1. Purpose

Nova is a modern multi-vendor marketplace starting in Sierra Leone and designed to expand across Africa.

Nova supports:

- B2C
- B2B
- C2C
- New products
- Used products
- Refurbished products
- Upcycled and recycled products
- Custom-made products
- Multiple sellers
- Local payments
- Delivery
- Seller stores
- Customer accounts
- Rider operations
- Platform administration

The interface must communicate:

- Trust
- Simplicity
- Accessibility
- Reliability
- Modern commerce
- African market relevance
- Scalability

The interface must not feel like a generic marketplace template.

---

## 2. Design Principles

### 2.1 Clarity First

Every screen must have a clear primary action.

Users should immediately understand:

- Where they are
- What they can do
- What happened
- What happens next

Avoid unnecessary visual elements.

### 2.2 Consistency

A component should look and behave consistently throughout Nova.

Do not create multiple versions of:

- Buttons
- Inputs
- Product cards
- Modals
- Alerts
- Navigation
- Tables
- Badges

unless the difference represents a deliberate variant.

### 2.3 Mobile First

Design for small screens first.

Primary breakpoints:

- Mobile: 0–639px
- Tablet: 640–1023px
- Desktop: 1024–1279px
- Large Desktop: 1280px+

Never design desktop-only interfaces.

### 2.4 Accessibility

Target WCAG 2.2 AA.

Requirements:

- Keyboard navigation
- Visible focus states
- Adequate contrast
- Semantic HTML
- Screen-reader labels
- Accessible form errors
- Minimum practical touch target of 44px
- Never communicate meaning through color alone

### 2.5 Performance

Visual quality must not come at the expense of performance.

Prefer:

- Optimized images
- Next.js Image
- Lazy loading
- Skeleton states
- Server components where appropriate
- Minimal client-side JavaScript
- Reusable components
- Limited animation

---

## 3. Visual Direction

Nova should feel:

- Clean
- Modern
- Trustworthy
- Warm
- Practical
- Premium without being expensive-looking

Avoid:

- Excessive gradients
- Excessive glassmorphism
- Huge shadows
- Excessive rounded cards
- Too many colors
- Decorative animations
- Overloaded dashboards
- Tiny text
- Dense layouts
- Random icon styles

Nova should feel like a serious African technology company.

---

## 4. Design Tokens

All visual values must come from tokens.

Never introduce arbitrary values when an existing token can be used.

Tokens should cover:

- Colors
- Typography
- Spacing
- Border radius
- Shadows
- Breakpoints
- Z-index
- Motion
- Component states

---

## 5. Color System

The exact Nova brand colors must come from the approved Nova logo and Figma brand foundation.

Do not invent new brand colors in individual components.

Use semantic tokens rather than hardcoded colors.

Recommended token structure:

```css
:root {
  --color-brand-primary: ...;
  --color-brand-primary-hover: ...;
  --color-brand-primary-active: ...;

  --color-background: ...;
  --color-surface: ...;
  --color-surface-muted: ...;

  --color-text-primary: ...;
  --color-text-secondary: ...;
  --color-text-muted: ...;
  --color-text-disabled: ...;

  --color-border: ...;
  --color-border-strong: ...;

  --color-success: ...;
  --color-warning: ...;
  --color-error: ...;
  --color-info: ...;
}
```

Semantic usage:

Primary:

- Main CTA
- Important links
- Selected navigation
- Important actions

Success:

- Successful payment
- Completed order
- Verified seller
- Successful action

Warning:

- Pending state
- Attention required
- Low stock

Error:

- Failed payment
- Validation error
- Cancelled order
- Destructive action

Info:

- Informational messages
- Product information
- System announcements

Do not use brand colors to communicate success or errors.

---

## 6. Typography

Use a modern, highly readable sans-serif typeface.

Preferred:

- Primary: Inter
- Fallback: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

If the approved Figma brand system selects another font, that font becomes the source of truth.

Type scale:

- Display: 48–64px
- H1: 40–48px
- H2: 32–40px
- H3: 24–32px
- H4: 20–24px
- Body Large: 18px
- Body: 16px
- Body Small: 14px
- Caption: 12px

Mobile headings must scale responsively.

Avoid excessive uppercase text.

---

## 7. Font Weight

Use a limited weight system:

- 400 Regular
- 500 Medium
- 600 Semibold
- 700 Bold

Avoid 800 and 900 unless explicitly required by the brand.

---

## 8. Spacing System

Use a 4px base spacing scale.

Preferred values:

- 4px
- 8px
- 12px
- 16px
- 20px
- 24px
- 32px
- 40px
- 48px
- 64px
- 80px
- 96px

Avoid arbitrary values such as:

```css
margin: 13px;
padding: 17px;
gap: 19px;
```

unless there is a documented reason.

---

## 9. Border Radius

Nova should use moderate rounding.

- Small: 6px
- Medium: 8px
- Large: 12px
- XL: 16px
- Pill: 999px

Recommended:

- Inputs: 8px
- Buttons: 8px
- Product cards: 12px
- Modals: 16px
- Pills: 999px

Do not make every element completely rounded.

---

## 10. Shadows

Nova should use subtle elevation.

Use shadows primarily for:

- Dropdowns
- Popovers
- Modals
- Floating navigation
- Elevated cards

Default cards should normally use borders instead of heavy shadows.

Recommended tokens:

```css
--shadow-sm: ...;
--shadow-md: ...;
--shadow-lg: ...;
```

Avoid strong shadows that make the interface look dated.

---

## 11. Layout System

Use a centered responsive container.

Recommended maximum width:

- Standard: 1280px
- Large desktop: 1440px where appropriate

Standard page structure:

```text
Header
↓
Page container
↓
Page heading
↓
Content
↓
Footer
```

Content should not touch the viewport edges.

---

## 12. Grid System

Desktop:

- 12-column grid

Tablet:

- 8-column grid

Mobile:

- 4-column grid

Product grids:

- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 4 columns
- Large desktop: 5 columns where appropriate

Do not force five columns when product cards become too narrow.

---

## 13. Icon System

Use one icon library consistently.

Preferred:

- Lucide Icons

Do not mix multiple icon libraries unless a specific brand asset requires it.

Common icon sizes:

- 16px
- 20px
- 24px

Avoid oversized icons without a clear purpose.

---

## 14. Buttons

Button variants:

- Primary
- Secondary
- Outline
- Ghost
- Destructive
- Link

Sizes:

- Small
- Medium
- Large
- Icon

Rules:

- One primary CTA per visual section where possible.
- Button text must describe the action.
- Do not use "Click here".
- Disabled buttons must remain readable.
- Loading buttons must prevent accidental duplicate submissions.

Examples:

```text
[ Add to cart ]
[ Buy now ]
[ Contact seller ]
[ View details ]
[ Delete product ]
```

---

## 15. Forms

Forms must have:

- Visible labels
- Helpful placeholders only when necessary
- Clear validation
- Error messages
- Focus states
- Required indicators
- Loading states

Preferred structure:

```text
Product name

[ Enter product name ]

Product name must contain at least 3 characters.
```

Never rely on placeholder text as the only label.

---

## 16. Navigation

Nova has multiple user types, so navigation must adapt to the user's role.

### Customer Navigation

Desktop:

- Nova
- Search
- Categories
- Deals
- Stores
- Orders
- Wishlist
- Cart
- Account

Mobile:

- Home
- Categories
- Search
- Cart
- Account

Mobile bottom navigation should contain no more than five primary destinations.

---

## 17. Header

Desktop header should contain:

- Nova logo
- Categories
- Search
- Location or delivery information
- Account
- Wishlist
- Cart

Search should have strong visual prominence because product discovery is central to Nova.

Mobile header should remain compact:

- Nova logo
- Search
- Cart
- Account

Avoid overcrowding the mobile header.

---

## 18. Search

Search is a core Nova experience.

Support:

- Product search
- Store search
- Category search
- Recent searches
- Suggested searches
- Search history
- Filters
- Sorting

Search states:

- Default
- Focused
- Typing
- Suggestions
- Loading
- Results
- No results
- Error

No-results states should help users recover.

Example:

```text
No products found for "xyz"

Try:
- Checking your spelling
- Using fewer words
- Browsing categories

[ Browse categories ]
```

---

## 19. Product Card

Product cards are core Nova components.

Required information:

- Product image
- Favorite action
- Condition
- Product name
- Store name
- Rating
- Price
- Previous price where applicable
- Availability

Product card variants must support:

- New
- Used
- Refurbished
- Upcycled
- Custom-made
- Out of stock
- Sponsored

Do not overload the card with information.

Recommended hierarchy:

1. Product image
2. Product name
3. Price
4. Store
5. Rating
6. Relevant condition/status

---

## 20. Product Images

Maintain consistent aspect ratios.

Preferred product grid ratio:

- 1:1

Product detail pages may use:

- 4:3
- 1:1

depending on product category.

Never stretch product images.

Use `object-fit` appropriately.

---

## 21. Product Detail Page

The product detail page must prioritize purchase decisions.

Desktop structure:

```text
Image gallery
+
Product information
+
Purchase actions
```

Information hierarchy:

1. Product name
2. Rating
3. Price
4. Condition
5. Availability
6. Seller
7. Description
8. Specifications
9. Delivery information
10. Return information
11. Reviews
12. Related products

Primary actions:

- Add to cart
- Buy now

Secondary actions:

- Save
- Share
- Contact seller

---

## 22. Seller Information

Seller trust is important.

Seller card should show:

- Store logo
- Store name
- Verified status
- Rating
- Number of products
- Location
- Response information

Example:

```text
Nova Electronics
✓ Verified seller

4.8 ★
120 products

Freetown, Sierra Leone

[ Visit store ]
```

Never imply verification unless the backend confirms it.

---

## 23. Categories

Category browsing should be visual and simple.

Potential categories include:

- Electronics
- Fashion
- Home
- Beauty
- Automotive
- Agriculture
- Food
- Services
- Art
- Upcycled
- Refurbished
- Custom Made

The final category taxonomy must come from the backend/domain model.

Do not hardcode categories inside presentation components.

---

## 24. Marketplace Filters

Desktop filters may include:

- Category
- Price
- Condition
- Location
- Seller
- Rating
- Availability

Mobile should use a filter drawer.

The drawer should group related filters and provide:

- Clear all
- Apply filters

Do not create enormous ungrouped filter panels.

---

## 25. Sorting

Supported sorting options may include:

- Relevance
- Newest
- Price: Low to High
- Price: High to Low
- Highest Rated
- Most Popular

Avoid ambiguous labels unless their ranking logic is clearly defined.

---

## 26. Cart

Cart should make purchase information obvious.

Display:

- Product
- Seller
- Quantity
- Price
- Subtotal
- Delivery
- Discount
- Total

If multiple sellers are present, group products by seller.

Example:

```text
Seller: Nova Electronics

Product A
Product B

Seller: Freetown Fashion

Product C
Product D
```

This prepares Nova for multi-vendor checkout.

---

## 27. Checkout

Checkout should minimize cognitive load.

Recommended steps:

1. Delivery
2. Payment
3. Review
4. Confirmation

Do not create unnecessary checkout steps.

Order summary should remain visible on desktop.

Mobile can use a collapsible summary.

---

## 28. Payment UI

Payment options must be country-aware.

Possible methods:

- Mobile Money
- Card
- Payment on Delivery
- Nova-supported payment methods

Never display payment methods that are unavailable in the user's country.

Payment states:

- Idle
- Processing
- Success
- Failed
- Cancelled
- Pending

Every state requires a clear user message.

---

## 29. Orders

Order status should be visual.

Example:

```text
Order placed
     ↓
Payment confirmed
     ↓
Preparing
     ↓
Out for delivery
     ↓
Delivered
```

Statuses must have both icon and text.

Do not communicate status using color alone.

---

## 30. Customer Dashboard

Customer navigation:

- Overview
- Orders
- Wishlist
- Addresses
- Payments
- Messages
- Account settings

Prioritize:

- Recent orders
- Order status
- Saved products
- Recommended products
- Account information

Avoid unnecessary charts.

---

## 31. Seller Dashboard

Seller navigation:

- Overview
- Products
- Orders
- Customers
- Messages
- Analytics
- Promotions
- Store
- Settings

Overview may show:

- Revenue
- Orders
- Products
- Customers
- Pending orders
- Low stock
- Recent activity

Use charts only when they answer a real business question.

Do not add decorative charts.

---

## 32. Seller Product Management

Product tables should support:

- Product
- Status
- Price
- Stock
- Orders
- Views
- Updated
- Actions

Actions:

- Edit
- Duplicate
- Archive
- Delete
- View

Destructive actions require confirmation.

---

## 33. Rider Interface

Rider UI should prioritize speed and clarity.

Primary navigation:

- Deliveries
- Map
- Earnings
- History
- Profile

Active delivery screen:

- Order number
- Customer
- Pickup location
- Delivery location
- Contact information
- Delivery instructions
- Order status

Actions:

- Navigate
- Contact customer
- Mark as picked up
- Mark as delivered

Avoid unnecessary analytics during an active delivery.

---

## 34. Admin Interface

Admin navigation:

- Overview
- Users
- Sellers
- Products
- Orders
- Payments
- Deliveries
- Reports
- Moderation
- Settings

Admin interfaces should prioritize:

- Search
- Filtering
- Tables
- Status badges
- Audit information
- Pagination
- Confirmation dialogs

The admin interface should use the same design system but a different information architecture from the customer marketplace.

---

## 35. Tables

Tables must support:

- Search
- Filtering
- Sorting
- Pagination
- Column visibility where appropriate
- Row actions
- Responsive behavior

Mobile tables should transform into cards when the table becomes too wide.

Do not force users to horizontally scroll through huge tables unless necessary.

---

## 36. Cards

Use cards for:

- Products
- Stores
- Summary metrics
- Dashboard sections
- Information groups

Avoid deeply nested cards.

If everything is inside a card, visual hierarchy becomes weak.

---

## 37. Modals

Use modals for:

- Confirmation
- Short forms
- Important actions
- Focused information

Do not use modals for long workflows.

Long workflows should use dedicated pages or drawers.

---

## 38. Toasts

Use toasts for completed actions.

Examples:

```text
Product added to cart.

Wishlist updated.

Product successfully deleted.

Payment failed. Please try again.
```

Do not use toasts for critical information users must retain.

---

## 39. Loading States

Every asynchronous operation requires a designed loading state.

Use:

- Skeleton
- Spinner
- Progress indicator
- Button loading state

Prefer skeletons for page content.

Avoid blank screens.

---

## 40. Empty States

Every major collection needs an empty state.

Examples:

```text
Your cart is empty.

[ Continue shopping ]
```

```text
You haven't added any products to your wishlist.

[ Explore products ]
```

```text
You don't have any orders yet.

[ Start shopping ]
```

Empty states should provide a useful next action.

---

## 41. Error States

Errors should explain:

- What happened
- What the user can do

Example:

```text
We couldn't load your orders.

Please check your connection and try again.

[ Try again ]
```

Avoid exposing technical errors to normal customers.

---

## 42. Confirmation Dialogs

Use confirmation dialogs for destructive actions.

Example:

```text
Delete product?

This will remove the product from your store.

[ Cancel ] [ Delete product ]
```

The destructive action must be visually distinct.

---

## 43. Notifications

Notifications should be categorized:

- Orders
- Payments
- Deliveries
- Messages
- Account
- System

Unread notifications require a clear visual indicator.

---

## 44. Motion

Motion should communicate state or hierarchy.

Recommended transition ranges:

- Small interactions: 150–200ms
- Larger transitions: 200–300ms

Use motion for:

- Button interactions
- Dropdowns
- Modals
- Drawers
- Toasts
- Product interactions

Avoid:

- Constant animations
- Large bouncing elements
- Excessive page transitions
- Decorative movement

Respect:

```css
@media (prefers-reduced-motion: reduce) {
  /* Reduce non-essential motion */
}
```

---

## 45. Responsive Rules

Every component must define responsive behavior.

Example:

```text
Product grid:
Mobile: 2 columns
Tablet: 3 columns
Desktop: 4 columns
Large desktop: 5 columns where appropriate
```

Do not simply shrink desktop components.

Mobile layouts may require different information hierarchy.

---

## 46. Mobile Touch Rules

Interactive elements should provide comfortable touch targets.

Target:

- 44px × 44px minimum

Keep sufficient spacing between interactive controls.

Avoid placing destructive actions directly beside primary actions without separation.

---

## 47. Dark Mode

Dark mode should be supported architecturally even if it is not part of the initial release.

Do not simply invert colors.

Create semantic dark-mode tokens for:

- Background
- Surface
- Elevated surface
- Primary text
- Secondary text
- Border
- Brand
- Success
- Warning
- Error

Dark mode must be designed intentionally.

---

## 48. Internationalization

Nova is intended to expand beyond Sierra Leone.

The UI must support:

- Multiple currencies
- Multiple languages
- Different address formats
- Different phone formats
- Different payment systems
- Different date formats
- Different number formats

Never hardcode a currency symbol inside reusable components.

Use the currency supplied by the application.

---

## 49. Localization

Text should come from the application's translation system.

Avoid hardcoding user-facing text inside deeply reusable components.

Example:

```tsx
<button>{t("actions.buyNow")}</button>
```

The implementation must follow Nova's existing Next.js internationalization architecture.

---

## 50. Content Design

Nova copy should be:

- Short
- Clear
- Human
- Action-oriented

Prefer:

```text
Add to cart
```

over:

```text
Click this button to add this product to your shopping cart
```

Prefer:

```text
No products found
```

over:

```text
Unfortunately, there are currently no products available matching your query
```

---

## 51. Accessibility

All components must support:

- Keyboard
- Mouse
- Touch
- Screen readers

Required:

- Semantic HTML
- ARIA only when needed
- Focus management
- Visible focus
- Alt text
- Form labels
- Error association
- Logical tab order
- Sufficient contrast

Never use a clickable `div` when a button or link is appropriate.

---

## 52. Component Architecture

Recommended structure:

```text
components/
├── ui/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Checkbox
│   ├── Radio
│   ├── Badge
│   ├── Dialog
│   ├── Drawer
│   ├── Tooltip
│   └── Skeleton
│
├── commerce/
│   ├── ProductCard
│   ├── ProductGallery
│   ├── Price
│   ├── Rating
│   ├── StoreCard
│   ├── CartItem
│   └── OrderStatus
│
├── navigation/
│   ├── Header
│   ├── Sidebar
│   ├── MobileNavigation
│   └── Breadcrumbs
│
└── feedback/
    ├── EmptyState
    ├── ErrorState
    ├── LoadingState
    └── Toast
```

---

## 53. Component Rules

Before creating a new component, ask:

1. Does this already exist?
2. Can an existing component handle this through a variant?
3. Is this component reusable?
4. Does it belong to the design system or a feature?

Do not duplicate components.

Bad:

```text
SellerButton
CustomerButton
AdminButton
CheckoutButton
```

Better:

```text
Button
```

with variants.

---

## 54. Feature Architecture

Feature-specific UI belongs inside the feature.

Recommended structure:

```text
features/
├── auth/
├── catalog/
├── cart/
├── checkout/
├── orders/
├── seller/
├── rider/
└── admin/
```

Shared components must not depend on a specific feature.

---

## 55. Figma Structure

The Figma file should follow:

```text
Nova Design System
│
├── Cover
│
├── Foundations
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Radius
│   ├── Shadows
│   ├── Icons
│   └── Grid
│
├── Components
│   ├── Buttons
│   ├── Inputs
│   ├── Navigation
│   ├── Cards
│   ├── Product
│   ├── Commerce
│   ├── Feedback
│   └── Tables
│
├── Patterns
│   ├── Search
│   ├── Checkout
│   ├── Filters
│   └── Dashboards
│
├── Customer
├── Seller
├── Rider
├── Admin
└── Mobile
```

---

## 56. Figma Component Rules

Every reusable component should have:

- Component name
- Variants
- States
- Responsive behavior
- Documentation
- Accessibility considerations

Example:

```text
Button

Variants:
Primary
Secondary
Outline
Ghost
Destructive

Size:
Small
Medium
Large

State:
Default
Hover
Focus
Pressed
Disabled
Loading
```

---

## 57. Design-to-Code Workflow

The preferred workflow is:

```text
Requirement
↓
UX flow
↓
Figma
↓
Component
↓
Responsive design
↓
Implementation
↓
Browser validation
↓
Visual comparison
↓
Accessibility validation
↓
Final approval
```

Do not begin by writing random JSX and CSS.

---

## 58. Claude Code Rules

Claude Code must follow these rules when working on Nova UI:

1. Read `NOVA_UI_UX_DESIGN_SYSTEM.md` before modifying UI.
2. Inspect existing components before creating new components.
3. Reuse existing design tokens.
4. Never invent brand colors.
5. Never introduce arbitrary spacing without justification.
6. Never create duplicate components.
7. Follow the existing component architecture.
8. Follow Figma when an approved Figma design exists.
9. Support mobile, tablet, and desktop.
10. Implement loading, empty, and error states.
11. Consider accessibility for every interactive component.
12. Do not replace working components simply because a different implementation is easier.
13. Preserve existing business logic while improving presentation.
14. Separate visual changes from business logic whenever possible.
15. Test the affected page after implementation.
16. Do not declare UI work complete until responsive behavior has been checked.
17. If a design decision is not defined, follow the existing design system rather than inventing a new pattern.
18. If a required pattern does not exist, propose a reusable design-system component rather than creating a one-off solution.

---

## 59. Definition of Done

A UI task is complete only when:

- Matches the approved design
- Uses Nova design tokens
- Uses reusable components
- Works on mobile
- Works on tablet
- Works on desktop
- Has loading state where applicable
- Has empty state where applicable
- Has error state where applicable
- Has hover state where applicable
- Has focus state
- Has disabled state where applicable
- Meets accessibility requirements
- Does not introduce duplicate components
- Does not introduce arbitrary colors
- Does not introduce arbitrary spacing
- Does not break existing functionality
- Has been tested in the browser

---

## 60. Visual QA

Before approving a page, compare:

```text
Figma
vs
Implemented UI
```

Check:

- Spacing
- Typography
- Colors
- Alignment
- Sizing
- Images
- Borders
- Radius
- Shadows
- States
- Responsive behavior

Visual differences should be intentional.

---

## 61. UX Review Questions

Before shipping a screen, ask:

- Can a first-time user understand this screen?
- What is the primary action?
- Can the user recover from an error?
- Can the user complete the task on mobile?
- Is anything unnecessary?
- Is the information hierarchy obvious?
- Does this screen look like Nova?
- Does this component already exist elsewhere?
- Can this interaction be simplified?

---

## 62. Nova Customer Experience

The customer journey should generally follow:

```text
Discover
↓
Search / Browse
↓
Compare
↓
Product details
↓
Add to cart
↓
Checkout
↓
Payment
↓
Delivery
↓
Receive
↓
Review
```

Every screen should support the user's position in this journey.

---

## 63. Nova Brand Experience

Nova should feel consistent across:

```text
Landing page
↓
Search
↓
Product
↓
Store
↓
Cart
↓
Checkout
↓
Order tracking
↓
Customer account
```

The user should never feel like they entered a completely different application.

---

## 64. Anti-Patterns

Never create interfaces that rely on:

- Excessive gradients
- Huge rounded containers
- Random colors
- Random font sizes
- Inconsistent icons
- Heavy shadows
- Too many badges
- Too many cards
- Tiny text
- Crowded navigation
- Unnecessary animations
- Decorative charts
- Fake statistics
- Unclear CTAs

Avoid designing for screenshots only.

Design for actual use.

---

## 65. Engineering Principles

UI components must remain maintainable.

Prefer:

- Composition
- Reusable primitives
- Design tokens
- Variants
- Semantic HTML
- Type safety
- Accessible interactions

Avoid:

- Duplicated CSS
- Hardcoded business data
- Hardcoded currency
- Hardcoded categories
- One-off styles
- Deeply coupled components

---

## 66. Data Separation

Visual components should not contain unnecessary business logic.

Avoid making a `ProductCard` responsible for:

- Fetching products
- Calculating payment
- Handling checkout
- Rendering UI

Prefer:

```text
Data layer
↓
Feature logic
↓
UI component
```

Components should receive the data they need.

---

## 67. Security and Trust UX

Nova handles:

- Accounts
- Payments
- Orders
- Seller information
- Customer information

Trust indicators must be accurate.

Never visually imply:

- Verified seller
- Secure payment
- Delivered order
- Refund approved
- Payment completed

unless the backend confirms the state.

---

## 68. Performance UX

Every slow operation should have feedback.

Preferred flow:

```text
User clicks Buy
↓
Button enters loading state
↓
Request executes
↓
Success or error
```

Never leave the user wondering whether an action worked.

---

## 69. Product Photography

Product imagery is one of Nova's strongest visual elements.

Images should:

- Be high quality
- Use consistent aspect ratios
- Avoid distortion
- Have appropriate backgrounds
- Load progressively
- Include meaningful alt text

Product images should remain the focus of product cards.

---

## 70. Empty, Loading, and Error Design System

These states are first-class components:

```text
LoadingState
EmptyState
ErrorState
SuccessState
```

They should share the same visual language.

---

## 71. Design System Governance

Any new component must answer:

1. Why does it exist?
2. Can an existing component handle this?
3. Where will it be reused?
4. What variants does it need?
5. What states does it need?
6. How does it behave on mobile?
7. Does Figma contain it?
8. Does the code contain it?

---

## 72. Source of Truth

When there is a conflict:

```text
Approved Figma design
        ↓
Nova Design System
        ↓
Component implementation
        ↓
Feature implementation
```

Do not modify the design system just to accommodate a poorly implemented feature.

If the same issue appears across multiple features, update the design system.

---

## 73. Change Management

When modifying a shared component:

1. Identify all usages.
2. Check visual impact.
3. Update Figma.
4. Update the component.
5. Test all variants.
6. Test responsive behavior.
7. Test affected pages.
8. Update documentation.

Never make a global UI change without checking its impact.

---

## 74. Recommended Initial Component Library

Build components based on actual product requirements.

Potential core library:

```text
Button
IconButton
Input
Textarea
Select
Combobox
Checkbox
Radio
Switch
Slider
Badge
Avatar
Tooltip
Popover
Dropdown
Dialog
Drawer
Tabs
Accordion
Breadcrumb
Pagination
Skeleton
Spinner
Toast
Alert
EmptyState
ErrorState
ProductCard
ProductGallery
Price
Rating
StoreCard
CategoryCard
CartItem
OrderCard
OrderStatus
SearchBar
FilterPanel
SortSelect
DataTable
StatCard
Chart
Navigation
Sidebar
MobileNavigation
```

Do not build a massive unused component library.

---

## 75. Implementation Priority

### Phase 1 — Foundations

```text
Colors
Typography
Spacing
Radius
Shadows
Icons
Grid
Tokens
```

### Phase 2 — Core Components

```text
Buttons
Inputs
Cards
Badges
Navigation
Dialogs
Feedback
```

### Phase 3 — Marketplace

```text
Homepage
Categories
Search
Product listing
Product details
Store
```

### Phase 4 — Commerce

```text
Cart
Checkout
Payment
Orders
Tracking
```

### Phase 5 — Business

```text
Seller dashboard
Product management
Order management
Analytics
```

### Phase 6 — Operations

```text
Rider
Delivery
Maps
Earnings
```

### Phase 7 — Administration

```text
Admin dashboard
Users
Sellers
Products
Orders
Payments
Reports
Moderation
Settings
```

---

## 76. Final Nova UI Rule

Nova must never be designed screen by screen in isolation.

The system comes first.

The screen comes second.

The component comes from the system.

The feature uses the component.

The entire product must feel like one product.

When a new page is created, do not ask:

"How do we make this page look good?"

Ask:

"How does this page express the Nova design system?"

That distinction should guide every future UI decision.
