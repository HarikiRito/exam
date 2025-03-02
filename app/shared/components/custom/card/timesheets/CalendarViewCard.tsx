import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCard } from 'app/shared/components/card/AppCard';
import { cn } from 'app/shared/utils/className';

type Day = {
  day: number;
  status: 'present' | 'absent' | 'leave' | 'weekend' | 'none';
};

type CalendarViewCardProps = {
  readonly month: string;
  readonly year: number;
  readonly days: Day[];
  readonly daysPresent: number;
  readonly daysAbsent: number;
  readonly daysLeave: number;
};

export function CalendarViewCard({ month, year, days, daysPresent, daysAbsent, daysLeave }: CalendarViewCardProps) {
  // Week day labels
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get status class for a day
  function getStatusClass(status: Day['status']) {
    switch (status) {
      case 'present':
        return cn('bg-green-100 text-green-800');
      case 'absent':
        return cn('bg-red-100 text-red-800');
      case 'leave':
        return cn('bg-amber-100 text-amber-800');
      case 'weekend':
        return cn('bg-gray-50 text-gray-400');
      default:
        return cn('bg-gray-100');
    }
  }

  return (
    <AppCard.Root className='w-full max-w-md'>
      <AppCard.Header>
        <div className='flex items-center justify-between'>
          <AppCard.Title className='text-xl'>
            {month} {year}
          </AppCard.Title>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1'>
              <div className='h-3 w-3 rounded-full bg-green-500'></div>
              <span className='text-xs'>Present</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-3 w-3 rounded-full bg-red-500'></div>
              <span className='text-xs'>Absent</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-3 w-3 rounded-full bg-amber-500'></div>
              <span className='text-xs'>Leave</span>
            </div>
          </div>
        </div>
      </AppCard.Header>
      <AppCard.Content>
        <div className='grid grid-cols-7 gap-3'>
          {/* Calendar header */}
          {weekDays.map((day) => (
            <div key={day} className='py-1 text-center text-xs font-medium'>
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day) => (
            <div className='flex w-full items-center justify-center'>
              <span
                key={day.day}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full p-1 text-center text-sm',
                  getStatusClass(day.status),
                )}>
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </AppCard.Content>
      <AppCard.Footer className='flex-col justify-center'>
        <div className='grid w-full grid-cols-2 gap-2'>
          <AppButton variant='lightBlue'>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M8 4V8L10.5 10.5M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            Clock In/Out
          </AppButton>
          <AppButton variant='lightPurple'>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M8 4V8M8 12H8.01M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z'
                stroke='currentColor'
                strokeLinecap='round'
              />
            </svg>
            Request Leave
          </AppButton>
        </div>
        <div className='mt-3 text-sm'>
          <span className='font-medium'>Monthly Summary: </span>
          <span className='font-bold text-green-600'>{daysPresent} days present</span>
          <span className='mx-2'>|</span>
          <span className='font-bold text-red-500'>{daysAbsent} absence</span>
          <span className='mx-2'>|</span>
          <span className='font-bold text-amber-500'>{daysLeave} leave</span>
        </div>
      </AppCard.Footer>
    </AppCard.Root>
  );
}
