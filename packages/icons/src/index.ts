/**
 * Nova Icon System — Lucide React
 *
 * Size standards:  12 | 16 | 20 | 24 | 32 | 48
 * Stroke standards: 1 | 1.5 | 2
 *
 * Default: size=20, strokeWidth=1.5
 */
import type { LucideProps } from "lucide-react";

// ── Size & stroke constants ────────────────────────────────────────
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20, // default
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const iconStrokes = {
  thin: 1,
  regular: 1.5, // default
  bold: 2,
} as const;

export type IconSize = keyof typeof iconSizes;
export type IconStroke = keyof typeof iconStrokes;
export type IconProps = LucideProps;

// ── Navigation ────────────────────────────────────────────────────
export {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Home,
} from "lucide-react";

// ── Commerce ──────────────────────────────────────────────────────
export {
  ShoppingCart,
  ShoppingBag,
  Package,
  PackageOpen,
  Tag,
  Tags,
  Percent,
  CreditCard,
  Wallet,
  Receipt,
  Truck,
  Store,
  Barcode,
  QrCode,
  Gift,
  Star,
  StarHalf,
  Heart,
  Bookmark,
} from "lucide-react";

// ── User & Auth ───────────────────────────────────────────────────
export {
  User,
  UserCircle,
  UserPlus,
  Users,
  LogIn,
  LogOut,
  Lock,
  Unlock,
  KeyRound,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Fingerprint,
} from "lucide-react";

// ── Communication ─────────────────────────────────────────────────
export {
  Bell,
  BellOff,
  BellRing,
  Mail,
  MailOpen,
  MessageCircle,
  MessageSquare,
  Send,
  Phone,
  PhoneCall,
} from "lucide-react";

// ── Status & Feedback ─────────────────────────────────────────────
export {
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Check,
  Minus,
  Plus,
  Loader2,
  RefreshCw,
} from "lucide-react";

// ── Media & Content ───────────────────────────────────────────────
export {
  Image,
  ImageOff,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  Download,
  File,
  FileText,
  Paperclip,
  Link,
  Link2,
} from "lucide-react";

// ── UI Controls ───────────────────────────────────────────────────
export {
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Grid2X2,
  Columns2,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  MoreVertical,
  Copy,
  Clipboard,
  Trash2,
  Edit,
  Edit2,
  Pencil,
  Settings,
  Settings2,
  Share2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

// ── AI & Sustainability ───────────────────────────────────────────
export {
  Sparkles,
  Wand2,
  Bot,
  Brain,
  Leaf,
  Recycle,
  TreePine,
  Sun,
  Moon,
  Globe,
  Globe2,
  MapPin,
  Map,
} from "lucide-react";

// ── Finance & Analytics ───────────────────────────────────────────
export {
  TrendingUp,
  TrendingDown,
  BarChart2,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  Coins,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
