
import { marked } from 'marked';

// Configure marked for proper rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

export const parseMarkdown = (markdown: string): string => {
  const result = marked(markdown);
  // marked can return a Promise in some cases, but with our config it should be synchronous
  return typeof result === 'string' ? result : '';
};

export const cleanMarkdownForPreview = (content: string): string => {
  // Remove excessive line breaks and clean up formatting
  return content
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
};
