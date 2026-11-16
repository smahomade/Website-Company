import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isDark, onThemeChange, setDark } from '@/lib/theme.js';
import { cn } from '@/lib/utils';

/* The sun/moon button in the nav bar (lib/theme.js). Both icons are in the page and CSS shows the
   right one, so the prebuilt page matches whatever mode the visitor arrives in. The pressed state
   is read after the first render, for the same reason. */
export default function ThemeToggle({ className }) {
  const [dark, setDarkState] = useState(null);
  useEffect(() => {
    const read = () => setDarkState(isDark());
    read();
    return onThemeChange(read);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('text-ink/75 hover:text-ink', className)}
      aria-label="Dark mode"
      aria-pressed={dark === null ? undefined : dark}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setDark(!isDark())}
    >
      <Moon aria-hidden="true" className="size-5 dark:hidden" />
      <Sun aria-hidden="true" className="hidden size-5 dark:block" />
    </Button>
  );
}
