import { Edit2, Trash2 } from 'lucide-react';

import { editCourseSectionState, SectionWithChildren } from 'app/routes/_auth/admin/courses/$courseId/edit/state';
import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { cn } from 'app/shared/utils/className';

export function SectionsList() {
  const snap = editCourseSectionState.useStateSnapshot();
  const mutation = editCourseSectionState.proxyState;

  // Start editing a section
  function startEditingSection(section: SectionWithChildren) {
    mutation.editingSectionId = section.id;
    mutation.editingSection = section;
    // Ensure the sectionId is string or empty string for type safety
    mutation.parentSectionId = section.sectionId ?? null;
  }

  // Recursive section renderer
  function renderSectionItem(section: (typeof snap.sections)[number]) {
    // Determine if this section has children
    const hasChildren = section.children && section.children.length > 0;

    const content = _renderSectionItemContent(section);

    return (
      <AppAccordion.Item key={section.id} value={section.id} className='mb-2 rounded-md border px-4'>
        <AppAccordion.Trigger
          classes={{
            icon: cn(!hasChildren && 'invisible'),
          }}
          className={cn(!hasChildren && 'pointer-events-none')}>
          {content}
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
                    <AppAccordion.Trigger
                      classes={{
                        icon: 'invisible',
                      }}
                      className={cn(!hasChildren && 'pointer-events-none')}>
                      {_renderSectionItemContent(childSection)}
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

  function _renderSectionItemContent(section: SectionWithChildren) {
    return (
      <div className='flex w-full items-center justify-between'>
        <div className='flex flex-col items-start text-left'>
          <h3 className='text-base font-semibold'>{section.title}</h3>
          <p className='max-w-[400px] truncate text-sm text-gray-600'>{section.description}</p>
        </div>
        <div className='flex gap-2'>
          <AppButton
            variant='ghost'
            size='icon'
            className='pointer-events-auto h-8 w-8'
            onClick={(e) => {
              e.stopPropagation();
              startEditingSection(section);
            }}>
            <Edit2 className='h-4 w-4' />
          </AppButton>
          <AppButton
            variant='ghost'
            size='icon'
            className='pointer-events-auto h-8 w-8'
            onClick={(e) => {
              e.stopPropagation();
              mutation.deletingSectionId = section.id;
            }}>
            <Trash2 className='text-destructive h-4 w-4' />
          </AppButton>
        </div>
      </div>
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
