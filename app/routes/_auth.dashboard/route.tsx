import { MultipleChoiceGrid } from 'app/shared/components/custom/multiple-choice/MultipleChoiceGrid';

export default function AuthDashboard() {
  return (
    <div className='p-6'>
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
    </div>
  );
}
