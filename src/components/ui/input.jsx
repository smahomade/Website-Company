import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/* shadcn/ui's Input, Textarea, Label and a native Select in PixelFold colours. Text is 16px so
   phones don't zoom in on focus; aria-invalid turns the border red. */
const control =
  'w-full min-w-0 rounded-xl border border-input bg-white px-4 text-base text-ink shadow-[0_1px_2px_rgba(17,17,17,0.04)] outline-none transition-[border-color,box-shadow] placeholder:text-ink/60 hover:border-ink/25 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/15 disabled:cursor-not-allowed disabled:bg-sand disabled:opacity-60';

function Input({ className, type = 'text', ...props }) {
  return <input type={type} data-slot="input" className={cn(control, 'h-12', className)} {...props} />;
}

function Textarea({ className, ...props }) {
  return <textarea data-slot="textarea" className={cn(control, 'min-h-32 resize-y py-3 leading-relaxed', className)} {...props} />;
}

/* A real <select> (works with every keyboard, screen reader and phone picker), dressed to match */
function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select data-slot="select" className={cn(control, 'h-12 cursor-pointer appearance-none pr-11', className)} {...props}>
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-ink/50" />
    </div>
  );
}

function Label({ className, ...props }) {
  return <label data-slot="label" className={cn('font-display text-[15px] font-semibold text-ink', className)} {...props} />;
}

export { Input, Textarea, Select, Label };
