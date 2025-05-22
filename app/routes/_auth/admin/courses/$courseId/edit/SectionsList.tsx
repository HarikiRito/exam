import { Edit2, Trash2 } from 'lucide-react';

import { editCourseSectionState, SectionWithChildren } from 'app/routes/_auth/admin/courses/$courseId/edit/state';
import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppTooltip } from 'app/shared/components/tooltip/AppTooltip';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { cn } from 'app/shared/utils/className';

interface SectionsListProps {
  readonly onStartEditingSection: (section: SectionWithChildren) => void;
}

export function SectionsList({ onStartEditingSection }: SectionsListProps) {
  const snap = editCourseSectionState.useStateSnapshot();
  const mutation = editCourseSectionState.proxyState;

  // Recursive section renderer
  function renderSectionItem(section: (typeof snap.sections)[number]) {
    // Determine if this section has children
    const hasChildren = section.children && section.children.length > 0;

    return (
      <AppAccordion.Item key={section.id} value={section.id} className='mb-2 rounded-md border px-4'>
        <AppAccordion.Trigger className={cn(hasChildren && '[&[data-state=open]>svg]:hidden')}>
          {section.description ? (
            <AppTooltip.Root>
              <AppTooltip.Trigger asChild>
                <div className='flex w-full items-center justify-between'>
                  <div className='flex flex-col items-start text-left'>
                    <h3 className='text-base font-semibold'>{section.title}</h3>
                    <p className='max-w-[400px] truncate text-sm text-gray-600'>{section.description}</p>
                  </div>
                  <div className='flex gap-2'>
                    <AppButton
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartEditingSection(section as SectionWithChildren);
                      }}>
                      <Edit2 className='h-4 w-4' />
                    </AppButton>
                    <AppButton
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      onClick={(e) => {
                        e.stopPropagation();
                        mutation.deletingSectionId = section.id;
                      }}>
                      <Trash2 className='text-destructive h-4 w-4' />
                    </AppButton>
                  </div>
                </div>
              </AppTooltip.Trigger>
              <AppTooltip.Content>
                <p>{section.description}</p>
              </AppTooltip.Content>
            </AppTooltip.Root>
          ) : (
            <div className='flex w-full items-center justify-between'>
              <div className='flex flex-col items-start text-left'>
                <h3 className='text-base font-semibold'>{section.title}</h3>
                <p className='max-w-[400px] truncate text-sm text-gray-600'>{section.description}</p>
              </div>
              <div className='flex gap-2'>
                <AppButton
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditingSection(section as SectionWithChildren);
                  }}>
                  <Edit2 className='h-4 w-4' />
                </AppButton>
                <AppButton
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={(e) => {
                    e.stopPropagation();
                    mutation.deletingSectionId = section.id;
                  }}>
                  <Trash2 className='text-destructive h-4 w-4' />
                </AppButton>
              </div>
            </div>
          )}
        </AppAccordion.Trigger>

        {hasChildren && (
          <AppAccordion.Content>
            <div className='space-y-2 py-2'>
              {/* Render child sections */}
              <div className='pl-4'>
                {section.children.map((childSection) => (
                  <AppAccordion.Item
                    key={childSection.id}
                    value={childSection.id}
                    className='mb-2 rounded-md border px-4'>
                    <AppAccordion.Trigger className='[&[data-state=open]>svg]:hidden'>
                      {childSection.description ? (
                        <AppTooltip.Root>
                          <AppTooltip.Trigger asChild>
                            <div className='flex w-full items-center justify-between'>
                              <div className='flex flex-col items-start text-left'>
                                <h3 className='text-base font-semibold'>{childSection.title}</h3>
                                <p className='max-w-[400px] truncate text-sm text-gray-600'>
                                  {childSection.description}
                                </p>
                              </div>
                              <div className='flex gap-2'>
                                <AppButton
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStartEditingSection(childSection as unknown as SectionWithChildren);
                                  }}>
                                  <Edit2 className='h-4 w-4' />
                                </AppButton>
                                <AppButton
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    mutation.deletingSectionId = childSection.id;
                                  }}>
                                  <Trash2 className='text-destructive h-4 w-4' />
                                </AppButton>
                              </div>
                            </div>
                          </AppTooltip.Trigger>
                          <AppTooltip.Content>
                            <p>{childSection.description}</p>
                          </AppTooltip.Content>
                        </AppTooltip.Root>
                      ) : (
                        <div className='flex w-full items-center justify-between'>
                          <div className='flex flex-col items-start text-left'>
                            <h3 className='text-base font-semibold'>{childSection.title}</h3>
                            <p className='max-w-[400px] truncate text-sm text-gray-600'>{childSection.description}</p>
                          </div>
                          <div className='flex gap-2'>
                            <AppButton
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartEditingSection(childSection as unknown as SectionWithChildren);
                              }}>
                              <Edit2 className='h-4 w-4' />
                            </AppButton>
                            <AppButton
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              onClick={(e) => {
                                e.stopPropagation();
                                mutation.deletingSectionId = childSection.id;
                              }}>
                              <Trash2 className='text-destructive h-4 w-4' />
                            </AppButton>
                          </div>
                        </div>
                      )}
                    </AppAccordion.Trigger>
                  </AppAccordion.Item>
                ))}
              </div>
            </div>
          </AppAccordion.Content>
        )}
      </AppAccordion.Item>
    );
  }

  return (
    <div className='mb-6'>
      {snap.sections.length > 0 ? (
        <AppAccordion.Root type='multiple' className='space-y-2'>
          {snap.sections.map((section) => renderSectionItem(section))}
        </AppAccordion.Root>
      ) : (
        <div className='rounded-md border p-8 text-center'>
          <AppTypography.p className='text-muted-foreground'>
            No sections found for this course. Create a section below.
          </AppTypography.p>
        </div>
      )}
    </div>
  );
}
