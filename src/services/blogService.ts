
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
    console.log('🚀 Generating well-structured blog post...');
    
    const content = await this.callGeminiAPI(
      `Write a comprehensive, engaging blog post with the headline "${headline}" about "${topic}".

      CRITICAL STRUCTURE REQUIREMENTS FOR EMAIL:
      - Write EXACTLY 8-10 distinct paragraphs
      - Each paragraph must be 3-5 complete sentences
      - Separate each paragraph with exactly TWO newline characters (\\n\\n)
      - NO markdown formatting (no #, *, _, \`, etc.)
      - Write in plain text with natural paragraph breaks
      - Each paragraph should focus on one main idea
      
      PARAGRAPH STRUCTURE (800-1000 words total):
      
      Paragraph 1: Hook - Start with an engaging opening about ${topic}. Write 4-5 sentences that immediately grab attention and introduce the main concept.

      Paragraph 2: Problem - Explain the current challenge people face with ${topic}. Write 3-4 sentences describing why this is a real issue affecting many people.

      Paragraph 3: Why Now - Discuss why ${topic} is particularly relevant right now. Include 3-4 sentences about current trends and timing.

      Paragraph 4: Solution Overview - Introduce the main approach or method. Write 4-5 sentences explaining what works and why it's different.

      Paragraph 5: Key Benefits - Detail the specific advantages and results. Use 3-4 sentences to highlight measurable improvements people can expect.

      Paragraph 6: Step-by-Step - Provide actionable advice people can implement. Write 4-5 sentences with concrete steps or strategies.

      Paragraph 7: Real Examples - Share specific examples or case studies. Use 3-4 sentences to illustrate the concepts with real-world applications.

      Paragraph 8: Common Mistakes - Address what to avoid and why. Include 3-4 sentences about pitfalls and how to prevent them.

      Paragraph 9: Call to Action - End with motivation and next steps. Write 4-5 sentences encouraging readers to take action.

      IMPORTANT FORMATTING RULES:
      - Use the keyword "${topic}" naturally 6-8 times throughout
      - Write conversational, engaging tone
      - NO special symbols or formatting
      - Each paragraph is a complete thought
      - Separate paragraphs with \\n\\n ONLY`
    );

    console.log('✅ Blog post generated, now cleaning for email compatibility...');
    return this.cleanContentForEmail(content);
  }

  private cleanContentForEmail(content: string): string {
    console.log('🔧 Cleaning content specifically for email rendering...');
    
    // Step 1: Remove any markdown or formatting artifacts
    let cleaned = content
      .replace(/#{1,6}\s*/g, '') // Remove hash headers
      .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1') // Remove asterisk formatting
      .replace(/`(.*?)`/g, '$1') // Remove backticks
      .replace(/_{2,}(.*?)_{2,}/g, '$1') // Remove underscores
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .trim();

    // Step 2: Ensure proper paragraph separation
    const paragraphs = cleaned
      .split(/\n\s*\n/) // Split on double newlines
      .map(p => p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()) // Clean each paragraph
      .filter(p => p.length > 10); // Remove very short paragraphs

    // Step 3: Rejoin with consistent double newlines
    const result = paragraphs.join('\n\n');
    
    console.log('✅ Content cleaned for email');
    console.log('📊 Paragraph count:', paragraphs.length);
    console.log('📄 Total length:', result.length, 'characters');
    
    return result;
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
