'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from 'app/shared/utils/className';
import { buttonVariants } from 'app/shared/components/ui/button/AppButton';

function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-2',
        month: 'flex flex-col gap-4',
        caption: 'flex justify-center pt-1 relative items-center w-full',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1',
        nav_button: cn(
          buttonVariants({ variant: 'outline', shadow: 'none' }),
          'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-x-1',
        head_row: 'flex',
        head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        day: cn(
          buttonVariants({ variant: 'ghost', shadow: 'none' }),
          'size-8 p-0 font-normal aria-selected:opacity-100 !ring-0 !outline-none',
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside: 'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => <ChevronLeft className={cn('size-4', className)} {...props} />,
        IconRight: ({ className, ...props }) => <ChevronRight className={cn('size-4', className)} {...props} />,
      }}
      {...props}
    />
  );
}

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppCalendar` component provides a flexible and customizable date selection interface
 * built on top of React DayPicker, with seamless integration of Tailwind CSS styling.
 *
 * ## Key Features
 * - Single and range date selection modes
 * - Customizable appearance
 * - Responsive design
 * - Accessibility support
 * - Tailwind CSS styling
 *
 * ## Example Usage
 * ```tsx
 * import { useState } from 'react';
 * import { AppCalendar } from 'app/shared/components/calendar/AppCalendar';
 * import { AppButton } from 'app/shared/components/button/AppButton';
 *
 * function DatePickerDemo() {
 *   const [date, setDate] = useState<Date | undefined>(new Date());
 *
 *   return (
 *     <div className="space-y-4">
 *       <AppCalendar
 *         mode="single"
 *         selected={date}
 *         onSelect={setDate}
 *         className="rounded-md border"
 *       />
 *       <div>
 *         Selected Date: {date ? date.toLocaleDateString() : 'No date selected'}
 *       </div>
 *     </div>
 *   );
 * }
 *
 * function DateRangeDemo() {
 *   const [dateRange, setDateRange] = useState<DateRange | undefined>({
 *     from: new Date(),
 *     to: undefined
 *   });
 *
 *   return (
 *     <AppCalendar
 *       mode="range"
 *       selected={dateRange}
 *       onSelect={setDateRange}
 *       numberOfMonths={2}
 *     />
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppCalendar` from the correct path
 * 2. Choose between single and range date selection modes
 * 3. Use `selected` prop to control the selected date(s)
 * 4. Provide an `onSelect` handler to update the selected date
 * 5. Customize appearance using Tailwind CSS classes
 *
 * ## Modes of Operation
 * - `single`: Select a single date
 * - `range`: Select a date range with start and end dates
 * - `multiple`: Select multiple individual dates
 *
 * ## Customization Options
 * - `mode`: Selection mode ('single', 'range', 'multiple')
 * - `selected`: Currently selected date(s)
 * - `onSelect`: Callback when date(s) are selected
 * - `disabled`: Disable specific dates or date ranges
 * - `className`: Apply custom Tailwind CSS classes
 *
 * ## Best Practices
 * - Always provide a default date or initial state
 * - Handle undefined dates gracefully
 * - Use TypeScript for type safety
 * - Consider user experience in date selection
 *
 * @see https://react-day-picker.js.org/ React DayPicker Documentation
 * @category Components
 * @category Form
 */
export const AppCalendar = Calendar;
