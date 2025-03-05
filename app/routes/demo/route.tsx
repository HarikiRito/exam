import { ExampleMultipleChoice } from 'app/routes/demo/ExampleMultipleChoice';
import { TimesheetCards } from 'app/routes/demo/TimesheetCards';
import { DataTableExample } from 'app/routes/demo/DataTableExample';
import { MultipleChoiceGrid } from 'app/shared/components/custom/multiple-choice/MultipleChoiceGrid';
import { AppSeparator } from 'app/shared/components/separator/AppSeparator';
import { TypographyDemo } from 'app/routes/demo/TypographyDemo';
import { AppLink } from 'app/shared/components/link/AppLink';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AttendanceVariant1 } from 'app/routes/demo/attendance/Variant1';

const DemoMap = {
  typography: {
    label: 'Typography',
    component: TypographyDemo,
  },
  'data-table': {
    label: 'Data Table',
    component: DataTableExample,
  },
  'timesheet-cards': {
    label: 'Timesheet Cards',
    component: TimesheetCards,
  },
  'multiple-choice': {
    label: 'Multiple Choice',
    component: ExampleMultipleChoice,
  },
  'multiple-choice-grid': {
    label: 'Multiple Choice Grid',
    component: () => (
      <MultipleChoiceGrid
        question='What is your favorite programming language?'
        description='Select the language you enjoy working with the most.'
        options={[
          { value: 'option1', label: 'JavaScript' },
          { value: 'option2', label: 'TypeScript' },
          { value: 'option3', label: 'Python' },
          { value: 'option4', label: 'Rust' },
          { value: 'option5', label: 'Go' },
          { value: 'option6', label: 'Java' },
        ]}
      />
    ),
  },
  'attendance-basic': {
    label: 'Attendance: Basic Tracker',
    component: AttendanceVariant1,
  },
};

export default function Demo() {
  function Headline(props: { readonly label: string; readonly link: string }) {
    return (
      <div id={props.link}>
        <span className='text-2xl font-bold'>{props.label}</span>
        <AppSeparator className='my-4' />
      </div>
    );
  }

  function handleScrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className='relative'>
      <div className='space-y-4 p-8'>
        <div className='flex flex-grow gap-4'>
          {Object.entries(DemoMap).map(([key, item]) => (
            <AppLink key={key} href={`#${key}`}>
              {item.label}
            </AppLink>
          ))}
        </div>
        {Object.entries(DemoMap).map(([key, item]) => (
          <div key={key}>
            <Headline label={item.label} link={key} />
            <item.component />
          </div>
        ))}
      </div>
      <AppButton
        onClick={handleScrollToTop}
        variant='default'
        size='icon'
        className='fixed right-4 bottom-4'
        aria-label='Scroll to top'>
        ↑
      </AppButton>
    </div>
  );
}
