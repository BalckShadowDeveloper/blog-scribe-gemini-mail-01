
import emailjs from '@emailjs/browser';
import { parseMarkdown } from '@/lib/markdownUtils';
import { toast } from 'sonner';

export interface EmailConfig {
  recipientEmail: string;
  senderEmail: string;
  senderPassword: string;
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
}

export interface BlogEmailData {
  topic: string;
  headline: string;
  content: string;
  imageUrl: string;
}

export class EnhancedEmailService {
  private emailConfig: EmailConfig;

  constructor(emailConfig: EmailConfig) {
    this.emailConfig = emailConfig;
  }

  private formatForBlogger(content: string, headline: string, topic: string, imageUrl: string): string {
    // Process content to ensure proper structure before converting to HTML
    const structuredContent = this.ensureProperContentStructure(content);
    
    // Convert to HTML
    const htmlContent = parseMarkdown(structuredContent);
    const secondImageUrl = `https://picsum.photos/600/300?random=${Date.now() + 1000}&sig=${encodeURIComponent(topic + '-secondary')}`;
    
    return `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #2c3e50; max-width: 800px; margin: 0 auto; padding: 20px; background: #ffffff;">
  
  <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
    <h1 style="font-size: 28px; font-weight: bold; margin: 0; line-height: 1.3;">${headline}</h1>
    <div style="margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 15px; flex-wrap: wrap;">
      <span style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">${topic}</span>
      <span style="font-size: 14px; opacity: 0.9;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
  </div>
  
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${imageUrl}" alt="${headline}" style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
  </div>
  
  <div style="font-size: 16px; line-height: 1.8;">
    ${htmlContent}
  </div>
  
  <div style="text-align: center; margin: 40px 0;">
    <img src="${secondImageUrl}" alt="Supporting visual for ${topic}" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,0.1);">
  </div>
  
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center;">
    <p style="color: white; font-size: 16px; font-weight: 500; margin: 0;">💡 Found this helpful? Share it with your friends and let us know what you think!</p>
  </div>
  
</div>

<style>
  h1, h2, h3, h4, h5, h6 { color: #2c3e50; margin-top: 30px; margin-bottom: 15px; font-weight: bold; }
  h1 { font-size: 28px; color: #6b46c1; border-bottom: 3px solid #6b46c1; padding-bottom: 10px; }
  h2 { font-size: 24px; color: #3b82f6; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
  h3 { font-size: 20px; color: #4f46e5; }
  p { margin: 20px 0; text-align: justify; line-height: 1.7; }
  strong { color: #1f2937; font-weight: 600; }
  em { color: #6b46c1; font-style: italic; }
  ul, ol { margin: 20px 0; padding-left: 25px; }
  li { margin: 10px 0; line-height: 1.6; }
  blockquote { 
    border-left: 4px solid #6b46c1; 
    background: #f8fafc; 
    padding: 20px; 
    margin: 25px 0; 
    font-style: italic; 
    color: #4c1d95;
    border-radius: 0 8px 8px 0;
  }
  code { 
    background: #f1f5f9; 
    color: #6b46c1; 
    padding: 2px 6px; 
    border-radius: 4px; 
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 14px;
  }
  pre { 
    background: #1e293b; 
    color: #e2e8f0; 
    padding: 20px; 
    border-radius: 8px; 
    overflow-x: auto; 
    margin: 20px 0;
  }
  a { color: #3b82f6; text-decoration: none; }
  a:hover { text-decoration: underline; color: #1d4ed8; }
</style>`;
  }

  private ensureProperContentStructure(content: string): string {
    console.log('Input content length:', content.length);
    console.log('First 300 chars:', content.substring(0, 300));
    
    // Split by double newlines to get sections
    const sections = content.split('\n\n').filter(section => section.trim());
    const processedSections: string[] = [];
    
    for (const section of sections) {
      const trimmedSection = section.trim();
      if (!trimmedSection) continue;
      
      // Handle headers, lists, and blockquotes as-is
      if (trimmedSection.startsWith('#') || 
          trimmedSection.startsWith('-') || 
          trimmedSection.startsWith('*') || 
          trimmedSection.match(/^\d+\./) || 
          trimmedSection.startsWith('>')) {
        processedSections.push(trimmedSection);
        continue;
      }
      
      // For regular paragraphs, ensure they're well-formatted
      const cleanedParagraph = trimmedSection
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/\n/g, ' ')   // Remove internal line breaks
        .trim();
      
      // Split very long paragraphs
      if (cleanedParagraph.length > 600) {
        const sentences = cleanedParagraph.split(/\. (?=[A-Z])/);
        let currentParagraph = '';
        
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i] + (i < sentences.length - 1 ? '.' : '');
          
          if (currentParagraph.length + sentence.length > 400 && currentParagraph.length > 0) {
            processedSections.push(currentParagraph.trim());
            currentParagraph = sentence + ' ';
          } else {
            currentParagraph += sentence + ' ';
          }
        }
        
        if (currentParagraph.trim()) {
          processedSections.push(currentParagraph.trim());
        }
      } else {
        processedSections.push(cleanedParagraph);
      }
    }
    
    const result = processedSections.join('\n\n');
    console.log('Processed content structure (first 500 chars):', result.substring(0, 500));
    
    return result;
  }

  async sendBlogEmail(blogData: BlogEmailData): Promise<boolean> {
    if (!this.emailConfig.emailjsServiceId || !this.emailConfig.emailjsTemplateId || !this.emailConfig.emailjsPublicKey) {
      throw new Error('EmailJS configuration is incomplete');
    }

    try {
      emailjs.init(this.emailConfig.emailjsPublicKey);

      const bloggerFormattedContent = this.formatForBlogger(
        blogData.content, 
        blogData.headline, 
        blogData.topic, 
        blogData.imageUrl
      );

      const templateParams = {
        to_email: this.emailConfig.recipientEmail,
        from_email: this.emailConfig.senderEmail,
        subject: blogData.headline,
        blog_content: bloggerFormattedContent,
        image_url: blogData.imageUrl,
        generated_at: new Date().toLocaleString(),
        topic: blogData.topic
      };

      const response = await emailjs.send(
        this.emailConfig.emailjsServiceId,
        this.emailConfig.emailjsTemplateId,
        templateParams
      );

      if (response.status === 200) {
        toast.success(`Blog post "${blogData.headline}" sent via email!`);
        return true;
      } else {
        throw new Error(`EmailJS returned status: ${response.status}`);
      }
    } catch (error) {
      toast.error('Failed to send email. Check EmailJS configuration and console for details.');
      console.error('EmailJS Error:', error);
      return false;
    }
  }

  validateConfiguration(): boolean {
    return !!(
      this.emailConfig.recipientEmail &&
      this.emailConfig.emailjsServiceId &&
      this.emailConfig.emailjsTemplateId &&
      this.emailConfig.emailjsPublicKey
    );
  }
}
