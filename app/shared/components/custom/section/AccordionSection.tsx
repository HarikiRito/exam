import { Edit2, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import { CourseSectionItemFragment } from 'app/graphql/operations/courseSection/courseSection.fragment.generated';
import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { cn } from 'app/shared/utils/className';
import { deepClone } from 'valtio/utils';

// TODO: Test rendering of sections and children recursively
// TODO: Test onEdit and onDelete callbacks are called with correct parameters
// TODO: Test empty state rendering when sections array is empty
// TODO: Test accessibility attributes (aria-label, keyboard navigation)
// TODO: Test custom className prop is applied correctly
// TODO: Test accordion behavior with multiple sections
// TODO: Test nested children rendering and interaction

interface AccordionSectionProps {
  readonly sections: SectionWithChildren[];
  readonly onEdit: (section: SectionWithChildren) => void;
  readonly onDelete: (sectionId: string) => void;
  readonly className?: string;
  readonly emptyStateMessage?: string;
}
export interface SectionWithChildren extends CourseSectionItemFragment {
  children: SectionWithChildren[];
}
export function AccordionSection({
  sections,
  onEdit,
  onDelete,
  className,
  emptyStateMessage = 'No sections found. Create a section to get started.',
}: AccordionSectionProps) {
  // Memoize deeply cloned and sorted sections
  const sortedRootSections = useMemo(() => {
    const deepCopy = deepClone(sections); // Deep clone

    deepCopy.sort((a, b) => a.order - b.order); // Sort root sections by order
    deepCopy.forEach((section) => {
      if (section.children?.length) {
        section.children.sort((a, b) => a.order - b.order); // Sort children by order
      }
    });
    return deepCopy;
  }, [sections]);

  // Recursive section renderer
  function renderSectionItem(section: SectionWithChildren) {
    // Determine if this section has children
    const hasChildren = section.children && section.children.length > 0;

    const content = renderSectionItemContent(section);

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
                      aria-label={`Toggle subsection: ${childSection.title}`}
                      classes={{
                        icon: 'invisible',
                      }}
                      className='pointer-events-none'>
                      {renderSectionItemContent(childSection)}
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

  function renderSectionItemContent(section: SectionWithChildren) {
    return (
      <div className='flex w-full items-center justify-between'>
        <div className='flex flex-col items-start text-left'>
          <h3 className='text-base font-semibold'>{section.title}</h3>
          {section.description && <p className='max-w-[400px] truncate text-sm text-gray-600'>{section.description}</p>}
        </div>
        <div className='flex gap-2'>
          <AppButton
            variant='ghost'
            size='icon'
            className='pointer-events-auto h-8 w-8'
            onClick={(e) => {
              e.stopPropagation();
              onEdit(section);
            }}>
            <Edit2 className='h-4 w-4' />
          </AppButton>
          <AppButton
            variant='ghost'
            size='icon'
            className='pointer-events-auto h-8 w-8'
            onClick={(e) => {
              e.stopPropagation();
              onDelete(section.id);
            }}>
            <Trash2 className='text-destructive h-4 w-4' />
          </AppButton>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (sections.length === 0) {
    return (
      <div className={cn('rounded-md border p-8 text-center', className)}>
        <AppTypography.p className='text-muted-foreground'>{emptyStateMessage}</AppTypography.p>
      </div>
    );
  }

  return (
    <div className={className}>
      <AppAccordion.Root type='multiple' className='space-y-2'>
        {sortedRootSections.map((section) => renderSectionItem(section))}
      </AppAccordion.Root>
    </div>
  );
}
