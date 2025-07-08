import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';

export function TypographyDemo() {
  return (
    <div className='space-y-8'>
      <div>
        <AppTypography.h1>The Heading One (H1)</AppTypography.h1>
        <AppTypography.p>
          This is a paragraph following the H1. It provides context and information related to the heading above.
        </AppTypography.p>
      </div>

      <div>
        <AppTypography.h2>The Heading Two (H2)</AppTypography.h2>
        <AppTypography.p>
          This is a paragraph following the H2. It provides additional details about this section.
        </AppTypography.p>
      </div>

      <div>
        <AppTypography.h3>The Heading Three (H3)</AppTypography.h3>
        <AppTypography.p>
          This is a paragraph following the H3. It contains specific information about this subsection.
        </AppTypography.p>
      </div>

      <div>
        <AppTypography.h4>The Heading Four (H4)</AppTypography.h4>
        <AppTypography.p>
          This is a paragraph following the H4. It provides detailed information about this specific topic.
        </AppTypography.p>
      </div>

      <div>
        <AppTypography.h2>Text Styles</AppTypography.h2>
        <AppTypography.lead>This is a lead paragraph. It stands out to introduce a section.</AppTypography.lead>
        <AppTypography.p>
          This is a regular paragraph with standard styling. It contains
          <AppTypography.inlineCode>inline code</AppTypography.inlineCode> and continues with normal text.
        </AppTypography.p>
        <AppTypography.large>This text is larger than normal for emphasis.</AppTypography.large>
        <AppTypography.small>
          This is small text, useful for captions or less important information.
        </AppTypography.small>
        <AppTypography.muted>
          This text is muted, using a subdued color to indicate secondary information.
        </AppTypography.muted>
      </div>

      <div>
        <AppTypography.h2>Blockquote Example</AppTypography.h2>
        <AppTypography.blockquote>
          This is a blockquote. It's commonly used to highlight a quote or important statement within the content.
        </AppTypography.blockquote>
      </div>

      <div>
        <AppTypography.h2>Lists Example</AppTypography.h2>
        <AppTypography.p>Unordered list:</AppTypography.p>
        <AppTypography.ul>
          <AppTypography.li>First unordered list item</AppTypography.li>
          <AppTypography.li>Second unordered list item</AppTypography.li>
          <AppTypography.li>Third unordered list item</AppTypography.li>
        </AppTypography.ul>

        <AppTypography.p>Ordered list:</AppTypography.p>
        <AppTypography.ol>
          <AppTypography.li>First ordered list item</AppTypography.li>
          <AppTypography.li>Second ordered list item</AppTypography.li>
          <AppTypography.li>Third ordered list item</AppTypography.li>
        </AppTypography.ol>
      </div>

      <div>
        <AppTypography.h2>Table Example</AppTypography.h2>
        <AppTypography.table>
          <thead>
            <AppTypography.tr>
              <AppTypography.th>Name</AppTypography.th>
              <AppTypography.th>Email</AppTypography.th>
              <AppTypography.th>Role</AppTypography.th>
            </AppTypography.tr>
          </thead>
          <tbody>
            <AppTypography.tr>
              <AppTypography.td>John Doe</AppTypography.td>
              <AppTypography.td>john@example.com</AppTypography.td>
              <AppTypography.td>Developer</AppTypography.td>
            </AppTypography.tr>
            <AppTypography.tr>
              <AppTypography.td>Jane Smith</AppTypography.td>
              <AppTypography.td>jane@example.com</AppTypography.td>
              <AppTypography.td>Designer</AppTypography.td>
            </AppTypography.tr>
          </tbody>
        </AppTypography.table>
      </div>
    </div>
  );
}
