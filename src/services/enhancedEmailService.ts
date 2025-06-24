
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
    console.log('📧 Formatting email with enhanced structure...');
    console.log('📝 Content length:', content.length);
    
    // Step 1: Ensure content is properly structured for email
    const emailReadyContent = this.prepareContentForEmail(content);
    console.log('✅ Content prepared for email structure');
    
    // Step 2: Convert to HTML with email-optimized styling
    const htmlContent = markdownToHtml(emailReadyContent);
    console.log('✅ HTML conversion completed for email');
    
    const secondImageUrl = `https://picsum.photos/600/300?random=${Date.now() + 1000}&sig=${encodeURIComponent(topic + '-secondary')}`;
    
    // Step 3: Create email template with proper structure for email clients
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.7; color: #2c3e50; background-color: #f7fafc;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header Section -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">${headline}</h1>
              <div style="margin-top: 15px;">
                <span style="background: rgba(255,255,255,0.25); padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #ffffff; margin-right: 15px;">${topic}</span>
                <span style="font-size: 14px; color: rgba(255,255,255,0.9);">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </td>
          </tr>
          
          <!-- Featured Image -->
          <tr>
            <td style="padding: 0;">
              <img src="${imageUrl}" alt="${headline}" style="width: 100%; max-width: 600px; height: 320px; object-fit: cover; display: block; border: 0;">
            </td>
          </tr>
          
          <!-- Content Section -->
          <tr>
            <td style="padding: 40px;">
              <div style="font-size: 16px; line-height: 1.8; color: #374151;">
                ${htmlContent}
              </div>
            </td>
          </tr>
          
          <!-- Secondary Image -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <img src="${secondImageUrl}" alt="Supporting visual for ${topic}" style="width: 100%; max-width: 520px; height: 260px; object-fit: cover; border-radius: 8px; display: block; border: 0; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
            </td>
          </tr>
          
          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 12px; text-align: center;">
                <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600; line-height: 1.5;">💡 Found this helpful? Share it with your friends and let us know what you think!</p>
              </div>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>`;
  }

  private prepareContentForEmail(content: string): string {
    console.log('🧹 Preparing content structure for email rendering...');
    console.log('📊 Input length:', content.length);
    
    // Normalize and clean the content
    let prepared = content
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/ +/g, ' ')
      .trim();

    // Ensure proper paragraph separation for email rendering
    const paragraphs = prepared.split('\n\n').filter(p => p.trim());
    
    // Validate each paragraph has proper structure
    const validatedParagraphs = paragraphs.map(paragraph => {
      const cleaned = paragraph.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
      
      // Ensure minimum paragraph length for readability
      if (cleaned.length < 50) {
        console.log('⚠️ Short paragraph detected, may need combination');
      }
      
      return cleaned;
    });

    const result = validatedParagraphs.join('\n\n');
    
    console.log('✅ Content prepared for email');
    console.log('📋 Paragraphs created:', validatedParagraphs.length);
    console.log('📄 Output length:', result.length);
    
    return result;
  }

  async sendBlogEmail(blogData: BlogEmailData): Promise<boolean> {
    if (!this.emailConfig.emailjsServiceId || !this.emailConfig.emailjsTemplateId || !this.emailConfig.emailjsPublicKey) {
      throw new Error('EmailJS configuration is incomplete');
    }

    try {
      emailjs.init(this.emailConfig.emailjsPublicKey);

      console.log('🚀 Starting enhanced email send process...');
      console.log('📧 Creating email-optimized format...');
      
      const bloggerFormattedContent = this.formatForBlogger(
        blogData.content, 
        blogData.headline, 
        blogData.topic, 
        blogData.imageUrl
      );

      console.log('✅ Email format created successfully');
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
        console.log('✅ Email sent successfully with enhanced formatting!');
        toast.success(`Blog post "${blogData.headline}" sent via email with proper paragraph formatting!`);
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
