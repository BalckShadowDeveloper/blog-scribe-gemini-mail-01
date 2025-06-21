
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

// Create Gmail transporter
const transporter = nodemailer.createTransporter({
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

// Function to generate viral trending topics
async function generateViralTopics() {
  console.log('Generating viral trending topics...');
  const prompt = `Generate 3 VIRAL trending topics that would make excellent blog posts in 2024. Focus on these high-engagement niches:
  - AI and Technology breakthroughs 
  - Health and wellness trends
  - Money making and side hustles
  - Productivity and life hacks
  - Social media and digital marketing
  - Sustainable living and eco-friendly tips
  - Personal development and mindset
  - Current events with controversy
  
  Make them CLICKBAIT-WORTHY and trending on social media. Return only the topics as a numbered list, each topic should be 4-8 words.`;
  
  const response = await callGeminiAPI(prompt);
  const topics = response.split('\n')
    .filter(topic => topic.trim())
    .map(topic => topic.replace(/^\d+\.\s*/, '').trim());
  
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
    .map(headline => headline.replace(/^\d+\.\s*/, '').trim());
  
  return headlines;
}

// Function to generate viral blog post
async function generateViralBlogPost(headline, topic) {
  console.log(`Generating viral blog post for headline: ${headline}`);
  const prompt = `Write a VIRAL, comprehensive blog post with the headline "${headline}" about "${topic}".
  
  CRITICAL FORMATTING - NO MARKDOWN ALLOWED:
  - DO NOT use ### ## # symbols AT ALL
  - DO NOT use ** or * for bold/italic
  - DO NOT use - or * for lists
  - Use ONLY plain text with proper spacing
  - For headers: Use ALL CAPS followed by colon (INTRODUCTION:)
  - For emphasis: Use CAPITAL LETTERS
  - For lists: Use numbers (1. 2. 3.) or bullet points (•)
  - Double line breaks between paragraphs
  
  VIRAL SEO STRUCTURE (1000-1200 words):
  
  HOOK OPENING: Start with shocking statistic or controversial statement about ${topic}
  
  PROBLEM IDENTIFICATION: Explain why this matters NOW and why people are searching for this
  
  MAIN SECTIONS (use varied section headers):
  - THE SHOCKING TRUTH ABOUT [subtopic]:
  - WHY EXPERTS ARE WRONG ABOUT [subtopic]:
  - THE SECRET METHOD THAT WORKS:
  - REAL RESULTS FROM REAL PEOPLE:
  - COMMON MISTAKES TO AVOID:
  
  Include throughout:
  - Exact keyword "${topic}" 8-12 times naturally
  - Related long-tail keywords
  - Questions people actually search for
  - Statistics and data points
  - Personal stories or case studies
  - Controversy or contrarian viewpoints
  - Practical action steps
  - Social proof and testimonials
  
  CONCLUSION: Strong call-to-action encouraging sharing and engagement
  
  Write in conversational, engaging tone. Make it shareable and comment-worthy.
  REMEMBER: ABSOLUTELY NO # OR * SYMBOLS - PLAIN TEXT ONLY!`;
  
  const response = await callGeminiAPI(prompt);
  
  // AGGRESSIVE markdown removal
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
    // Remove any remaining markdown
    .replace(/`([^`]+)`/g, '$1')
    .replace(/_{2,}(.*?)_{2,}/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    // Clean up extra spaces and line breaks
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // Additional pass to ensure no markdown survives
  cleanContent = cleanContent
    .split('\n')
    .map(line => line.replace(/^[#*-+]\s*/, '').trim())
    .filter(line => line.length > 0)
    .join('\n\n');
  
  console.log('Content cleaned of ALL markdown symbols');
  return cleanContent;
}

// Function to send email with improved formatting
async function sendEmail(subject, content, topic) {
  console.log('Verifying Gmail SMTP connection...');
  
  const connectionValid = await verifyConnection();
  if (!connectionValid) {
    throw new Error('Gmail SMTP connection failed');
  }
  
  console.log('Sending viral email via Gmail...');
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
    console.log('Viral email sent successfully via Gmail!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return true;
  } catch (error) {
    console.error('Detailed error sending viral email via Gmail:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw error;
  }
}

// Main viral automation function
async function runViralAutomation() {
  try {
    console.log('Starting AI Blog Scribe VIRAL automation...');
    console.log('Timestamp:', new Date().toISOString());
    
    // Step 1: Generate viral trending topics
    const topics = await generateViralTopics();
    console.log('Generated viral topics:', topics);
    
    if (topics.length === 0) {
      throw new Error('No viral topics generated');
    }
    
    // Step 2: Select first topic and generate viral headlines
    const selectedTopic = topics[0];
    const headlines = await generateViralHeadlines(selectedTopic);
    console.log('Generated viral headlines:', headlines);
    
    if (headlines.length === 0) {
      throw new Error('No viral headlines generated');
    }
    
    // Step 3: Select first headline and generate viral blog post
    const selectedHeadline = headlines[0];
    const blogPost = await generateViralBlogPost(selectedHeadline, selectedTopic);
    console.log('Generated viral blog post length:', blogPost.length, 'characters');
    console.log('First 200 chars preview:', blogPost.substring(0, 200));
    
    // Step 4: Send viral email
    await sendEmail(selectedHeadline, blogPost, selectedTopic);
    
    console.log('VIRAL automation completed successfully!');
    console.log('Topic:', selectedTopic);
    console.log('Headline:', selectedHeadline);
    console.log('Sent to:', RECIPIENT_EMAIL);
    
  } catch (error) {
    console.error('Viral automation failed:', error);
    process.exit(1);
  }
}

// Run the viral automation
runViralAutomation();
