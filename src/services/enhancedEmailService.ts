
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
    console.log('📧 Creating email with simplified formatting pipeline...');
    console.log('📝 Raw content length:', content.length);
    
    // Step 1: Direct conversion to email-optimized HTML
    const htmlContent = markdownToHtml(content);
    console.log('✅ Content converted to HTML for email');
    
    const secondImageUrl = `https://picsum.photos/600/300?random=${Date.now() + 1000}&sig=${encodeURIComponent(topic + '-secondary')}`;
    
    // Step 2: Create streamlined email template optimized for paragraph display
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .content p { margin: 0 0 20px 0 !important; padding: 0 !important; line-height: 1.8 !important; font-size: 16px !important; color: #374151 !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f7fafc;">
  
  <div class="container">
    
    <!-- Header -->
    <div style="padding: 30px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <h1 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 700; line-height: 1.3;">${headline}</h1>
      <div style="margin-top: 15px;">
        <span style="background: rgba(255,255,255,0.25); padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 15px;">${topic}</span>
        <span style="font-size: 14px; opacity: 0.9;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
    
    <!-- Featured Image -->
    <div style="padding: 0;">
      <img src="${imageUrl}" alt="${headline}" style="width: 100%; height: 320px; object-fit: cover; display: block; border: 0;">
    </div>
    
    <!-- Content with Optimized Paragraph Spacing -->
    <div class="content" style="padding: 40px; font-size: 16px; line-height: 1.8; color: #374151;">
      ${htmlContent}
    </div>
    
    <!-- Secondary Image -->
    <div style="padding: 0 40px 40px 40px; text-align: center;">
      <img src="${secondImageUrl}" alt="Supporting visual for ${topic}" style="width: 100%; max-width: 520px; height: 260px; object-fit: cover; border-radius: 8px; display: block; border: 0; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
    </div>
    
    <!-- Call to Action -->
    <div style="padding: 0 40px 40px 40px;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 12px; text-align: center;">
        <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600; line-height: 1.5;">💡 Found this helpful? Share it with your friends and let us know what you think!</p>
      </div>
    </div>
    
  </div>
  
</body>
</html>`;
  }

  async sendBlogEmail(blogData: BlogEmailData): Promise<boolean> {
    if (!this.emailConfig.emailjsServiceId || !this.emailConfig.emailjsTemplateId || !this.emailConfig.emailjsPublicKey) {
      throw new Error('EmailJS configuration is incomplete');
    }

    try {
      emailjs.init(this.emailConfig.emailjsPublicKey);

      console.log('🚀 Starting streamlined email send process...');
      console.log('📧 Using simplified formatting pipeline...');
      
      const bloggerFormattedContent = this.formatForBlogger(
        blogData.content, 
        blogData.headline, 
        blogData.topic, 
        blogData.imageUrl
      );

      console.log('✅ Email template created with optimized paragraph structure');
      console.log('📤 Sending email via EmailJS...');

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
        console.log('✅ Email sent successfully with proper paragraph formatting!');
        toast.success(`Blog post "${blogData.headline}" sent via email with fixed paragraph breaks!`);
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
