
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import ConfigurationForm from '@/components/ConfigurationForm';
import AutomationControl from '@/components/AutomationControl';
import AutomationLogs from '@/components/AutomationLogs';
import BlogPostPreview from '@/components/BlogPostPreview';
import { useContentValidation } from '@/hooks/useContentValidation';
import { useRandomScheduling } from '@/hooks/useRandomScheduling';
import { parseMarkdown } from '@/lib/markdownUtils';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [emailConfig, setEmailConfig] = useState({
    recipientEmail: '',
    senderEmail: '',
    senderPassword: '',
    emailjsServiceId: '',
    emailjsTemplateId: '',
    emailjsPublicKey: ''
  });
  const [isAutomated, setIsAutomated] = useState(false);
  const [automationInterval, setAutomationInterval] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentBlog, setCurrentBlog] = useState({
    topic: '',
    headline: '',
    content: '',
    imageUrl: ''
  });
  const [automationStatus, setAutomationStatus] = useState('Ready to start automation');
  const [automationLogs, setAutomationLogs] = useState<string[]>([]);

  const { performMultipleValidations, validationLogs } = useContentValidation();
  const { generateRandomSchedule, getNextScheduledTime, removeCompletedTime, clearSchedule } = useRandomScheduling();

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (automationInterval) {
        clearInterval(automationInterval);
      }
    };
  }, [automationInterval]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setAutomationLogs(prev => [...prev.slice(-9), logMessage]);
    console.log(logMessage);
  };

  const callGeminiAPI = async (prompt: string) => {
    if (!geminiApiKey) {
      throw new Error('Gemini API key is required');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
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
  };

  const generateTrendingTopic = async () => {
    addLog('Generating diverse viral trending topic...');
    
    // Rotate through different topic categories to ensure diversity
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
    
    const topicsText = await callGeminiAPI(
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
    
    const topic = topicsText.trim().replace(/^\d+\.\s*/, '').replace(/['"]/g, '');
    addLog(`Generated diverse topic: ${topic} (Category: ${randomCategory})`);
    return topic;
  };

  const generateHeadline = async (topic: string) => {
    addLog('Generating viral headline...');
    const headlineText = await callGeminiAPI(
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
    const headline = headlineText.trim().replace(/^\d+\.\s*/, '');
    addLog(`Generated viral headline: ${headline}`);
    return headline;
  };

  const generateBlogPost = async (headline: string, topic: string) => {
    addLog('Generating markdown-formatted blog post...');
    const blogContent = await callGeminiAPI(
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
    
    addLog('Running enhanced content validation...');
    const validatedContent = await performMultipleValidations(blogContent);
    
    addLog(`Generated markdown blog post (${validatedContent.length} characters)`);
    return validatedContent;
  };

  const generateTopicRelevantImage = async (topic: string, headline: string) => {
    addLog('Generating topic-specific image...');
    
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
    const imageUrl = `https://picsum.photos/800/400?random=${Date.now()}&sig=${encodeURIComponent(combinedKeywords)}`;
    
    addLog(`Generated topic-specific image with keywords: ${combinedKeywords}`);
    return imageUrl;
  };

  const formatForBlogger = (content: string, headline: string, topic: string, imageUrl: string) => {
    // Parse markdown to HTML for email
    const htmlContent = parseMarkdown(content);
    
    // Generate second image for variety
    const secondImageUrl = `https://picsum.photos/600/300?random=${Date.now() + 1000}&sig=${encodeURIComponent(topic + '-secondary')}`;
    
    // Format with enhanced styling
    const formattedContent = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #2c3e50; max-width: 800px; margin: 0 auto; padding: 20px; background: #ffffff;">
  
  <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
    <h1 style="font-size: 28px; font-weight: bold; margin: 0; line-height: 1.3;">${headline}</h1>
    <div style="margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 15px; flex-wrap: wrap;">
      <span style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">${topic}</span>
      <span style="font-size: 14px; opacity: 0.9;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
  </div>
  
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${imageUrl}" alt="${headline}" style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
  </div>
  
  <div style="font-size: 16px; line-height: 1.8;">
    ${htmlContent}
  </div>
  
  <div style="text-align: center; margin: 40px 0;">
    <img src="${secondImageUrl}" alt="Supporting visual for ${topic}" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,0.1);">
  </div>
  
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center;">
    <p style="color: white; font-size: 16px; font-weight: 500; margin: 0;">💡 Found this helpful? Share it with your friends and let us know what you think!</p>
  </div>
  
</div>

<style>
  h1, h2, h3, h4, h5, h6 { color: #2c3e50; margin-top: 30px; margin-bottom: 15px; font-weight: bold; }
  h1 { font-size: 28px; color: #6b46c1; border-bottom: 3px solid #6b46c1; padding-bottom: 10px; }
  h2 { font-size: 24px; color: #3b82f6; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
  h3 { font-size: 20px; color: #4f46e5; }
  p { margin: 15px 0; text-align: justify; }
  strong { color: #1f2937; font-weight: 600; }
  em { color: #6b46c1; font-style: italic; }
  ul, ol { margin: 15px 0; padding-left: 25px; }
  li { margin: 8px 0; }
  blockquote { 
    border-left: 4px solid #6b46c1; 
    background: #f8fafc; 
    padding: 15px 20px; 
    margin: 20px 0; 
    font-style: italic; 
    color: #4c1d95;
    border-radius: 0 8px 8px 0;
  }
  code { 
    background: #f1f5f9; 
    color: #6b46c1; 
    padding: 2px 6px; 
    border-radius: 4px; 
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 14px;
  }
  pre { 
    background: #1e293b; 
    color: #e2e8f0; 
    padding: 20px; 
    border-radius: 8px; 
    overflow-x: auto; 
    margin: 20px 0;
  }
  a { color: #3b82f6; text-decoration: none; }
  a:hover { text-decoration: underline; color: #1d4ed8; }
</style>`;
    
    return formattedContent;
  };

  const sendEmailViaEmailJS = async (subject: string, content: string, imageUrl: string) => {
    addLog('Sending email via EmailJS...');
    
    if (!emailConfig.emailjsServiceId || !emailConfig.emailjsTemplateId || !emailConfig.emailjsPublicKey) {
      throw new Error('EmailJS configuration is incomplete');
    }

    try {
      emailjs.init(emailConfig.emailjsPublicKey);

      const bloggerFormattedContent = formatForBlogger(content, subject, currentBlog.topic, imageUrl);

      const templateParams = {
        to_email: emailConfig.recipientEmail,
        from_email: emailConfig.senderEmail,
        subject: subject,
        blog_content: bloggerFormattedContent,
        image_url: imageUrl,
        generated_at: new Date().toLocaleString(),
        topic: currentBlog.topic
      };

      const response = await emailjs.send(
        emailConfig.emailjsServiceId,
        emailConfig.emailjsTemplateId,
        templateParams
      );

      if (response.status === 200) {
        addLog(`Email sent successfully to ${emailConfig.recipientEmail}`);
        toast.success(`Blog post "${subject}" sent via email!`);
        return true;
      } else {
        throw new Error(`EmailJS returned status: ${response.status}`);
      }
    } catch (error) {
      addLog(`Email sending failed: ${error}`);
      toast.error('Failed to send email. Check EmailJS configuration and console for details.');
      console.error('EmailJS Error:', error);
      return false;
    }
  };

  const runSingleAutomation = async () => {
    if (!geminiApiKey || !emailConfig.recipientEmail || !emailConfig.emailjsServiceId || !emailConfig.emailjsTemplateId || !emailConfig.emailjsPublicKey) {
      toast.error('Please fill in all configuration fields including EmailJS settings');
      return false;
    }

    setLoading(true);
    setAutomationStatus('Running automation cycle...');

    try {
      const topic = await generateTrendingTopic();
      const headline = await generateHeadline(topic);
      const content = await generateBlogPost(headline, topic);
      const imageUrl = await generateTopicRelevantImage(topic, headline);
      
      setCurrentBlog({
        topic,
        headline,
        content,
        imageUrl
      });

      const emailSent = await sendEmailViaEmailJS(headline, content, imageUrl);
      
      if (emailSent) {
        setAutomationStatus('Automation cycle completed successfully');
        addLog('--- Automation cycle completed ---');
        return true;
      } else {
        setAutomationStatus('Automation cycle completed with email error');
        return false;
      }
      
    } catch (error) {
      console.error('Automation error:', error);
      addLog(`Automation failed: ${error}`);
      setAutomationStatus('Automation cycle failed');
      toast.error('Automation failed. Check logs for details.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const startAutomation = async () => {
    if (!geminiApiKey || !emailConfig.recipientEmail || !emailConfig.emailjsServiceId || !emailConfig.emailjsTemplateId || !emailConfig.emailjsPublicKey) {
      toast.error('Please fill in all configuration fields including EmailJS settings');
      return;
    }

    setIsAutomated(true);
    addLog('Starting automated blog generation with random scheduling...');
    
    // Generate random schedule for the hour
    const schedule = generateRandomSchedule();
    toast.success(`Automation started! ${schedule.length} emails scheduled randomly over the next hour.`);

    // Run first automation immediately
    await runSingleAutomation();

    // Set up interval to check for scheduled times
    const interval = setInterval(async () => {
      if (!isAutomated) return;
      
      const nextTime = getNextScheduledTime();
      if (nextTime && Date.now() >= nextTime) {
        addLog('Executing scheduled automation...');
        await runSingleAutomation();
        removeCompletedTime();
        
        // If no more scheduled times, generate new schedule
        if (getNextScheduledTime() === null) {
          const newSchedule = generateRandomSchedule();
          addLog(`Generated new random schedule: ${newSchedule.length} emails over next hour`);
        }
      }
    }, 30000); // Check every 30 seconds

    setAutomationInterval(interval);
  };

  const stopAutomation = () => {
    setIsAutomated(false);
    if (automationInterval) {
      clearInterval(automationInterval);
      setAutomationInterval(null);
    }
    clearSchedule();
    setAutomationStatus('Automation stopped');
    addLog('Automation stopped by user');
    toast.info('Automation stopped');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Blog Scribe - Viral Content Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate diverse viral blog posts across all trending niches with professional formatting
          </p>
        </div>

        {/* Configuration Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <ConfigurationForm
            geminiApiKey={geminiApiKey}
            setGeminiApiKey={setGeminiApiKey}
            emailConfig={emailConfig}
            setEmailConfig={setEmailConfig}
            isAutomated={isAutomated}
          />
        </div>

        {/* Automation Control */}
        <div className="max-w-2xl mx-auto mb-8">
          <AutomationControl
            isAutomated={isAutomated}
            loading={loading}
            automationStatus={automationStatus}
            startAutomation={startAutomation}
            stopAutomation={stopAutomation}
            runSingleAutomation={runSingleAutomation}
          />
        </div>

        {/* Automation Logs */}
        <div className="max-w-2xl mx-auto mb-8">
          <AutomationLogs automationLogs={[...automationLogs, ...validationLogs]} />
        </div>

        {/* Current Blog Preview */}
        <div className="max-w-4xl mx-auto mb-8">
          <BlogPostPreview currentBlog={currentBlog} />
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Enhanced Features:</h4>
              <ul className="text-sm text-blue-700 space-y-1 mb-4">
                <li>• Professional formatting - NO ALL CAPS headers</li>
                <li>• Diverse topic generation across 15+ niches</li>
                <li>• Natural article flow without section labels</li>
                <li>• Viral headline generation using proven formulas</li>
                <li>• Complete markdown removal for clean output</li>
              </ul>
              <h4 className="font-semibold text-blue-800 mb-2">Topic Categories:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Health, Fitness & Wellness • Money & Investing</li>
                <li>• Productivity & Life Hacks • Sustainable Living</li>
                <li>• Personal Development • Social Media Marketing</li>
                <li>• Technology & Innovation • Career & Business</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
