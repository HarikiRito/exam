import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';
import { ComponentProps } from 'react';

import { cn } from 'app/shared/utils/className';

function RadioGroup({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot='radio-group' className={cn('grid gap-3', className)} {...props} />;
}

function RadioGroupItem({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot='radio-group-item'
      className={cn(
        'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}>
      <RadioGroupPrimitive.Indicator
        data-slot='radio-group-indicator'
        className='relative flex items-center justify-center'>
        <CircleIcon className='fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2' />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppRadioGroup` component provides an accessible, customizable
 * radio button group for selecting a single option from a set of choices.
 *
 * ## Key Features
 * - Fully accessible radio group interactions
 * - Customizable layout and styling
 * - Responsive design
 * - Seamless integration with Radix UI
 * - Tailwind CSS styling
 * - Form and standalone usage support
 *
 * ## Example Usage
 * ```tsx
 * import { useState } from 'react';
 * import { AppRadioGroup } from 'app/shared/components/radio-group/AppRadioGroup';
 * import { AppTypography } from 'app/shared/components/typography/AppTypography';
 *
 * function RadioGroupExample() {
 *   const [selectedPlan, setSelectedPlan] = useState('basic');
 *
 *   return (
 *     <div className="space-y-4">
 *       <AppTypography variant="h4">Select a Plan</AppTypography>
 *       <AppRadioGroup.Root
 *         value={selectedPlan}
 *         onValueChange={setSelectedPlan}
 *       >
 *         <div className="flex space-x-4">
 *           <AppRadioGroup.Item value="basic">
 *             <AppRadioGroup.Indicator />
 *             Basic Plan
 *           </AppRadioGroup.Item>
 *           <AppRadioGroup.Item value="pro">
 *             <AppRadioGroup.Indicator />
 *             Pro Plan
 *           </AppRadioGroup.Item>
 *         </div>
 *       </AppRadioGroup.Root>
 *       <AppTypography>
 *         Selected Plan: {selectedPlan}
 *       </AppTypography>
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppRadioGroup` from the correct path
 * 2. Use as a controlled or uncontrolled component
 * 3. Set initial value and handle value changes
 * 4. Use `AppRadioGroup.Item` for each radio option
 * 5. Optionally add labels or additional context
 *
 * ## Radio Group Components
 * - `Root`: Radio group state and context management
 * - `Item`: Individual radio button option
 * - `Indicator`: Visual indicator for selected state
 *
 * ## State Management
 * - Controlled via `value` and `onValueChange` props
 * - Supports programmatic value changes
 * - Manages focus and keyboard interactions
 *
 * ## Customization Options
 * - Custom styling through Tailwind CSS
 * - Responsive design
 * - Accessibility attributes
 * - Dynamic value rendering
 *
 * ## Form Integration
 * - Compatible with React Hook Form
 * - Supports controlled and uncontrolled modes
 * - Integrates with form validation
 *
 * ## Best Practices
 * - Use for mutually exclusive choices
 * - Provide clear, concise option labels
 * - Ensure visual hierarchy
 * - Group related options
 * - Test keyboard and screen reader accessibility
 *
 * ## Accessibility Considerations
 * - Supports keyboard navigation
 * - Screen reader friendly
 * - Proper semantic structure
 * - ARIA attributes for enhanced accessibility
 *
 * ## Performance Optimization
 * - Minimal re-renders
 * - Lightweight component
 * - Efficient state management
 *
 * @see https://www.radix-ui.com/primitives/docs/components/radio-group Radix UI Radio Group Documentation
 * @category Components
 * @category Form
 * @category Interaction
 */
export const AppRadioGroup = {
  Root: RadioGroup,
  Item: RadioGroupItem,
};
