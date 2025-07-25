'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from 'app/shared/utils/className';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCalendar } from 'app/shared/components/ui/calendar/AppCalendar';
import { AppPopover } from 'app/shared/components/ui/popover/AppPopover';

interface DatePickerProps {
  readonly date?: Date;
  readonly onSelect?: (date: Date | undefined) => void;
  readonly placeholder?: string;
  readonly className?: string;
  readonly disabled?: boolean;
}

function DatePicker({ date, onSelect, placeholder = 'Pick a date', className, disabled }: DatePickerProps) {
  return (
    <AppPopover.Root>
      <AppPopover.Trigger asChild>
        <AppButton
          variant='outline'
          className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground', className)}
          disabled={disabled}>
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? format(date, 'dd/MM/yyyy') : <span>{placeholder}</span>}
        </AppButton>
      </AppPopover.Trigger>
      <AppPopover.Content className='w-auto p-0'>
        <AppCalendar mode='single' selected={date} onSelect={onSelect} initialFocus />
      </AppPopover.Content>
    </AppPopover.Root>
  );
}

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppDatePicker` component provides a user-friendly date selection interface
 * built on top of the AppCalendar and AppPopover components, following the shadcn/ui pattern.
 *
 * ## Key Features
 * - Clean, accessible date picker interface
 * - Integration with existing calendar component
 * - Customizable placeholder text
 * - Support for controlled and uncontrolled modes
 * - Tailwind CSS styling
 *
 * ## Example Usage
 * ```tsx
 * import { useState } from 'react';
 * import { AppDatePicker } from 'app/shared/components/ui/date-picker/AppDatePicker';
 *
 * function DatePickerDemo() {
 *   const [date, setDate] = useState<Date>();
 *
 *   return (
 *     <div className="space-y-4">
 *       <AppDatePicker
 *         date={date}
 *         onSelect={setDate}
 *         placeholder="Select a date"
 *       />
 *       <div>
 *         Selected Date: {date ? date.toLocaleDateString() : 'No date selected'}
 *       </div>
 *     </div>
 *   );
 * }
 *
 * // Form integration example
 * function FormExample() {
 *   const [formData, setFormData] = useState({
 *     expiryDate: undefined as Date | undefined,
 *   });
 *
 *   return (
 *     <form>
 *       <div className="space-y-2">
 *         <label>Expiry Date</label>
 *         <AppDatePicker
 *           date={formData.expiryDate}
 *           onSelect={(date) => setFormData(prev => ({ ...prev, expiryDate: date }))}
 *           placeholder="Select expiry date"
 *         />
 *       </div>
 *     </form>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppDatePicker` from the correct path
 * 2. Use the `date` prop to control the selected date
 * 3. Provide an `onSelect` handler to update the selected date
 * 4. Customize the placeholder text with the `placeholder` prop
 * 5. Apply custom styling using the `className` prop
 *
 * ## Props
 * - `date`: Currently selected date (Date | undefined)
 * - `onSelect`: Callback when a date is selected
 * - `placeholder`: Placeholder text when no date is selected
 * - `className`: Additional CSS classes for the trigger button
 * - `disabled`: Whether the date picker is disabled
 *
 * ## Styling Notes
 * - The trigger button uses outline variant by default
 * - Calendar icon is displayed on the left
 * - Selected date is formatted using date-fns format function
 * - Popover content is automatically sized
 *
 * ## Best Practices
 * - Always handle the undefined case in onSelect
 * - Use meaningful placeholder text
 * - Consider form validation for required dates
 * - Test keyboard navigation and accessibility
 *
 * @category Components
 * @category Form
 */
export const AppDatePicker = DatePicker;
