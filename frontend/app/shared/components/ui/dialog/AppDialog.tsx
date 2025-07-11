import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { cn } from 'app/shared/utils/className';

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot='dialog' {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot='dialog-close' {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot='dialog-overlay'
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80',
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot='dialog-portal'>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot='dialog-content'
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          className,
        )}
        {...props}>
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 cursor-pointer rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className='sr-only'>Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-header'
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-footer'
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot='dialog-title'
      className={cn('text-lg leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot='dialog-description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppDialog` component provides a flexible, accessible modal
 * dialog system for displaying critical information or capturing user input.
 *
 * ## Key Features
 * - Fully accessible dialog interactions
 * - Customizable content and layout
 * - Responsive design
 * - Seamless integration with Radix UI
 * - Tailwind CSS styling
 * - Multiple component composition
 *
 * ## Example Usage
 * ```tsx
 * import { useState } from 'react';
 * import { AppDialog } from 'app/shared/components/dialog/AppDialog';
 * import { AppButton } from 'app/shared/components/button/AppButton';
 * import { AppInput } from 'app/shared/components/input/AppInput';
 * import { AppTypography } from 'app/shared/components/typography/AppTypography';
 *
 * function ConfirmationDialog() {
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   return (
 *     <AppDialog.Root open={isOpen} onOpenChange={setIsOpen}>
 *       <AppDialog.Trigger asChild>
 *         <AppButton>Open Dialog</AppButton>
 *       </AppDialog.Trigger>
 *       <AppDialog.Content>
 *         <AppDialog.Header>
 *           <AppDialog.Title>Confirm Action</AppDialog.Title>
 *           <AppDialog.Description>
 *             Are you sure you want to proceed with this action?
 *           </AppDialog.Description>
 *         </AppDialog.Header>
 *
 *         <AppDialog.Footer>
 *           <AppButton
 *             variant="outline"
 *             onClick={() => setIsOpen(false)}
 *           >
 *             Cancel
 *           </AppButton>
 *           <AppButton>Confirm</AppButton>
 *         </AppDialog.Footer>
 *       </AppDialog.Content>
 *     </AppDialog.Root>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppDialog` components from the correct path
 * 2. Use `AppDialog.Root` to manage dialog state
 * 3. Use `AppDialog.Trigger` to open the dialog
 * 4. Compose dialog content using various sub-components
 * 5. Handle open/close state with `open` and `onOpenChange` props
 *
 * ## Dialog Components
 * - `Root`: Dialog state management
 * - `Trigger`: Element that opens the dialog
 * - `Content`: Main dialog container
 * - `Header`: Dialog header section
 * - `Footer`: Dialog footer section
 * - `Title`: Dialog title
 * - `Description`: Dialog description text
 * - `Close`: Close button or trigger
 * - `Overlay`: Background overlay
 *
 * ## State Management
 * - Controlled via `open` and `onOpenChange` props
 * - Supports programmatic open/close
 * - Manages focus and keyboard interactions
 *
 * ## Customization Options
 * - Custom styling through Tailwind CSS
 * - Responsive design
 * - Accessibility attributes
 * - Dynamic content rendering
 *
 * ## Best Practices
 * - Use for critical actions or important information
 * - Provide clear context in title and description
 * - Implement keyboard navigation (Esc to close)
 * - Ensure content is concise
 * - Handle focus management
 *
 * @see https://www.radix-ui.com/primitives/docs/components/dialog Radix UI Dialog Documentation
 * @category Components
 * @category Interaction
 */
export const AppDialog = {
  Root: Dialog,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Close: DialogClose,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Header: DialogHeader,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
};
