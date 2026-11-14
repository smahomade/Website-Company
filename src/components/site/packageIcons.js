import {
  Building2,
  CalendarDays,
  Cloud,
  FileText,
  KeyRound,
  Laptop,
  Layers,
  LayoutTemplate,
  Package,
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
