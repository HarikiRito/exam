import * as React from 'react';
import { MultipleChoice } from 'app/shared/components/custom/multiple-choice/MultipleChoice';

export function ExampleMultipleChoice() {
  const [selectedOption, setSelectedOption] = React.useState<string>('option2');

  function handleChange(value: string) {
    setSelectedOption(value);
  }

  return (
    <div className='max-w-xl p-6'>
      <div className='space-y-6'>
        {/* Controlled example */}
        <MultipleChoice
          question='What is your favorite programming language?'
          description='Select the language you enjoy working with the most.'
          options={[
            { value: 'option1', label: 'JavaScript' },
            { value: 'option2', label: 'TypeScript' },
            { value: 'option3', label: 'Python' },
            { value: 'option4', label: 'Rust' },
          ]}
          value={selectedOption}
          onValueChange={handleChange}
        />
      </div>
    </div>
  );
}

export default ExampleMultipleChoice;
