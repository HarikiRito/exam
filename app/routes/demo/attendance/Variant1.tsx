import { zodResolver } from '@hookform/resolvers/zod';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppDialog } from 'app/shared/components/dialog/AppDialog';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// Zod schema for attendance
const attendanceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  sessionDescription: z.string().optional(),
});

type AttendanceData = z.infer<typeof attendanceSchema>;

export function AttendanceVariant1() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sessions, setSessions] = useState<AttendanceData[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AttendanceData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      date: '',
      startTime: '',
      endTime: '',
      sessionDescription: '',
    },
  });

  const onSubmit = (data: AttendanceData) => {
    setSessions([...sessions, data]);
    reset();
    setIsDialogOpen(false);
  };

  return (
    <div>
      <AppDialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AppDialog.Trigger asChild>
          <AppButton>Log Attendance</AppButton>
        </AppDialog.Trigger>
        <AppDialog.Content className='max-w-md'>
          <AppDialog.Header>
            <AppDialog.Title>Attendance Tracker</AppDialog.Title>
            <AppDialog.Description>Log your daily sessions</AppDialog.Description>
          </AppDialog.Header>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <Controller
              name='date'
              control={control}
              render={({ field }) => (
                <div>
                  <AppTypography.small>Date</AppTypography.small>
                  <AppInput type='date' {...field} className={errors.date ? 'border-destructive' : ''} />
                  {errors.date && (
                    <AppTypography.small className='text-destructive'>{errors.date.message}</AppTypography.small>
                  )}
                </div>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <Controller
                name='startTime'
                control={control}
                render={({ field }) => (
                  <div>
                    <AppTypography.small>Start Time</AppTypography.small>
                    <AppInput type='time' {...field} className={errors.startTime ? 'border-destructive' : ''} />
                    {errors.startTime && (
                      <AppTypography.small className='text-destructive'>{errors.startTime.message}</AppTypography.small>
                    )}
                  </div>
                )}
              />

              <Controller
                name='endTime'
                control={control}
                render={({ field }) => (
                  <div>
                    <AppTypography.small>End Time</AppTypography.small>
                    <AppInput type='time' {...field} className={errors.endTime ? 'border-destructive' : ''} />
                    {errors.endTime && (
                      <AppTypography.small className='text-destructive'>{errors.endTime.message}</AppTypography.small>
                    )}
                  </div>
                )}
              />
            </div>

            <Controller
              name='sessionDescription'
              control={control}
              render={({ field }) => (
                <div>
                  <AppTypography.small>Session Description (optional)</AppTypography.small>
                  <AppInput placeholder='Describe your session...' {...field} />
                </div>
              )}
            />

            <AppDialog.Footer>
              <AppButton type='submit'>Log Session</AppButton>
              <AppButton variant='outline' onClick={() => setIsDialogOpen(false)}>
                Cancel
              </AppButton>
            </AppDialog.Footer>
          </form>
        </AppDialog.Content>
      </AppDialog.Root>

      {sessions.length > 0 && (
        <div className='mt-6'>
          <AppTypography.h3>Session History</AppTypography.h3>
          <div className='space-y-2'>
            {sessions.map((session, index) => (
              <div key={index} className='bg-muted/30 rounded-lg p-3'>
                <div className='flex justify-between'>
                  <AppTypography.small className='font-bold'>{session.date}</AppTypography.small>
                  <AppTypography.small>
                    {session.startTime} - {session.endTime}
                  </AppTypography.small>
                </div>
                {session.sessionDescription && (
                  <AppTypography.small className='text-muted-foreground mt-2 block'>
                    {session.sessionDescription}
                  </AppTypography.small>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
