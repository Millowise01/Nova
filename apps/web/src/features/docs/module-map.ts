import type { ModuleCard } from "@/types/domain";

export const moduleMap: Record<string, ModuleCard[]> = {
  auth: [
    { title: "Register", description: "Email and phone onboarding with Sierra Leone validation." },
    { title: "Login", description: "Secure session bootstrapping with redirect support." },
    { title: "OTP Verification", description: "2-step confirmation flow for account protection." },
    { title: "Forgot Password", description: "Recovery with expiring reset links and status feedback." },
    { title: "Guest Checkout", description: "Checkout path without mandatory account creation." }
  ],
  catalog: [
    { title: "Category Pages", description: "Primary catalog navigation and merchandising blocks." },
    { title: "Brand Pages", description: "Brand storefront listings and campaign tie-ins." },
    { title: "Filter Drawer", description: "Attribute filters, multi-select facets, and quick clear." },
    { title: "Sort and Pagination", description: "Grid/list sorters and infinite-scroll fallback." }
  ],
  product: [
    { title: "Image Gallery", description: "High resolution product media with responsive variants." },
    { title: "Variants and Inventory", description: "SKU-level selection and stock awareness." },
    { title: "Reviews and Questions", description: "Community feedback, rating, and Q&A modules." },
    { title: "Seller Information", description: "Store trust signals, policies, and shipping details." }
  ],
  search: [
    { title: "Instant Search", description: "Autocomplete results with category and brand chips." },
    { title: "Trending Searches", description: "Merchandising-controlled trends and fallbacks." },
    { title: "Recent History", description: "User-specific and guest-local search history." }
  ],
  cart: [
    { title: "Persistent Cart", description: "Guest and session cart persistence strategy." },
    { title: "Saved For Later", description: "Deferred purchase state and cart migration." },
    { title: "Coupons and Gift Cards", description: "Promotion controls and validation feedback." }
  ],
  checkout: [
    { title: "Address Step", description: "Saved addresses, validation, and guest entry." },
    { title: "Delivery Step", description: "Delivery options, schedules, and shipping estimates." },
    { title: "Payment Step", description: "Wallet, card placeholders, and payment intents." },
    { title: "Review & Confirmation", description: "Final totals, taxes, and confirmation detail." }
  ],
  dashboard: [
    { title: "Overview", description: "Key account metrics and quick actions." },
    { title: "Rewards", description: "Points, milestones, and tier progress modules." },
    { title: "Messages", description: "Seller and support communication center." }
  ],
  wallet: [
    { title: "Balance", description: "Current wallet state and pending amounts." },
    { title: "Transactions", description: "Ledger timeline with status and references." },
    { title: "Top-up / Withdraw", description: "Funding and cash-out flow placeholders." }
  ],
  orders: [
    { title: "Order History", description: "Timeline views and quick filters by status." },
    { title: "Order Tracking", description: "Shipment progress and fulfillment updates." },
    { title: "Returns & Refunds", description: "Post-purchase resolution flows." }
  ],
  ai: [
    { title: "Chat Assistant", description: "Composable assistant shell for future AI endpoints." },
    { title: "Product Comparison", description: "Decision matrix cards and summary insights." },
    { title: "Gift Finder", description: "Prompt-assisted recommendation workflow." }
  ],
  sustainability: [
    { title: "Impact Dashboard", description: "Personal and community impact metrics." },
    { title: "Recycling Rewards", description: "Eco incentive tracking and redemption." },
    { title: "Carbon Savings", description: "Order-level emissions and offsets." }
  ],
  support: [
    { title: "Help Center", description: "Knowledge base and help categories." },
    { title: "Support Tickets", description: "Structured issue intake and tracking." },
    { title: "Dispute Center", description: "Marketplace dispute and mediation entry points." }
  ],
  notifications: [
    { title: "Notification Center", description: "Unified feed with unread state and filters." },
    { title: "Push/SMS Placeholders", description: "Extensible channel preference cards." },
    { title: "Email Preferences", description: "Digest and campaign frequency controls." }
  ],
  settings: [
    { title: "Profile", description: "Personal details and account management." },
    { title: "Privacy & Security", description: "Session, devices, and access controls." },
    { title: "Language and Currency", description: "Localization and commerce preference management." }
  ]
};
