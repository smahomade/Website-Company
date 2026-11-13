import {
  Building2,
  CalendarDays,
  Check,
  Cloud,
  FileText,
  KeyRound,
  Laptop,
  Layers,
  LayoutTemplate,
  Package,
  Plus,
  Puzzle,
  RefreshCw,
  Rocket,
  Settings2,
  User,
  Wrench,
  Zap,
} from 'lucide-react';

/* lucide icons for the package data (data/services.js), which names its icons by kind and, in the
   details, by emoji. Nothing star-shaped. */
export const KIND_ICON = {
  key: KeyRound,
  cloud: Cloud,
  bolt: Zap,
  gear: Settings2,
  single: LayoutTemplate,
  stack: Layers,
  sparkle: Puzzle,
  wrench: Wrench,
};

export const META_ICON = {
  '👤': User,
  '🔄': RefreshCw,
  '⚡': Zap,
  '⚙': Settings2,
  '📄': FileText,
  '📅': CalendarDays,
  '🏢': Building2,
  '💻': Laptop,
  '📦': Package,
  '🚀': Rocket,
  '🛠️': Wrench,
  '🧩': Puzzle,
  '🧰': Wrench,
};

/* a feature line's mark: standard (tick), bonus (plus), priority (bolt) or backend (gear) */
export const FEATURE_ICON = { standard: Check, bonus: Plus, priority: Zap, backend: Settings2 };
export const FEATURE_TONE = {
  standard: 'bg-ink text-cream',
  bonus: 'bg-primary text-ink',
  priority: 'bg-orange-tint text-orange-ink',
  backend: 'border border-ink/20 bg-sand text-ink',
};
