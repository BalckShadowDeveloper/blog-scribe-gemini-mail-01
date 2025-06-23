
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

      CRITICAL FORMATTING REQUIREMENTS:
      - Write each paragraph as a complete block of text on its own line
      - Separate each paragraph with EXACTLY ONE blank line
      - Each paragraph should be 3-5 sentences long
      - Never break sentences across multiple lines within a paragraph
      
      STRUCTURE (800-1000 words):
      
      # ${headline}
      
      Write an engaging opening paragraph that hooks the reader about ${topic}. This should be a complete paragraph that introduces the topic and creates curiosity. Make this paragraph 4-5 sentences long and write it as one continuous block of text.
      
      ## Why This Matters Now
      
      Write a full paragraph explaining why this topic is relevant and important right now. Include specific reasons and current trends. Make this 3-4 sentences as one block.
      
      ## The Problem Most People Don't Know About
      
      Write a comprehensive paragraph covering the main challenges people face with ${topic}. Focus on the primary issue that most people encounter. Write this as 4-5 sentences in one block.
      
      Write another paragraph covering additional challenges and obstacles. This should be 3-4 sentences discussing secondary problems people face.
      
      Write a third paragraph explaining why these problems persist and what makes them difficult to solve. Keep this 3-4 sentences in one block.
      
      ## The Solution That Actually Works
      
      Write a comprehensive paragraph introducing the solution and explaining why it's effective. This should be 4-5 sentences that build excitement about the approach.
      
      ### Key Benefits
      
      Write an introductory paragraph about the benefits before listing them. This should be 2-3 sentences.
      
      - Benefit 1: Specific advantage with detailed explanation in 1-2 sentences
      - Benefit 2: Another clear benefit with examples in 1-2 sentences
      - Benefit 3: Third important benefit with proof in 1-2 sentences
      
      ### How to Get Started
      
      Write an introductory paragraph before the steps. This should be 3-4 sentences explaining the process.
      
      1. **Step 1**: Clear action step with detailed instructions (2-3 sentences)
      2. **Step 2**: Next specific step with examples (2-3 sentences)
      3. **Step 3**: Final implementation step with tips (2-3 sentences)
      
      ## Real Examples and Results
      
      Write a paragraph introducing the examples section. This should be 3-4 sentences explaining why examples are important.
      
      Write another paragraph providing specific examples and case studies. Include detailed examples and statistics to support your points. Make this 4-5 sentences.
      
      > "Include a compelling quote or testimonial here to add credibility and social proof. Make this 1-2 sentences that sound authentic."
      
      Write a final paragraph in this section summarizing the results and their significance. This should be 3-4 sentences.
      
      ## Common Mistakes to Avoid
      
      Write an introduction paragraph about why avoiding mistakes is important. This should be 3-4 sentences.
      
      - **Mistake 1**: What not to do and why, with detailed explanation (2-3 sentences)
      - **Mistake 2**: Another pitfall to avoid with examples (2-3 sentences)
      - **Mistake 3**: Third common error with solutions (2-3 sentences)
      
      ## Take Action Today
      
      End with a compelling closing paragraph that encourages immediate action and summarizes the key points. This should be 4-5 sentences that motivate the reader to start.
      
      FINAL FORMATTING CHECK:
      - Each paragraph should be written as one continuous block of text
      - Separate each paragraph with exactly one blank line
      - Never break sentences within a paragraph
      - Use the keyword "${topic}" naturally 6-8 times throughout
      - Ensure each paragraph flows naturally into the next`
    );

    return this.ensureProperParagraphFormatting(content);
  }

  private ensureProperParagraphFormatting(content: string): string {
    console.log('🔧 Starting paragraph formatting process...');
    console.log('📝 Original content length:', content.length);
    
    // Step 1: Normalize line endings and clean up
    let cleanedContent = content
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/ +/g, ' ');
    
    console.log('✅ Step 1: Normalized line endings');
    
    // Step 2: Split into lines for processing
    const lines = cleanedContent.split('\n');
    const processedLines: string[] = [];
    let currentParagraph = '';
    let insideCodeBlock = false;
    
    console.log('📊 Processing', lines.length, 'lines');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Handle code blocks
      if (line.startsWith('```')) {
        insideCodeBlock = !insideCodeBlock;
        if (currentParagraph.trim()) {
          processedLines.push(currentParagraph.trim());
          processedLines.push('');
          currentParagraph = '';
        }
        processedLines.push(line);
        processedLines.push('');
        continue;
      }
      
      if (insideCodeBlock) {
        processedLines.push(line);
        continue;
      }
      
      // Skip empty lines
      if (!line) {
        continue;
      }
      
      // Handle special elements (headers, lists, blockquotes)
      if (line.startsWith('#') || 
          line.startsWith('-') || 
          line.startsWith('*') || 
          line.match(/^\d+\./) || 
          line.startsWith('>')) {
        
        // Finalize current paragraph if exists
        if (currentParagraph.trim()) {
          processedLines.push(currentParagraph.trim());
          processedLines.push('');
          currentParagraph = '';
        }
        
        // Add special element
        processedLines.push(line);
        processedLines.push('');
        continue;
      }
      
      // Regular text - add to current paragraph
      if (currentParagraph) {
        currentParagraph += ' ' + line;
      } else {
        currentParagraph = line;
      }
      
      // Check if we should finalize this paragraph
      const isEndOfSentence = line.endsWith('.') || line.endsWith('!') || line.endsWith('?') || line.endsWith('"');
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const nextIsSpecial = nextLine.startsWith('#') || nextLine.startsWith('-') || 
                           nextLine.startsWith('*') || nextLine.match(/^\d+\./) || 
                           nextLine.startsWith('>') || !nextLine;
      
      // Finalize paragraph if it's a natural break point
      if (isEndOfSentence && (nextIsSpecial || currentParagraph.length > 300)) {
        processedLines.push(currentParagraph.trim());
        processedLines.push('');
        currentParagraph = '';
      }
    }
    
    // Add any remaining paragraph
    if (currentParagraph.trim()) {
      processedLines.push(currentParagraph.trim());
    }
    
    // Step 3: Clean up excessive blank lines
    const result = processedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    
    console.log('✅ Step 2: Processed all lines');
    console.log('📄 Final formatted content length:', result.length);
    console.log('🔍 Content preview:', result.substring(0, 400) + '...');
    
    // Step 4: Validate paragraph structure
    const paragraphs = result.split('\n\n').filter(p => p.trim());
    console.log('📋 Total paragraphs/sections:', paragraphs.length);
    
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
