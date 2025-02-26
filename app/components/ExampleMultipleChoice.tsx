import * as React from 'react';
import { MultipleChoice } from 'app/shared/components/custom/multiple-choice/MultipleChoice';

export function ExampleMultipleChoice() {
  const [selectedOption, setSelectedOption] = React.useState<string>('option2');

  function handleChange(value: string) {
    setSelectedOption(value);
    console.log('Selected option:', value);
  }

  return (
    <div className='mx-auto max-w-xl p-6'>
      <h1 className='mb-6 text-2xl font-bold'>Multiple Choice Example</h1>

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

        {/* Uncontrolled example */}
        <MultipleChoice
          question='How many years of experience do you have?'
          options={[
            { value: 'beginner', label: 'Less than 1 year' },
            { value: 'intermediate', label: '1-3 years' },
            { value: 'experienced', label: '3-5 years' },
            { value: 'expert', label: '5+ years' },
          ]}
          defaultValue='intermediate'
        />

        {/* Disabled example */}
        <MultipleChoice
          question='Which framework do you use most often?'
          description='This question is currently disabled.'
          options={[
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue.js' },
            { value: 'angular', label: 'Angular' },
            { value: 'svelte', label: 'Svelte' },
          ]}
          defaultValue='react'
          disabled
        />
      </div>
    </div>
  );
}

export default ExampleMultipleChoice;
