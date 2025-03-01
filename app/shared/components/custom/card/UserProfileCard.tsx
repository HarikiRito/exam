'use client';

import { AppAvatar } from 'app/shared/components/avatar/AppAvatar';
import { AppBadge } from 'app/shared/components/badge/AppBadge';
import { AppCard } from 'app/shared/components/card/AppCard';
import { AppProgress } from 'app/shared/components/progress/AppProgress';
import { cn } from 'app/shared/utils/className';

export interface UserProfileCardProps {
  readonly name: string;
  readonly email: string;
  readonly level: string;
  readonly rank: string;
  readonly score: number;
  readonly progress: number;
  readonly avatar: string;
  readonly className?: string;
}

export function UserProfileCard({
  name,
  email,
  level,
  rank,
  score,
  progress,
  avatar,
  className,
}: UserProfileCardProps) {
  return (
    <AppCard.Root className={cn(className)}>
      <AppCard.Header>
        <AppCard.Title>User Profile</AppCard.Title>
        <AppCard.Description>Your learning journey stats</AppCard.Description>
      </AppCard.Header>
      <AppCard.Content>
        <div className='flex items-center gap-4'>
          <AppAvatar.Root className='size-16'>
            <AppAvatar.Image src={avatar} alt={name} />
            <AppAvatar.Fallback>{name.substring(0, 2)}</AppAvatar.Fallback>
          </AppAvatar.Root>
          <div>
            <h3 className='text-lg font-semibold'>{name}</h3>
            <p className='text-muted-foreground text-sm'>{email}</p>
            <div className='mt-2 flex gap-2'>
              <AppBadge variant='secondary'>Level: {level}</AppBadge>
              <AppBadge variant='default'>Rank: {rank}</AppBadge>
            </div>
          </div>
        </div>
      </AppCard.Content>
      <AppCard.Footer>
        <div className='w-full'>
          <div className='mb-1 flex justify-between'>
            <span className='text-sm font-medium'>Score: {score} points</span>
            <span className='text-sm font-medium'>{progress}%</span>
          </div>
          <AppProgress value={progress} className='w-full' />
        </div>
      </AppCard.Footer>
    </AppCard.Root>
  );
}
