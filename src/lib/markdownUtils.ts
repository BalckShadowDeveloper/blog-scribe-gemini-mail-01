
// Enhanced markdown to HTML converter with better paragraph handling
export const markdownToHtml = (markdown: string): string => {
  console.log('🎨 Starting markdown to HTML conversion...');
  console.log('📝 Input markdown length:', markdown.length);
  
  let html = markdown;
  let conversionSteps = 0;

  // Step 1: Convert headers with enhanced styling
  console.log('🔧 Step 1: Converting headers...');
  const headersBefore = (html.match(/^#{1,3}\s/gm) || []).length;
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 20px; font-weight: bold; color: #4f46e5; margin: 25px 0 15px 0; line-height: 1.3;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 24px; font-weight: bold; color: #3b82f6; margin: 30px 0 20px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; line-height: 1.3;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 28px; font-weight: bold; color: #6b46c1; margin: 35px 0 25px 0; border-bottom: 3px solid #6b46c1; padding-bottom: 10px; line-height: 1.3;">$1</h1>');
  console.log(`✅ Converted ${headersBefore} headers`);
  conversionSteps++;

  // Step 2: Convert text formatting (bold/italic)
  console.log('🔧 Step 2: Converting text formatting...');
  const boldBefore = (html.match(/\*\*.*?\*\*/g) || []).length;
  const italicBefore = (html.match(/\*.*?\*/g) || []).length;
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #1f2937;">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #6b46c1;">$1</em>');
  console.log(`✅ Converted ${boldBefore} bold and ${italicBefore} italic elements`);
  conversionSteps++;

  // Step 3: Convert code blocks and inline code
  console.log('🔧 Step 3: Converting code elements...');
  const codeBlocksBefore = (html.match(/```[\s\S]*?```/g) || []).length;
  const inlineCodeBefore = (html.match(/`.*?`/g) || []).length;
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 20px 0; font-family: Monaco, Consolas, monospace; line-height: 1.4;"><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/g, '<code style="background: #f1f5f9; color: #6b46c1; padding: 2px 6px; border-radius: 4px; font-family: Monaco, Consolas, monospace; font-size: 14px;">$1</code>');
  console.log(`✅ Converted ${codeBlocksBefore} code blocks and ${inlineCodeBefore} inline code elements`);
  conversionSteps++;

  // Step 4: Convert blockquotes
  console.log('🔧 Step 4: Converting blockquotes...');
  const blockquotesBefore = (html.match(/^>\s/gm) || []).length;
  html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #6b46c1; background: #f8fafc; padding: 20px; margin: 25px 0; font-style: italic; color: #4c1d95; border-radius: 0 8px 8px 0; line-height: 1.6;">$1</blockquote>');
  console.log(`✅ Converted ${blockquotesBefore} blockquotes`);
  conversionSteps++;

  // Step 5: Convert lists (unordered and ordered)
  console.log('🔧 Step 5: Converting lists...');
  const listItemsBefore = (html.match(/^[\*\-]\s/gm) || []).length + (html.match(/^\d+\.\s/gm) || []).length;
  
  // Convert list items
  html = html.replace(/^\* (.*$)/gim, '<li style="margin: 10px 0; line-height: 1.6; color: #374151;">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li style="margin: 10px 0; line-height: 1.6; color: #374151;">$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin: 10px 0; line-height: 1.6; color: #374151;">$1</li>');

  // Wrap consecutive list items in ul tags
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, (match) => {
    return `<ul style="margin: 20px 0; padding-left: 25px; list-style-type: disc;">${match}</ul>`;
  });
  
  console.log(`✅ Converted ${listItemsBefore} list items`);
  conversionSteps++;

  // Step 6: Convert links
  console.log('🔧 Step 6: Converting links...');
  const linksBefore = (html.match(/\[.*?\]\(.*?\)/g) || []).length;
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #3b82f6; text-decoration: none; border-bottom: 1px solid #3b82f6;" onmouseover="this.style.color=\'#1d4ed8\'; this.style.borderColor=\'#1d4ed8\';" onmouseout="this.style.color=\'#3b82f6\'; this.style.borderColor=\'#3b82f6\';">$1</a>');
  console.log(`✅ Converted ${linksBefore} links`);
  conversionSteps++;

  // Step 7: Convert paragraphs - ENHANCED FOR BETTER EMAIL FORMATTING
  console.log('🔧 Step 7: Converting paragraphs for email...');
  console.log('📄 Pre-paragraph content preview:', html.substring(0, 300));
  
  // Split content by double newlines to identify paragraph blocks
  const paragraphBlocks = html.split(/\n\s*\n/).filter(block => block.trim());
  console.log('📋 Found', paragraphBlocks.length, 'paragraph blocks');
  
  const processedBlocks = paragraphBlocks.map((block, index) => {
    const trimmedBlock = block.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
    
    // Don't wrap if it's already an HTML element
    if (trimmedBlock.startsWith('<') && (
        trimmedBlock.includes('<h') || 
        trimmedBlock.includes('<ul') || 
        trimmedBlock.includes('<ol') || 
        trimmedBlock.includes('<blockquote') || 
        trimmedBlock.includes('<pre') ||
        trimmedBlock.includes('<li')
      )) {
      console.log(`📄 Block ${index + 1}: Preserved HTML element`);
      return trimmedBlock;
    }
    
    // Wrap regular text in paragraph tags with enhanced styling for email
    const paragraph = `<p style="margin: 25px 0; line-height: 1.8; text-align: justify; color: #374151; font-size: 16px; font-weight: 400;">${trimmedBlock}</p>`;
    console.log(`📄 Block ${index + 1}: Created paragraph (${trimmedBlock.length} chars)`);
    return paragraph;
  });
  
  html = processedBlocks.join('\n\n');
  console.log(`✅ Processed ${paragraphBlocks.length} blocks into paragraphs`);
  conversionSteps++;

  // Final step: Clean up and validate
  console.log('🔧 Final step: Cleaning up HTML...');
  
  // Ensure proper spacing between elements
  html = html.replace(/(<\/[^>]+>)\s*(<[^>]+>)/g, '$1\n\n$2');
  
  console.log('✅ HTML cleanup complete');
  console.log(`🎉 Conversion completed in ${conversionSteps} steps`);
  console.log('📊 Final HTML length:', html.length);
  
  // Final validation
  const finalParagraphs = (html.match(/<p[^>]*>/g) || []).length;
  const finalHeaders = (html.match(/<h[1-6][^>]*>/g) || []).length;
  const finalLists = (html.match(/<ul[^>]*>/g) || []).length;
  
  console.log('📈 Final conversion summary:');
  console.log(`  - Paragraphs: ${finalParagraphs}`);
  console.log(`  - Headers: ${finalHeaders}`);
  console.log(`  - Lists: ${finalLists}`);
  console.log('🔍 Final HTML preview:', html.substring(0, 500) + '...');

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
