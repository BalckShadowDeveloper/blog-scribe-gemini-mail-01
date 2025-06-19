const axios = require('axios');
const nodemailer = require('nodemailer');

// Configuration from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MAILFENCE_EMAIL = process.env.MAILFENCE_EMAIL;
const MAILFENCE_PASSWORD = process.env.MAILFENCE_PASSWORD;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;

if (!GEMINI_API_KEY || !MAILFENCE_EMAIL || !MAILFENCE_PASSWORD || !RECIPIENT_EMAIL) {
  console.error('Missing required environment variables');
  console.error('Required: GEMINI_API_KEY, MAILFENCE_EMAIL, MAILFENCE_PASSWORD, RECIPIENT_EMAIL');
  process.exit(1);
}

// Create Mailfence transporter with correct method name
const transporter = nodemailer.createTransport({
  host: 'smtp.mailfence.com',
  port: 465,
  secure: true,
  auth: {
    user: MAILFENCE_EMAIL,
    pass: MAILFENCE_PASSWORD,
  },
  // Add additional options for better reliability
  tls: {
    rejectUnauthorized: false
  },
  debug: true, // Enable debug logging
  logger: true // Enable logging
});

// Function to verify SMTP connection
async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
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

// Function to generate trending topics
async function generateTrendingTopics() {
  console.log('Generating trending topics...');
  const prompt = "Generate 5 trending topics that would make excellent blog posts in 2024. Focus on technology, lifestyle, business, health, or current events. Return only the topics as a numbered list, each topic should be 3-8 words.";
  
  const response = await callGeminiAPI(prompt);
  const topics = response.split('\n')
    .filter(topic => topic.trim())
    .map(topic => topic.replace(/^\d+\.\s*/, '').trim());
  
  return topics;
}

// Function to generate headlines for a topic
async function generateHeadlines(topic) {
  console.log(`Generating headlines for topic: ${topic}`);
  const prompt = `Generate 5 engaging, clickable headlines for a blog post about "${topic}". Make them attention-grabbing, SEO-friendly, and around 60 characters or less. Return only the headlines as a numbered list.`;
  
  const response = await callGeminiAPI(prompt);
  const headlines = response.split('\n')
    .filter(headline => headline.trim())
    .map(headline => headline.replace(/^\d+\.\s*/, '').trim());
  
  return headlines;
}

// Function to generate blog post
async function generateBlogPost(headline, topic) {
  console.log(`Generating blog post for headline: ${headline}`);
  const prompt = `Write a comprehensive blog post with the headline "${headline}" about the topic "${topic}". The blog post should be 1000-1200 words, well-structured with subheadings, engaging, informative, and SEO-optimized. Include an introduction, main body with 3-4 sections, and a conclusion. Use a professional yet conversational tone.`;
  
  const response = await callGeminiAPI(prompt);
  return response;
}

// Function to send email with improved error handling
async function sendEmail(subject, content) {
  console.log('Verifying SMTP connection...');
  
  const connectionValid = await verifyConnection();
  if (!connectionValid) {
    throw new Error('SMTP connection failed');
  }
  
  console.log('Sending email...');
  console.log('From:', MAILFENCE_EMAIL);
  console.log('To:', RECIPIENT_EMAIL);
  console.log('Subject:', subject);
  
  const mailOptions = {
    from: MAILFENCE_EMAIL,
    to: RECIPIENT_EMAIL,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin-bottom: 10px;">AI Blog Scribe</h1>
          <p style="color: #666; font-size: 14px;">Automated Blog Generation</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <img src="https://picsum.photos/800/400?random=${Date.now()}" alt="Blog post image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
        </div>
        
        <div style="line-height: 1.6; color: #333;">
          ${content.replace(/\n/g, '<br>')}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px;">
          <p>Generated automatically by AI Blog Scribe</p>
          <p>Powered by Google Gemini AI</p>
          <p>Generated at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return true;
  } catch (error) {
    console.error('Detailed error sending email:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw error;
  }
}

// Main automation function
async function runAutomation() {
  try {
    console.log('Starting AI Blog Scribe automation...');
    console.log('Timestamp:', new Date().toISOString());
    
    // Step 1: Generate trending topics
    const topics = await generateTrendingTopics();
    console.log('Generated topics:', topics);
    
    if (topics.length === 0) {
      throw new Error('No topics generated');
    }
    
    // Step 2: Select first topic and generate headlines
    const selectedTopic = topics[0];
    const headlines = await generateHeadlines(selectedTopic);
    console.log('Generated headlines:', headlines);
    
    if (headlines.length === 0) {
      throw new Error('No headlines generated');
    }
    
    // Step 3: Select first headline and generate blog post
    const selectedHeadline = headlines[0];
    const blogPost = await generateBlogPost(selectedHeadline, selectedTopic);
    console.log('Generated blog post length:', blogPost.length, 'characters');
    
    // Step 4: Send email
    await sendEmail(selectedHeadline, blogPost);
    
    console.log('Automation completed successfully!');
    console.log('Topic:', selectedTopic);
    console.log('Headline:', selectedHeadline);
    console.log('Sent to:', RECIPIENT_EMAIL);
    
  } catch (error) {
    console.error('Automation failed:', error);
    process.exit(1);
  }
}

// Run the automation
runAutomation();
