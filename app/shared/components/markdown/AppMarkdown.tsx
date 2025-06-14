import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { cn } from 'app/shared/utils/className';

interface AppMarkdownProps {
  readonly children: string;
  readonly className?: string;
  readonly components?: React.ComponentProps<typeof ReactMarkdown>['components'];
}

function CodeBlock({ className, children }: { readonly className?: string; readonly children: React.ReactNode }) {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  if (language) {
    const codeString = React.Children.toArray(children)
      .map((child) => (typeof child === 'string' ? child : ''))
      .join('');
    return (
      <div className='my-6'>
        <SyntaxHighlighter language={language} PreTag='div' className='rounded-md'>
          {codeString.replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  }

  return <AppTypography.inlineCode className={cn(className)}>{children}</AppTypography.inlineCode>;
}

export function AppMarkdown({ children, className, components }: AppMarkdownProps) {
  const defaultComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
    // Headings
    h1: ({ className: headingClassName, children: headingChildren, ...props }) => (
      <AppTypography.h1 className={cn('mt-8 first:mt-0', headingClassName)} {...props}>
        {headingChildren}
      </AppTypography.h1>
    ),
    h2: ({ className: headingClassName, children: headingChildren, ...props }) => (
      <AppTypography.h2 className={cn('mt-8 first:mt-0', headingClassName)} {...props}>
        {headingChildren}
      </AppTypography.h2>
    ),
    h3: ({ className: headingClassName, children: headingChildren, ...props }) => (
      <AppTypography.h3 className={cn('mt-6 first:mt-0', headingClassName)} {...props}>
        {headingChildren}
      </AppTypography.h3>
    ),
    h4: ({ className: headingClassName, children: headingChildren, ...props }) => (
      <AppTypography.h4 className={cn('mt-6 first:mt-0', headingClassName)} {...props}>
        {headingChildren}
      </AppTypography.h4>
    ),
    h5: ({ className: headingClassName, children: headingChildren, ...props }) => (
      <h5
        className={cn('mt-6 scroll-m-20 text-lg font-semibold tracking-tight first:mt-0', headingClassName)}
        {...props}>
        {headingChildren}
      </h5>
    ),
    h6: ({ className: headingClassName, children: headingChildren, ...props }) => (
      <h6
        className={cn('mt-6 scroll-m-20 text-base font-semibold tracking-tight first:mt-0', headingClassName)}
        {...props}>
        {headingChildren}
      </h6>
    ),

    // Paragraphs
    p: ({ className: paragraphClassName, children: paragraphChildren, ...props }) => (
      <AppTypography.p className={cn(paragraphClassName)} {...props}>
        {paragraphChildren}
      </AppTypography.p>
    ),

    // Lists
    ul: ({ className: listClassName, children: listChildren, ...props }) => (
      <AppTypography.ul className={cn(listClassName)} {...props}>
        {listChildren}
      </AppTypography.ul>
    ),
    ol: ({ className: listClassName, children: listChildren, ...props }) => (
      <AppTypography.ol className={cn(listClassName)} {...props}>
        {listChildren}
      </AppTypography.ol>
    ),
    li: ({ className: listItemClassName, children: listItemChildren, ...props }) => (
      <AppTypography.li className={cn(listItemClassName)} {...props}>
        {listItemChildren}
      </AppTypography.li>
    ),

    // Blockquotes
    blockquote: ({ className: blockquoteClassName, children: blockquoteChildren, ...props }) => (
      <AppTypography.blockquote className={cn(blockquoteClassName)} {...props}>
        {blockquoteChildren}
      </AppTypography.blockquote>
    ),

    // Code blocks and inline code
    code: ({ className, children, ...props }) => (
      <CodeBlock className={className} {...props}>
        {children}
      </CodeBlock>
    ),

    // Pre tag (for code blocks without language)
    pre: ({ className: preClassName, children: preChildren, ...props }) => (
      <pre className={cn('bg-muted my-6 overflow-x-auto rounded-md p-4 text-sm', preClassName)} {...props}>
        {preChildren}
      </pre>
    ),

    // Links
    a: ({ className: linkClassName, children: linkChildren, href, ...props }) => (
      <a
        className={cn(
          'text-primary hover:text-primary/80 underline underline-offset-4 transition-colors',
          linkClassName,
        )}
        href={href}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...props}>
        {linkChildren}
      </a>
    ),

    // Images
    img: ({ className: imgClassName, alt, src, ...props }) => (
      <img
        className={cn('my-4 h-auto max-w-full rounded-md', imgClassName)}
        alt={alt}
        src={src}
        loading='lazy'
        {...props}
      />
    ),

    // Tables
    table: ({ className: tableClassName, children: tableChildren, ...props }) => (
      <AppTypography.table className={cn(tableClassName)} {...props}>
        {tableChildren}
      </AppTypography.table>
    ),
    thead: ({ className: theadClassName, children: theadChildren, ...props }) => (
      <thead className={cn(theadClassName)} {...props}>
        {theadChildren}
      </thead>
    ),
    tbody: ({ className: tbodyClassName, children: tbodyChildren, ...props }) => (
      <tbody className={cn(tbodyClassName)} {...props}>
        {tbodyChildren}
      </tbody>
    ),
    tr: ({ className: trClassName, children: trChildren, ...props }) => (
      <AppTypography.tr className={cn(trClassName)} {...props}>
        {trChildren}
      </AppTypography.tr>
    ),
    th: ({ className: thClassName, children: thChildren, ...props }) => (
      <AppTypography.th className={cn(thClassName)} {...props}>
        {thChildren}
      </AppTypography.th>
    ),
    td: ({ className: tdClassName, children: tdChildren, ...props }) => (
      <AppTypography.td className={cn(tdClassName)} {...props}>
        {tdChildren}
      </AppTypography.td>
    ),

    // Text formatting
    strong: ({ className: strongClassName, children: strongChildren, ...props }) => (
      <strong className={cn('font-semibold', strongClassName)} {...props}>
        {strongChildren}
      </strong>
    ),
    em: ({ className: emClassName, children: emChildren, ...props }) => (
      <em className={cn('italic', emClassName)} {...props}>
        {emChildren}
      </em>
    ),
    del: ({ className: delClassName, children: delChildren, ...props }) => (
      <del className={cn('text-muted-foreground line-through', delClassName)} {...props}>
        {delChildren}
      </del>
    ),

    // Horizontal rule
    hr: ({ className: hrClassName, ...props }) => <hr className={cn('border-border my-8', hrClassName)} {...props} />,

    // Task list items (from remark-gfm)
    input: ({ type, checked, disabled, ...props }) => {
      if (type === 'checkbox') {
        return (
          <input type='checkbox' checked={checked} disabled={disabled} className='accent-primary mr-2' {...props} />
        );
      }
      return <input type={type} {...props} />;
    },
  };

  // Merge default components with user-provided components
  const mergedComponents = { ...defaultComponents, ...components };

  return (
    <div className={cn('prose prose-neutral dark:prose-invert !text-decoration-none max-w-none', className)}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} components={mergedComponents}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
