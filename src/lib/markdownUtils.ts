
// Enhanced markdown to HTML converter optimized for email rendering
export const markdownToHtml = (markdown: string): string => {
  console.log('🎨 Converting markdown to HTML for email...');
  console.log('📝 Input length:', markdown.length);
  
  let html = markdown;

  // Step 1: Handle headers with email-safe styling
  console.log('🔧 Step 1: Converting headers...');
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 22px; font-weight: 700; color: #2563eb; margin: 30px 0 18px 0; line-height: 1.4;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 26px; font-weight: 700; color: #1e40af; margin: 35px 0 22px 0; line-height: 1.4;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 30px; font-weight: 700; color: #1e3a8a; margin: 40px 0 25px 0; line-height: 1.4;">$1</h1>');

  // Step 2: Handle text formatting
  console.log('🔧 Step 2: Converting text formatting...');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #1f2937;">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #4f46e5;">$1</em>');

  // Step 3: Handle code elements
  console.log('🔧 Step 3: Converting code elements...');
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 20px 0; font-family: Consolas, Monaco, monospace; font-size: 14px; line-height: 1.5;"><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/g, '<code style="background: #f1f5f9; color: #4f46e5; padding: 2px 6px; border-radius: 4px; font-family: Consolas, Monaco, monospace; font-size: 14px;">$1</code>');

  // Step 4: Handle blockquotes
  console.log('🔧 Step 4: Converting blockquotes...');
  html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #4f46e5; background: #f8fafc; padding: 16px 20px; margin: 20px 0; font-style: italic; color: #374151; border-radius: 0 8px 8px 0;">$1</blockquote>');

  // Step 5: Convert lists
  console.log('🔧 Step 5: Converting lists...');
  html = html.replace(/^\* (.*$)/gim, '<li style="margin: 8px 0; line-height: 1.7; color: #374151;">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li style="margin: 8px 0; line-height: 1.7; color: #374151;">$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin: 8px 0; line-height: 1.7; color: #374151;">$1</li>');
  
  // Wrap consecutive list items
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, (match) => {
    return `<ul style="margin: 20px 0; padding-left: 24px; list-style-type: disc;">${match}</ul>`;
  });

  // Step 6: Handle links
  console.log('🔧 Step 6: Converting links...');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>');

  // Step 7: CRITICAL - Handle paragraphs with email-optimized styling
  console.log('🔧 Step 7: Processing paragraphs for email clients...');
  
  // Split by double newlines to identify paragraph blocks
  const blocks = html.split(/\n\s*\n/).filter(block => block.trim());
  console.log('📋 Processing', blocks.length, 'content blocks');
  
  const processedBlocks = blocks.map((block, index) => {
    const trimmedBlock = block.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
    
    // Skip if already an HTML element
    if (trimmedBlock.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|div)/i)) {
      console.log(`📄 Block ${index + 1}: Preserved HTML element`);
      return trimmedBlock;
    }
    
    // Create paragraph with email-optimized styling
    const paragraph = `<p style="margin: 0 0 20px 0; padding: 0; line-height: 1.8; font-size: 16px; color: #374151; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${trimmedBlock}</p>`;
    console.log(`📄 Block ${index + 1}: Created email-optimized paragraph (${trimmedBlock.length} chars)`);
    return paragraph;
  });
  
  html = processedBlocks.join('\n');

  // Step 8: Final cleanup for email compatibility
  console.log('🔧 Step 8: Final email compatibility cleanup...');
  html = html.replace(/\n+/g, '\n').trim();

  console.log('✅ Markdown to HTML conversion completed');
  console.log('📊 Final HTML length:', html.length);
  console.log('🔍 First 200 chars:', html.substring(0, 200));

  return html;
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
