
// Enhanced markdown to HTML converter with proper formatting
export const markdownToHtml = (markdown: string): string => {
  let html = markdown;

  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 20px; font-weight: bold; color: #4f46e5; margin: 25px 0 15px 0;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 24px; font-weight: bold; color: #3b82f6; margin: 30px 0 20px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 28px; font-weight: bold; color: #6b46c1; margin: 35px 0 25px 0; border-bottom: 3px solid #6b46c1; padding-bottom: 10px;">$1</h1>');

  // Convert bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #1f2937;">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #6b46c1;">$1</em>');

  // Convert code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 20px 0;"><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/g, '<code style="background: #f1f5f9; color: #6b46c1; padding: 2px 6px; border-radius: 4px; font-family: Monaco, Consolas, monospace; font-size: 14px;">$1</code>');

  // Convert blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #6b46c1; background: #f8fafc; padding: 20px; margin: 25px 0; font-style: italic; color: #4c1d95; border-radius: 0 8px 8px 0;">$1</blockquote>');

  // Convert unordered lists
  html = html.replace(/^\* (.*$)/gim, '<li style="margin: 10px 0; line-height: 1.6;">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li style="margin: 10px 0; line-height: 1.6;">$1</li>');

  // Convert ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin: 10px 0; line-height: 1.6;">$1</li>');

  // Wrap consecutive list items in ul/ol tags
  html = html.replace(/(<li[^>]*>.*<\/li>\s*)+/gs, (match) => {
    return `<ul style="margin: 20px 0; padding-left: 25px;">${match}</ul>`;
  });

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #3b82f6; text-decoration: none;" onmouseover="this.style.textDecoration=\'underline\'; this.style.color=\'#1d4ed8\';" onmouseout="this.style.textDecoration=\'none\'; this.style.color=\'#3b82f6\';">$1</a>');

  // Convert line breaks to paragraphs
  const paragraphs = html.split(/\n\s*\n/).filter(p => p.trim());
  html = paragraphs.map(p => {
    const trimmed = p.trim();
    // Don't wrap if it's already an HTML element
    if (trimmed.startsWith('<') && (trimmed.includes('<h') || trimmed.includes('<ul') || trimmed.includes('<ol') || trimmed.includes('<blockquote') || trimmed.includes('<pre'))) {
      return trimmed;
    }
    return `<p style="margin: 20px 0; line-height: 1.7; text-align: justify; color: #374151;">${trimmed}</p>`;
  }).join('\n\n');

  return html;
};

export const cleanMarkdownForPreview = (content: string): string => {
  // Remove excessive line breaks and clean up formatting
  return content
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
};
