
import { marked } from 'marked';

// Configure marked for proper rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

export const parseMarkdown = (markdown: string): string => {
  return marked(markdown);
};

export const cleanMarkdownForPreview = (content: string): string => {
  // Remove excessive line breaks and clean up formatting
  return content
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
};
