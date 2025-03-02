import { ExampleMultipleChoice } from 'app/routes/demo/ExampleMultipleChoice';
import { TimesheetCards } from 'app/routes/demo/TimesheetCards';
import { DataTableExample } from 'app/routes/demo/DataTableExample';
import { MultipleChoiceGrid } from 'app/shared/components/custom/multiple-choice/MultipleChoiceGrid';
import { AppSeparator } from 'app/shared/components/separator/AppSeparator';
import { TypographyDemo } from 'app/routes/demo/TypographyDemo';

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
};

export default function Demo() {
  function Headline(props: { readonly label: string; readonly link: string }) {
    return (
      <div>
        <a href={props.link} className='text-2xl font-bold'>
          {props.label}
        </a>
        <AppSeparator className='my-4' />
      </div>
    );
  }

  return (
    <div className='space-y-4 p-8'>
      {Object.entries(DemoMap).map(([key, item]) => (
        <div key={key}>
          <Headline label={item.label} link={`#${key}`} />
          <item.component />
        </div>
      ))}
    </div>
  );
}
