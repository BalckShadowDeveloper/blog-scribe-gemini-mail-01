
// Simplified markdown to HTML converter optimized specifically for email rendering
export const markdownToHtml = (markdown: string): string => {
  console.log('🎨 Converting markdown to HTML for email...');
  console.log('📝 Input length:', markdown.length);
  
  if (!markdown || typeof markdown !== 'string') {
    console.log('⚠️ Invalid markdown input, returning empty string');
    return '';
  }

  let html = markdown.trim();

  // Step 1: Clean up any existing HTML or markdown artifacts
  console.log('🧹 Cleaning existing formatting...');
  html = html
    .replace(/<[^>]*>/g, '') // Remove any existing HTML tags
    .replace(/#{1,6}\s*/g, '') // Remove markdown headers
    .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1') // Remove asterisk formatting
    .replace(/`(.*?)`/g, '$1') // Remove backticks
    .replace(/_{2,}(.*?)_{2,}/g, '$1'); // Remove underscores

  // Step 2: Split content into paragraphs using double newlines
  console.log('📋 Processing paragraphs...');
  const paragraphs = html
    .split(/\n\s*\n/) // Split on double newlines
    .map(p => p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()) // Clean each paragraph
    .filter(p => p.length > 0); // Remove empty paragraphs

  console.log(`📊 Created ${paragraphs.length} paragraphs from content`);

  // Step 3: Convert each paragraph to HTML with email-safe styling
  const htmlParagraphs = paragraphs.map((paragraph, index) => {
    console.log(`📄 Processing paragraph ${index + 1}: ${paragraph.substring(0, 50)}...`);
    return `<p style="margin: 0 0 20px 0; padding: 0; line-height: 1.8; font-size: 16px; color: #374151; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${paragraph}</p>`;
  });

  const result = htmlParagraphs.join('\n');
  
  console.log('✅ Markdown to HTML conversion completed');
  console.log('📊 Final HTML length:', result.length);
  console.log('🔍 Paragraph count:', htmlParagraphs.length);

  return result;
};

export const cleanMarkdownForPreview = (content: string): string => {
  console.log('🧹 Cleaning markdown for preview...');
  const cleaned = content
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
  console.log('✅ Markdown cleaned for preview');
  return cleaned;
};
