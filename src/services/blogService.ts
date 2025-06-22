
import { toast } from 'sonner';

export interface BlogContent {
  topic: string;
  headline: string;
  content: string;
  imageUrl: string;
}

export class BlogService {
  private geminiApiKey: string;

  constructor(geminiApiKey: string) {
    this.geminiApiKey = geminiApiKey;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key is required');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async generateTrendingTopic(): Promise<string> {
    const topicCategories = [
      'Health and wellness breakthrough trends',
      'Money making and passive income strategies', 
      'Productivity and life optimization hacks',
      'Sustainable living and eco-friendly innovations',
      'Personal development and mindset shifts',
      'Social media marketing secrets',
      'Technology breakthroughs (non-AI)',
      'Fitness and nutrition discoveries',
      'Investment and financial freedom',
      'Side hustles and entrepreneurship',
      'Home improvement and DIY solutions',
      'Travel hacks and budget adventures',
      'Relationship and dating advice',
      'Career advancement strategies',
      'Fashion and style trends'
    ];
    
    const randomCategory = topicCategories[Math.floor(Math.random() * topicCategories.length)];
    
    const topicsText = await this.callGeminiAPI(
      `Generate 1 VIRAL trending topic specifically about "${randomCategory}". 
      
      IMPORTANT: Do NOT mention AI, artificial intelligence, or machine learning at all.
      Focus specifically on the category: ${randomCategory}
      
      Make it:
      - 4-8 words maximum
      - Clickbait-worthy and trending on social media
      - Specific to the ${randomCategory} niche
      - Something people are actively searching for in 2024
      
      Examples of good topics:
      - "Intermittent Fasting Weight Loss Hack"
      - "Passive Income Real Estate Strategy" 
      - "Morning Routine Productivity Boost"
      - "Zero Waste Lifestyle Benefits"
      
      Return only the topic, nothing else.`
    );
    
    return topicsText.trim().replace(/^\d+\.\s*/, '').replace(/['"]/g, '');
  }

  async generateHeadline(topic: string): Promise<string> {
    const headlineText = await this.callGeminiAPI(
      `Generate 1 VIRAL, clickbait headline for a blog post about "${topic}". 
      
      Use these PROVEN viral headline formulas:
      - "This [Topic] Trick Will Change Your Life in 30 Days"
      - "Why Everyone is Talking About [Topic] (And You Should Too)"
      - "The [Topic] Secret That [Experts/Celebrities] Don't Want You to Know"
      - "I Tried [Topic] for 30 Days - Here's What Happened"
      - "[Number] [Topic] Hacks That Will Blow Your Mind"
      - "The Shocking Truth About [Topic] That Nobody Talks About"
      
      Make it:
      - Under 60 characters for SEO
      - Include power words: Secret, Shocking, Ultimate, Proven, Exclusive
      - Create curiosity gap
      - Promise transformation or revelation
      
      Return only the headline.`
    );
    return headlineText.trim().replace(/^\d+\.\s*/, '');
  }

  async generateBlogPost(headline: string, topic: string): Promise<string> {
    return await this.callGeminiAPI(
      `Write a comprehensive, engaging blog post with the headline "${headline}" about "${topic}".

      IMPORTANT: Use proper Markdown formatting throughout the entire post.
      
      STRUCTURE (800-1000 words):
      
      # ${headline}
      
      Start with an engaging opening paragraph that hooks the reader about ${topic}.
      
      ## Why This Matters Now
      
      Write a paragraph explaining why this topic is relevant and important right now.
      
      ## The Problem Most People Don't Know About
      
      Continue with 2-3 paragraphs covering the main challenges people face with ${topic}.
      
      ## The Solution That Actually Works
      
      ### Key Benefits
      
      - Benefit 1: Specific advantage
      - Benefit 2: Another clear benefit  
      - Benefit 3: Third important benefit
      
      ### How to Get Started
      
      1. **Step 1**: Clear action step
      2. **Step 2**: Next specific step
      3. **Step 3**: Final implementation step
      
      ## Real Examples and Results
      
      Provide specific examples and case studies showing results.
      
      > "Include a compelling quote or testimonial here to add credibility."
      
      ## Common Mistakes to Avoid
      
      - **Mistake 1**: What not to do and why
      - **Mistake 2**: Another pitfall to avoid
      - **Mistake 3**: Third common error
      
      ## Take Action Today
      
      End with a compelling closing paragraph that encourages immediate action.
      
      FORMATTING REQUIREMENTS:
      - Use proper markdown headings (# ## ###)
      - Include bullet points and numbered lists
      - Add bold and italic text for emphasis
      - Include at least one blockquote
      - Use the keyword "${topic}" naturally 6-8 times throughout
      - Write in an engaging, conversational tone
      - Ensure each section flows naturally into the next`
    );
  }

  generateTopicRelevantImage(topic: string, headline: string): string {
    const topicKeywords = topic.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 3)
      .join('-');
    
    const headlineKeywords = headline.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3 && !['the', 'and', 'for', 'with', 'your'].includes(word))
      .slice(0, 2)
      .join('-');
    
    const combinedKeywords = `${topicKeywords}-${headlineKeywords}`;
    return `https://picsum.photos/800/400?random=${Date.now()}&sig=${encodeURIComponent(combinedKeywords)}`;
  }

  async generateCompleteBlogPost(): Promise<BlogContent> {
    const topic = await this.generateTrendingTopic();
    const headline = await this.generateHeadline(topic);
    const content = await this.generateBlogPost(headline, topic);
    const imageUrl = this.generateTopicRelevantImage(topic, headline);
    
    return {
      topic,
      headline,
      content,
      imageUrl
    };
  }
}
