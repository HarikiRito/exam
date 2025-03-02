import { AppAvatar } from 'app/shared/components/avatar/AppAvatar';
import { AppCard } from 'app/shared/components/card/AppCard';
import { AppProgress } from 'app/shared/components/progress/AppProgress';
import { cn } from 'app/shared/utils/className';
import { UsersIcon } from 'lucide-react';

type TeamMember = {
  name: string;
  attendance: number;
  color: string;
};

type TeamComparisonCardProps = {
  readonly month: string;
  readonly teamMembers: TeamMember[];
};

export function TeamComparisonCard({ month, teamMembers }: TeamComparisonCardProps) {
  // Calculate team average attendance
  function calculateTeamAverage(members: TeamMember[]) {
    return Math.round(members.reduce((sum, member) => sum + member.attendance, 0) / (members.length || 1));
  }

  // Find top performer
  function getTopPerformer(members: TeamMember[]) {
    if (members.length === 0) return null;
    return members.reduce((prev, current) => (prev.attendance > current.attendance ? prev : current));
  }

  const topPerformer = getTopPerformer(teamMembers);
  const teamAverage = calculateTeamAverage(teamMembers);

  return (
    <AppCard.Root className='w-full max-w-md'>
      <AppCard.Header>
        <div className='flex items-center justify-between'>
          <AppCard.Title className='flex items-center gap-2 text-xl'>
            <UsersIcon size={18} />
            Team Attendance
          </AppCard.Title>
          <span className='rounded-full bg-indigo-100 px-2 py-0.5 text-sm font-medium text-indigo-800'>{month}</span>
        </div>
        <AppCard.Description>Compare attendance rates across team members</AppCard.Description>
      </AppCard.Header>
      <AppCard.Content>
        <div className='space-y-4'>
          {teamMembers.map((member, index) => (
            <div key={index} className='space-y-1'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <AppAvatar.Root
                    className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-white')}>
                    <AppAvatar.Fallback className={cn('text-white', member.color)}>
                      {member.name.charAt(0)}
                    </AppAvatar.Fallback>
                  </AppAvatar.Root>
                  <span className='font-medium'>{member.name}</span>
                </div>
                <span className='font-bold'>{member.attendance}%</span>
              </div>
              <AppProgress value={member.attendance} className='mt-3' classes={{ indicator: cn(member.color) }} />
            </div>
          ))}
        </div>

        <div className='mt-6 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='font-medium'>Team Average</span>
            <span className='font-bold text-indigo-600'>{teamAverage}%</span>
          </div>
          <div className='text-muted-foreground text-sm'>
            {topPerformer?.name || 'Top performer'} has the highest attendance rate with{' '}
            {topPerformer?.attendance || 95}%
          </div>
        </div>
      </AppCard.Content>
    </AppCard.Root>
  );
}
