import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* shadcn/ui's Badge in PixelFold colours */
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold [&>svg]:size-3.5',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-orange-tint text-orange-ink',
        dark: 'border-transparent bg-ink text-cream',
        primary: 'border-transparent bg-primary text-primary-foreground',
        outline: 'border-ink/15 text-ink/80',
        light: 'border-cream/15 bg-cream/10 text-cream/90',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
