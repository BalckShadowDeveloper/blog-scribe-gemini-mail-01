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
    console.log('🚀 Generating blog post with enhanced formatting...');
    
    const content = await this.callGeminiAPI(
      `Write a comprehensive, engaging blog post with the headline "${headline}" about "${topic}".

      CRITICAL FORMATTING FOR EMAIL RENDERING:
      - Each paragraph MUST be separated by EXACTLY TWO newlines (\\n\\n)
      - Write complete thoughts in each paragraph (3-5 sentences)
      - Use natural paragraph breaks at logical points
      - NO markdown headers (avoid # symbols) - use descriptive text instead
      - Structure content with clear topic transitions
      
      CONTENT STRUCTURE (800-1000 words):
      
      Start with an engaging opening paragraph about ${topic}. Make this 4-5 sentences that hook the reader and introduce the main concept. This should create immediate interest and curiosity about the topic.

      Write a second paragraph explaining why this topic matters right now. Include 3-4 sentences about current trends, relevance, and why people need this information today.

      Create a paragraph about the main problem people face with ${topic}. This should be 4-5 sentences describing the primary challenge, why it's difficult, and how it affects people's lives.

      Write another paragraph covering the solution approach. Explain in 4-5 sentences what works, why it's effective, and how it differs from common approaches that don't work.

      Add a paragraph with specific benefits and advantages. Use 3-4 sentences to highlight the key advantages, including any measurable results or improvements people can expect.

      Include a paragraph with actionable steps or practical advice. Write 4-5 sentences giving readers concrete things they can do to implement this information.

      Create a paragraph with examples, case studies, or real-world applications. Use 3-4 sentences to provide specific examples that illustrate the concepts in action.

      Write a paragraph addressing common mistakes or pitfalls to avoid. Include 3-4 sentences about what not to do and why these mistakes happen.

      End with a strong closing paragraph that encourages action. Use 4-5 sentences to motivate readers, summarize key points, and create a call to action.

      FORMATTING REQUIREMENTS:
      - Use the keyword "${topic}" naturally 6-8 times throughout  
      - Each paragraph should be 3-5 complete sentences
      - Separate ALL paragraphs with double newlines (\\n\\n)
      - Write in conversational, engaging tone
      - NO special formatting symbols or markdown
      - Focus on readability and natural flow`
    );

    console.log('✅ Generated blog content, now formatting for email...');
    return this.formatContentForEmail(content);
  }

  private formatContentForEmail(content: string): string {
    console.log('🔧 Formatting content specifically for email rendering...');
    
    // Step 1: Clean and normalize the content
    let formatted = content
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\t/g, ' ')     // Replace tabs with spaces
      .replace(/ +/g, ' ')     // Remove multiple spaces
      .trim();

    // Step 2: Remove any markdown symbols that might interfere
    formatted = formatted
      .replace(/#{1,6}\s*/g, '')  // Remove hash headers
      .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')  // Remove asterisk formatting
      .replace(/`(.*?)`/g, '$1')  // Remove backticks
      .replace(/_{2,}(.*?)_{2,}/g, '$1');  // Remove underscores

    // Step 3: Split into sentences and rebuild with proper paragraph structure
    const sentences = formatted.split(/(?<=[.!?])\s+/).filter(s => s.trim());
    const paragraphs: string[] = [];
    let currentParagraph = '';
    let sentenceCount = 0;

    for (const sentence of sentences) {
      const cleanSentence = sentence.trim();
      if (!cleanSentence) continue;

      if (currentParagraph) {
        currentParagraph += ' ' + cleanSentence;
      } else {
        currentParagraph = cleanSentence;
      }
      
      sentenceCount++;

      // End paragraph after 3-5 sentences or at natural breaks
      const shouldEndParagraph = 
        sentenceCount >= 3 && (
          sentenceCount >= 5 ||
          cleanSentence.includes('Here\'s how') ||
          cleanSentence.includes('The key is') ||
          cleanSentence.includes('For example') ||
          cleanSentence.includes('However,') ||
          cleanSentence.includes('Additionally,') ||
          cleanSentence.includes('In conclusion')
        );

      if (shouldEndParagraph) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = '';
        sentenceCount = 0;
      }
    }

    // Add any remaining content
    if (currentParagraph.trim()) {
      paragraphs.push(currentParagraph.trim());
    }

    const result = paragraphs.join('\n\n');
    
    console.log('✅ Content formatted for email');
    console.log('📊 Created', paragraphs.length, 'paragraphs');
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
