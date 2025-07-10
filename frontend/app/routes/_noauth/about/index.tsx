import { AppMarkdown } from 'app/shared/components/ui/markdown/AppMarkdown';
import { useState } from 'react';
import { useEffect } from 'react';
export default function AboutPage() {
  const [content, setContent] = useState('');
  useEffect(() => {
    async function fetchContent() {
      const response = await fetch('/GUIDELINE.md').then((res) => res.text());
      setContent(response);
    }
    fetchContent();
  }, []);

  return <AppMarkdown className='h-screen flex-1 overflow-auto p-8'>{content}</AppMarkdown>;
}
