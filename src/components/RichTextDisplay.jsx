/**
 * RichTextDisplay - Component to display HTML content from WYSIWYG editor
 * Used to render product specifications and formatted content
 */

export function RichTextDisplay({ content, className = "" }) {
  if (!content) return null;

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
