import { useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* shadcn/ui's Dialog (Radix underneath: focus is kept inside while open, Escape and the backdrop
   close it, the page behind can't scroll, focus goes back where it was). Calm entrance: a short
   fade and a small rise, none under reduced motion. */
function Dialog(props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

/* Our dialogs open from state rather than a Radix trigger, so the content remembers what had focus
   when it opened and hands focus back there when it closes. */
function DialogContent({ className, children, closeLabel = 'Close', onOpenAutoFocus, onCloseAutoFocus, ...props }) {
  const opener = useRef(null);
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="pf-fade fixed inset-0 z-[1000] bg-ink/60 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'pf-rise fixed left-1/2 top-1/2 z-[1001] grid max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] border border-ink/10 bg-cream p-6 leading-normal text-ink shadow-lg outline-none md:p-8',
          className
        )}
        onOpenAutoFocus={(e) => {
          opener.current = document.activeElement;
          onOpenAutoFocus?.(e);
        }}
        onCloseAutoFocus={(e) => {
          onCloseAutoFocus?.(e);
          const el = opener.current;
          if (!e.defaultPrevented && el && el !== document.body && document.contains(el)) {
            e.preventDefault();
            el.focus();
          }
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 grid size-11 cursor-pointer place-items-center rounded-full text-ink/60 outline-none transition-colors hover:bg-ink/5 hover:text-ink focus-visible:ring-[3px] focus-visible:ring-ring/45">
          <X className="size-5" />
          <span className="sr-only">{closeLabel}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn('font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-ink', className)} {...props} />;
}

function DialogDescription({ className, ...props }) {
  return <DialogPrimitive.Description className={cn('leading-relaxed text-muted-foreground', className)} {...props} />;
}

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogTitle, DialogDescription };
