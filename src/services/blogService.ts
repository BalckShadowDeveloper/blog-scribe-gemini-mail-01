
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
    const content = await this.callGeminiAPI(
      `Write a comprehensive, engaging blog post with the headline "${headline}" about "${topic}".

      IMPORTANT: Write in proper paragraphs with clear separation. Each paragraph should be well-structured and separated by double line breaks.
      
      STRUCTURE (800-1000 words):
      
      # ${headline}
      
      Start with an engaging opening paragraph that hooks the reader about ${topic}. This should be a complete paragraph that introduces the topic and creates curiosity.
      
      ## Why This Matters Now
      
      Write a full paragraph explaining why this topic is relevant and important right now. Include specific reasons and current trends.
      
      ## The Problem Most People Don't Know About
      
      Write 2-3 separate paragraphs covering the main challenges people face with ${topic}. Each paragraph should focus on a different aspect of the problem.
      
      Make sure each paragraph is substantial and provides valuable information.
      
      ## The Solution That Actually Works
      
      Write a comprehensive paragraph introducing the solution before listing the benefits.
      
      ### Key Benefits
      
      - Benefit 1: Specific advantage with detailed explanation
      - Benefit 2: Another clear benefit with examples  
      - Benefit 3: Third important benefit with proof
      
      ### How to Get Started
      
      Write an introductory paragraph before the steps.
      
      1. **Step 1**: Clear action step with detailed instructions
      2. **Step 2**: Next specific step with examples
      3. **Step 3**: Final implementation step with tips
      
      ## Real Examples and Results
      
      Provide specific examples and case studies showing results in multiple paragraphs.
      
      Include detailed examples and statistics to support your points.
      
      > "Include a compelling quote or testimonial here to add credibility and social proof."
      
      ## Common Mistakes to Avoid
      
      Write an introduction paragraph about why avoiding mistakes is important.
      
      - **Mistake 1**: What not to do and why, with detailed explanation
      - **Mistake 2**: Another pitfall to avoid with examples
      - **Mistake 3**: Third common error with solutions
      
      ## Take Action Today
      
      End with a compelling closing paragraph that encourages immediate action and summarizes the key points.
      
      FORMATTING REQUIREMENTS:
      - Write in natural, conversational paragraphs
      - Each paragraph should be 3-5 sentences long
      - Separate each paragraph with double line breaks
      - Use the keyword "${topic}" naturally 6-8 times throughout
      - Ensure smooth transitions between sections
      - Make each section substantial and informative
      - Write complete thoughts in each paragraph`
    );

    return this.ensureProperParagraphFormatting(content);
  }

  private ensureProperParagraphFormatting(content: string): string {
    // Split content into lines
    const lines = content.split('\n');
    const formattedLines: string[] = [];
    let currentParagraph = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // If it's an empty line, skip it
      if (!line) {
        continue;
      }
      
      // If it's a header, list item, or blockquote, handle separately
      if (line.startsWith('#') || line.startsWith('-') || line.startsWith('*') || 
          line.match(/^\d+\./) || line.startsWith('>')) {
        
        // If we have a current paragraph, add it first
        if (currentParagraph.trim()) {
          formattedLines.push(currentParagraph.trim());
          formattedLines.push(''); // Add blank line after paragraph
          currentParagraph = '';
        }
        
        // Add the special line
        formattedLines.push(line);
        formattedLines.push(''); // Add blank line after special elements
        continue;
      }
      
      // Regular text - add to current paragraph
      if (currentParagraph) {
        currentParagraph += ' ' + line;
      } else {
        currentParagraph = line;
      }
      
      // Check if this might be the end of a paragraph
      // (Look for sentence endings or if the next line is special)
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const isEndOfSentence = line.endsWith('.') || line.endsWith('!') || line.endsWith('?');
      const nextIsSpecial = nextLine.startsWith('#') || nextLine.startsWith('-') || 
                           nextLine.startsWith('*') || nextLine.match(/^\d+\./) || 
                           nextLine.startsWith('>') || !nextLine;
      
      // If this looks like a complete paragraph, finalize it
      if (isEndOfSentence && (nextIsSpecial || currentParagraph.length > 200)) {
        formattedLines.push(currentParagraph.trim());
        formattedLines.push(''); // Add blank line after paragraph
        currentParagraph = '';
      }
    }
    
    // Add any remaining paragraph
    if (currentParagraph.trim()) {
      formattedLines.push(currentParagraph.trim());
    }
    
    // Clean up excessive blank lines
    const result = formattedLines.join('\n').replace(/\n{3,}/g, '\n\n');
    
    console.log('Formatted content structure:', result.substring(0, 500) + '...');
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
