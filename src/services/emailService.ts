
import emailjs from '@emailjs/browser';

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  recipientEmail: string;
  senderEmail: string;
}

export interface BlogEmailData {
  subject: string;
  content: string;
  imageUrl: string;
  topic: string;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    emailjs.init(this.config.publicKey);
  }

  async sendBlogEmail(blogData: BlogEmailData): Promise<boolean> {
    try {
      const templateParams = {
        to_email: this.config.recipientEmail,
        from_email: this.config.senderEmail,
        subject: blogData.subject,
        blog_content: blogData.content,
        image_url: blogData.imageUrl,
        generated_at: new Date().toLocaleString(),
        topic: blogData.topic
      };

      const response = await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('EmailJS Error:', error);
      throw error;
    }
  }

  static validateConfig(config: Partial<EmailConfig>): boolean {
    return !!(
      config.serviceId &&
      config.templateId &&
      config.publicKey &&
      config.recipientEmail
    );
  }
}
