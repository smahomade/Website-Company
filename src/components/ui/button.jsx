import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* shadcn/ui's Button in PixelFold colours. asChild renders the child (a router Link, an <a>)
   with the button's look. Every size is at least 44px tall on touch screens. */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-semibold tracking-[-0.01em] transition-[background-color,color,border-color,box-shadow,transform] duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-[0_10px_24px_-12px_rgba(255,106,0,0.9)] hover:bg-orange-soft',
        dark: 'bg-ink text-cream hover:bg-espresso',
        outline: 'border border-ink/15 bg-white/60 text-ink hover:border-ink/30 hover:bg-white',
        'outline-dark': 'border border-ink/80 text-ink hover:bg-ink hover:text-cream',
        'outline-light': 'border border-cream/25 text-cream hover:border-cream/50 hover:bg-cream/10',
        ghost: 'text-ink hover:bg-ink/5',
      },
      size: {
        default: 'h-11 px-5 text-[15px]',
        sm: 'h-10 px-4 text-sm max-md:h-11',
        lg: 'h-12 px-6 text-base',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
