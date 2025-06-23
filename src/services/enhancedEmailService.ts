

import emailjs from '@emailjs/browser';
import { markdownToHtml } from '@/lib/markdownUtils';
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
    console.log('📧 Starting email formatting process...');
    console.log('📝 Input content length:', content.length);
    
    // Step 1: Ensure proper content structure with enhanced preservation
    const structuredContent = this.ensureProperContentStructure(content);
    console.log('✅ Content structure preserved');
    
    // Step 2: Convert markdown to properly formatted HTML
    const htmlContent = markdownToHtml(structuredContent);
    console.log('✅ Markdown converted to HTML');
    console.log('🔍 HTML preview:', htmlContent.substring(0, 500) + '...');
    
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
  
</div>`;
  }

  private ensureProperContentStructure(content: string): string {
    console.log('🔧 Processing content structure for email...');
    console.log('📊 Input length:', content.length);
    
    // Step 1: Normalize line endings but preserve structure
    let processedContent = content
      .replace(/\r\n/g, '\n')  // Normalize to Unix line endings
      .replace(/\n{4,}/g, '\n\n\n')  // Limit to max 3 consecutive newlines
      .trim();
    
    console.log('✅ Normalized line endings');
    
    // Step 2: Ensure proper paragraph separation
    // Split content into blocks (paragraphs, headers, lists, etc.)
    const blocks = processedContent.split(/\n\s*\n/).filter(block => block.trim());
    console.log('📋 Found', blocks.length, 'content blocks');
    
    const enhancedBlocks: string[] = [];
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i].trim();
      if (!block) continue;
      
      // Clean up internal spacing within the block
      const cleanedBlock = block
        .replace(/\n+/g, ' ')  // Replace internal newlines with spaces
        .replace(/\s+/g, ' ')  // Normalize multiple spaces
        .trim();
      
      enhancedBlocks.push(cleanedBlock);
    }
    
    // Step 3: Rejoin with proper double newlines
    const result = enhancedBlocks.join('\n\n');
    
    console.log('✅ Content structure enhanced');
    console.log('📄 Output length:', result.length);
    console.log('🔍 Structure preview:', result.substring(0, 400) + '...');
    
    return result;
  }

  async sendBlogEmail(blogData: BlogEmailData): Promise<boolean> {
    if (!this.emailConfig.emailjsServiceId || !this.emailConfig.emailjsTemplateId || !this.emailConfig.emailjsPublicKey) {
      throw new Error('EmailJS configuration is incomplete');
    }

    try {
      emailjs.init(this.emailConfig.emailjsPublicKey);

      console.log('🚀 Starting email send process...');
      console.log('📧 Formatting content for email delivery...');
      
      const bloggerFormattedContent = this.formatForBlogger(
        blogData.content, 
        blogData.headline, 
        blogData.topic, 
        blogData.imageUrl
      );

      console.log('✅ Email content formatted successfully');
      console.log('📤 Preparing to send email...');

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
        console.log('✅ Email sent successfully!');
        toast.success(`Blog post "${blogData.headline}" sent via email with enhanced formatting!`);
        return true;
      } else {
        throw new Error(`EmailJS returned status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      toast.error('Failed to send email. Check EmailJS configuration and console for details.');
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
