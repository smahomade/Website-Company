import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

/* shadcn/ui's Tabs (Radix underneath: arrow keys move between tabs, each panel is labelled by its
   tab) */
function Tabs({ className, ...props }) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col', className)} {...props} />;
}

function TabsList({ className, ...props }) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn('inline-flex w-fit items-center rounded-2xl border border-ink/10 bg-white p-1.5 shadow-sm', className)} {...props} />;
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 font-display font-semibold text-ink/65 outline-none transition-colors hover:text-ink focus-visible:ring-[3px] focus-visible:ring-ring/45 data-[state=active]:bg-ink data-[state=active]:text-cream',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn('outline-none', className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
