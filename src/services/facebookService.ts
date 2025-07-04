import { toast } from 'sonner';

export interface FacebookConfig {
  pageId: string;
  accessToken: string;
  appId: string;
  appSecret: string;
}

export interface BlogPostData {
  topic: string;
  headline: string;
  content: string;
  imageUrl: string;
}

export class FacebookService {
  private facebookConfig: FacebookConfig;

  constructor(facebookConfig: FacebookConfig) {
    this.facebookConfig = facebookConfig;
  }

  private formatContentForFacebook(content: string, headline: string, topic: string): string {
    console.log('📱 Formatting content for Facebook post...');
    
    // Remove any HTML tags if present
    const cleanContent = content.replace(/<[^>]*>/g, '');
    
    // Split into paragraphs and take first 2-3 for Facebook
    const paragraphs = cleanContent
      .split(/\n\s*\n/)
      .filter(p => p.trim().length > 0)
      .slice(0, 3); // Facebook works better with shorter posts
    
    // Create engaging Facebook post format
    const facebookPost = `🔥 ${headline}

${paragraphs.join('\n\n')}

#${topic.replace(/\s+/g, '')} #BlogPost #Trending #ViralContent #MustRead

👇 What do you think? Let us know in the comments!`;

    console.log('✅ Content formatted for Facebook');
    return facebookPost;
  }

  async postToFacebook(blogData: BlogPostData): Promise<boolean> {
    if (!this.facebookConfig.pageId || !this.facebookConfig.accessToken) {
      throw new Error('Facebook configuration is incomplete. Page ID and Access Token are required.');
    }

    try {
      console.log('🚀 Starting Facebook post process...');
      
      const message = this.formatContentForFacebook(
        blogData.content,
        blogData.headline,
        blogData.topic
      );

      console.log('📱 Posting to Facebook page...');
      
      // First, upload the image to Facebook if we have one
      let attachedMedia = null;
      if (blogData.imageUrl) {
        try {
          const photoResponse = await fetch(`https://graph.facebook.com/v18.0/${this.facebookConfig.pageId}/photos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: blogData.imageUrl,
              published: false, // Upload but don't publish yet
              access_token: this.facebookConfig.accessToken
            })
          });

          if (photoResponse.ok) {
            const photoData = await photoResponse.json();
            attachedMedia = [{ media_fbid: photoData.id }];
            console.log('📷 Image uploaded to Facebook');
          }
        } catch (error) {
          console.warn('⚠️ Image upload failed, posting without image:', error);
        }
      }

      // Create the post
      const postData: any = {
        message: message,
        access_token: this.facebookConfig.accessToken
      };

      if (attachedMedia) {
        postData.attached_media = JSON.stringify(attachedMedia);
      }

      const response = await fetch(`https://graph.facebook.com/v18.0/${this.facebookConfig.pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Facebook API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      
      if (result.id) {
        console.log('✅ Successfully posted to Facebook!');
        console.log('📱 Post ID:', result.id);
        toast.success(`Blog post "${blogData.headline}" posted to Facebook successfully!`);
        return true;
      } else {
        throw new Error('Facebook post created but no ID returned');
      }
      
    } catch (error) {
      console.error('❌ Facebook posting failed:', error);
      toast.error(`Failed to post to Facebook: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.facebookConfig.pageId || !this.facebookConfig.accessToken) {
      toast.error('Facebook Page ID and Access Token are required');
      return false;
    }

    try {
      console.log('🔍 Testing Facebook connection...');
      
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.facebookConfig.pageId}?fields=name,id&access_token=${this.facebookConfig.accessToken}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Facebook API error: ${errorData.error?.message || response.statusText}`);
      }

      const pageData = await response.json();
      console.log('✅ Facebook connection successful');
      console.log('📱 Connected to page:', pageData.name);
      toast.success(`Successfully connected to Facebook page: ${pageData.name}`);
      return true;
      
    } catch (error) {
      console.error('❌ Facebook connection test failed:', error);
      toast.error(`Facebook connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  validateConfiguration(): boolean {
    return !!(
      this.facebookConfig.pageId &&
      this.facebookConfig.accessToken
    );
  }

  async getPageInfo(): Promise<{ name: string; id: string; followers?: number } | null> {
    if (!this.validateConfiguration()) {
      return null;
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.facebookConfig.pageId}?fields=name,id,followers_count&access_token=${this.facebookConfig.accessToken}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          name: data.name,
          id: data.id,
          followers: data.followers_count
        };
      }
    } catch (error) {
      console.error('Failed to get page info:', error);
    }
    
    return null;
  }
}