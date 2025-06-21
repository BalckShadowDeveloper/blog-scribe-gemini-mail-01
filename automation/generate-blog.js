
const axios = require('axios');
const nodemailer = require('nodemailer');

// Configuration from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;

if (!GEMINI_API_KEY || !GMAIL_EMAIL || !GMAIL_APP_PASSWORD || !RECIPIENT_EMAIL) {
  console.error('Missing required environment variables');
  console.error('Required: GEMINI_API_KEY, GMAIL_EMAIL, GMAIL_APP_PASSWORD, RECIPIENT_EMAIL');
  process.exit(1);
}

// Create Gmail transporter - FIXED: changed from createTransporter to createTransport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true,
  logger: true
});

// Function to verify SMTP connection
async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('Gmail SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('Gmail SMTP connection verification failed:', error);
    return false;
  }
}

// Function to call Gemini API
async function callGeminiAPI(prompt) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error.response?.data || error.message);
    throw error;
  }
}

// Function to generate diverse viral topics
async function generateViralTopics() {
  console.log('Generating diverse viral trending topics...');
  
  // Diverse topic categories to ensure variety
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
  console.log(`Selected category: ${randomCategory}`);
  
  const prompt = `Generate 3 VIRAL trending topics specifically about "${randomCategory}". 
  
  IMPORTANT RULES:
  - Do NOT mention AI, artificial intelligence, or machine learning
  - Focus specifically on: ${randomCategory}
  - Each topic should be 4-8 words maximum
  - Make them clickbait-worthy and trending on social media
  - Topics should be something people actively search for in 2024
  
  Examples of good diverse topics:
  - "Intermittent Fasting Weight Loss Hack"
  - "Passive Income Real Estate Strategy" 
  - "Morning Routine Productivity Boost"
  - "Zero Waste Lifestyle Benefits"
  - "Mediterranean Diet Heart Health"
  - "Side Hustle Dropshipping Success"
  
  Return only the topics as a numbered list, no explanations.`;
  
  const response = await callGeminiAPI(prompt);
  const topics = response.split('\n')
    .filter(topic => topic.trim())
    .map(topic => topic.replace(/^\d+\.\s*/, '').trim().replace(/['"]/g, ''));
  
  console.log('Generated diverse topics:', topics);
  return topics;
}

// Function to generate viral headlines
async function generateViralHeadlines(topic) {
  console.log(`Generating viral headlines for topic: ${topic}`);
  const prompt = `Generate 3 VIRAL, clickbait headlines for a blog post about "${topic}". 
  
  Use these PROVEN viral headline formulas:
  - "This [Topic] Trick Will Change Your Life in 30 Days"
  - "Why Everyone is Talking About [Topic] (And You Should Too)"
  - "The [Topic] Secret That [Experts/Celebrities] Don't Want You to Know"
  - "I Tried [Topic] for 30 Days - Here's What Happened"
  - "[Number] [Topic] Hacks That Will Blow Your Mind"
  - "The Shocking Truth About [Topic] That Nobody Talks About"
  
  Make them:
  - Under 60 characters for SEO
  - Include power words: Secret, Shocking, Ultimate, Proven, Exclusive
  - Create curiosity gap
  - Promise transformation or revelation
  
  Return only the headlines as a numbered list.`;
  
  const response = await callGeminiAPI(prompt);
  const headlines = response.split('\n')
    .filter(headline => headline.trim())
    .map(headline => headline.replace(/^\d+\.\s*/, '').trim().replace(/['"]/g, ''));
  
  return headlines;
}

// Function to generate professionally formatted viral blog post
async function generateViralBlogPost(headline, topic) {
  console.log(`Generating professionally formatted blog post for: ${headline}`);
  const prompt = `Write a VIRAL, comprehensive blog post with the headline "${headline}" about "${topic}".
  
  CRITICAL FORMATTING REQUIREMENTS:
  - NO markdown symbols (# * _ \` ~) AT ALL
  - Use natural paragraph breaks and proper sentence flow
  - Write section headers as normal sentences, not ALL CAPS
  - Use conversational, engaging tone throughout
  - NO "INTRODUCTION:" or "CONCLUSION:" labels
  - Make it flow like a natural article
  
  STRUCTURE (1000-1200 words):
  
  Start with a compelling hook about ${topic} that grabs attention immediately.
  
  Then naturally flow into explaining why this matters now and why people need to know about ${topic}.
  
  Create 4-5 natural sections that cover:
  - The surprising truth most people don't know
  - Why conventional wisdom is wrong
  - The proven method that actually works
  - Real examples and success stories
  - Common mistakes to avoid
  
  Include throughout:
  - Exact keyword "${topic}" 8-12 times naturally
  - Specific statistics and data points
  - Personal stories or case studies
  - Actionable steps readers can take
  - Controversial or contrarian viewpoints
  
  End with a strong call-to-action encouraging engagement.
  
  Write in a natural, conversational style. NO section labels or ALL CAPS headers.
  Make every paragraph flow naturally into the next.`;
  
  const response = await callGeminiAPI(prompt);
  
  // AGGRESSIVE formatting cleanup - remove ALL markdown and ALL CAPS sections
  let cleanContent = response
    // Remove ALL hash symbols and everything after them on the same line
    .replace(/#{1,6}.*$/gm, '')
    // Remove numbered headers like "### 1. Title"
    .replace(/#{1,6}\s*\d+\.\s*.*$/gm, '')
    // Remove any remaining hash symbols
    .replace(/#/g, '')
    // Remove all asterisk formatting
    .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')
    .replace(/\*/g, '')
    // Remove ALL CAPS section headers like "INTRODUCTION:", "CONCLUSION:", etc.
    .replace(/^[A-Z\s]+:\s*/gm, '')
    // Remove common ALL CAPS words at start of paragraphs
    .replace(/^(INTRODUCTION|CONCLUSION|PROBLEM|SOLUTION|THE TRUTH|SECRET|METHOD):\s*/gm, '')
    // Remove any remaining markdown
    .replace(/`([^`]+)`/g, '$1')
    .replace(/_{2,}(.*?)_{2,}/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    // Clean up extra spaces and line breaks
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // Additional pass to ensure no markdown or formatting survives
  cleanContent = cleanContent
    .split('\n')
    .map(line => line.replace(/^[#*-+]\s*/, '').trim())
    .filter(line => line.length > 0)
    .join('\n\n');
  
  console.log('Content professionally formatted and cleaned');
  return cleanContent;
}

// Function to send email with improved formatting
async function sendEmail(subject, content, topic) {
  console.log('Verifying Gmail SMTP connection...');
  
  const connectionValid = await verifyConnection();
  if (!connectionValid) {
    throw new Error('Gmail SMTP connection failed');
  }
  
  console.log('Sending professionally formatted email via Gmail...');
  console.log('From:', GMAIL_EMAIL);
  console.log('To:', RECIPIENT_EMAIL);
  console.log('Subject:', subject);
  
  const imageUrl = `https://picsum.photos/800/400?random=${Date.now()}`;
  const secondImageUrl = `https://picsum.photos/600/300?random=${Date.now() + 1000}`;
  
  const mailOptions = {
    from: GMAIL_EMAIL,
    to: RECIPIENT_EMAIL,
    subject: subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #2c3e50; max-width: 800px; margin: 0 auto; padding: 20px;">
        
        <h1 style="font-size: 32px; font-weight: bold; color: #1a202c; margin-bottom: 10px; line-height: 1.2;">${subject}</h1>
        
        <div style="margin-bottom: 25px;">
          <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">${topic}</span>
          <span style="margin-left: 15px; color: #718096; font-size: 14px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${imageUrl}" alt="${subject}" style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);" title="${subject}">
        </div>
        
        <div style="font-size: 17px; line-height: 1.8; color: #2d3748;">
          ${content.split('\n\n').map(paragraph => 
            `<p style="margin: 20px 0; text-align: justify;">${paragraph.replace(/\n/g, '<br>')}</p>`
          ).join('')}
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <img src="${secondImageUrl}" alt="Supporting visual for ${topic}" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,0.1);" title="Learn more about ${topic}">
        </div>
        
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center;">
          <p style="color: white; font-size: 16px; font-weight: 500; margin: 0;">💡 Found this helpful? Share it with your friends and let us know what you think in the comments!</p>
        </div>
        
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Professionally formatted email sent successfully via Gmail!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return true;
  } catch (error) {
    console.error('Detailed error sending email via Gmail:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw error;
  }
}

// Main automation function with diversity focus
async function runViralAutomation() {
  try {
    console.log('Starting AI Blog Scribe DIVERSE viral automation...');
    console.log('Timestamp:', new Date().toISOString());
    
    // Step 1: Generate diverse viral trending topics
    const topics = await generateViralTopics();
    console.log('Generated diverse viral topics:', topics);
    
    if (topics.length === 0) {
      throw new Error('No diverse viral topics generated');
    }
    
    // Step 2: Select first topic and generate viral headlines
    const selectedTopic = topics[0];
    const headlines = await generateViralHeadlines(selectedTopic);
    console.log('Generated viral headlines:', headlines);
    
    if (headlines.length === 0) {
      throw new Error('No viral headlines generated');
    }
    
    // Step 3: Select first headline and generate professionally formatted blog post
    const selectedHeadline = headlines[0];
    const blogPost = await generateViralBlogPost(selectedHeadline, selectedTopic);
    console.log('Generated professionally formatted blog post length:', blogPost.length, 'characters');
    console.log('First 200 chars preview:', blogPost.substring(0, 200));
    
    // Step 4: Send professionally formatted email
    await sendEmail(selectedHeadline, blogPost, selectedTopic);
    
    console.log('DIVERSE viral automation completed successfully!');
    console.log('Topic Category: DIVERSE (not AI-focused)');
    console.log('Topic:', selectedTopic);
    console.log('Headline:', selectedHeadline);
    console.log('Sent to:', RECIPIENT_EMAIL);
    
  } catch (error) {
    console.error('Diverse viral automation failed:', error);
    process.exit(1);
  }
}

// Run the diverse viral automation
runViralAutomation();
