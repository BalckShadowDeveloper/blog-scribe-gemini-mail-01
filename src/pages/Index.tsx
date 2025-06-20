import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import ConfigurationForm from '@/components/ConfigurationForm';
import AutomationControl from '@/components/AutomationControl';
import AutomationLogs from '@/components/AutomationLogs';
import BlogPostPreview from '@/components/BlogPostPreview';
import { useContentValidation } from '@/hooks/useContentValidation';
import { useRandomScheduling } from '@/hooks/useRandomScheduling';
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
    addLog('Generating trending topic...');
    const topicsText = await callGeminiAPI(
      "Generate 1 trending topic that would make an excellent blog post in 2024. Focus on technology, lifestyle, business, health, or current events. Return only the topic, 3-8 words maximum."
    );
    const topic = topicsText.trim().replace(/^\d+\.\s*/, '');
    addLog(`Generated topic: ${topic}`);
    return topic;
  };

  const generateHeadline = async (topic: string) => {
    addLog('Generating headline...');
    const headlineText = await callGeminiAPI(
      `Generate 1 engaging, clickable headline for a blog post about "${topic}". Make it attention-grabbing, SEO-friendly, and around 60 characters or less. Return only the headline.`
    );
    const headline = headlineText.trim().replace(/^\d+\.\s*/, '');
    addLog(`Generated headline: ${headline}`);
    return headline;
  };

  const generateBlogPost = async (headline: string, topic: string) => {
    addLog('Generating SEO-optimized blog post...');
    const blogContent = await callGeminiAPI(
      `Write a comprehensive, SEO-optimized blog post with the headline "${headline}" about the topic "${topic}". 
      
      CRITICAL FORMATTING REQUIREMENTS - FOLLOW EXACTLY:
      - DO NOT use ANY markdown symbols: no ##, no **, no *, no - for lists, no # symbols
      - Use ONLY plain text with proper paragraph breaks
      - For section headers, use ALL CAPS followed by a colon (e.g., "INTRODUCTION:")
      - For emphasis, use CAPITAL LETTERS instead of bold/italic
      - For lists, use numbered format (1. 2. 3.) or simple bullet points with •
      - Separate all paragraphs with double line breaks
      - NO ASTERISKS (*) AT ALL
      - NO HASH SYMBOLS (#) AT ALL
      
      SEO OPTIMIZATION REQUIREMENTS:
      - Include the main keyword "${topic}" naturally throughout the content
      - Use related keywords and synonyms
      - Write meta-description worthy opening paragraph (150-160 characters)
      - Include long-tail keywords related to ${topic}
      - Structure content for featured snippets
      - Use question-based subheadings that people search for
      
      CONTENT STRUCTURE (800-1000 words):
      - Engaging hook in first paragraph mentioning ${topic}
      - Include statistics or facts when relevant
      - 3-4 main sections answering common questions about ${topic}
      - Practical tips or actionable advice
      - Compelling conclusion with call-to-action
      - Professional yet conversational tone
      - Ready for direct publishing on Blogger platform
      
      REMEMBER: ABSOLUTELY NO MARKDOWN FORMATTING - PLAIN TEXT ONLY!`
    );
    
    addLog('Running multiple content validation passes...');
    const validatedContent = await performMultipleValidations(blogContent);
    
    addLog(`Generated and validated blog post (${validatedContent.length} characters)`);
    console.log('Content after validation preview:', validatedContent.substring(0, 200) + '...');
    
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
    const formattedContent = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${imageUrl}" alt="${headline}" style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
  </div>
  
  <div style="margin-bottom: 20px;">
    <span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #666;">${topic}</span>
  </div>
  
  <div style="font-size: 16px; line-height: 1.8;">
    ${content.replace(/\n\n/g, '</p><p style="margin: 16px 0;">').replace(/\n/g, '<br>')}
  </div>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px;">
    <p>Generated with AI Blog Scribe</p>
    <p>Published on: ${new Date().toLocaleDateString()}</p>
  </div>
</div>`;
    
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
            AI Blog Scribe - Full Automation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fully automated blog generation with random human-like scheduling and content validation
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
                <li>• 4-step content validation to eliminate ALL markdown formatting</li>
                <li>• Random scheduling: 3-4 emails per hour at human-like intervals</li>
                <li>• Real-time validation logs for transparency</li>
                <li>• Blogger-ready HTML formatting with no ** or ## symbols</li>
              </ul>
              <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Configure your Gemini API key and EmailJS settings</li>
                <li>• Content goes through 4 validation passes before sending</li>
                <li>• Random scheduling mimics human behavior patterns</li>
                <li>• Monitor validation and automation logs in real-time</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
