
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Mail, Image, FileText, TrendingUp, Play, Square } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

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
    setAutomationLogs(prev => [...prev.slice(-9), logMessage]); // Keep last 10 logs
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
    addLog('Generating blog post...');
    const blogContent = await callGeminiAPI(
      `Write a comprehensive blog post with the headline "${headline}" about the topic "${topic}". 
      
      IMPORTANT FORMATTING REQUIREMENTS:
      - DO NOT use any markdown formatting like ## or **
      - Use plain text with proper paragraph breaks
      - Structure the content with clear sections using simple text headers
      - Make it 800-1000 words
      - Include an engaging introduction
      - Have 3-4 main sections with descriptive subheadings
      - End with a compelling conclusion
      - Use a professional yet conversational tone
      - Make it ready for direct publishing on Blogger
      - Separate paragraphs with double line breaks for better readability`
    );
    
    // Clean up any remaining markdown formatting
    let cleanContent = blogContent
      .replace(/##\s*/g, '') // Remove ## headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/^\s*-\s*/gm, '• ') // Convert - to bullet points
      .trim();
    
    addLog(`Generated and cleaned blog post (${cleanContent.length} characters)`);
    return cleanContent;
  };

  const generateTopicRelevantImage = async (topic: string, headline: string) => {
    addLog('Generating topic-relevant image URL...');
    
    // Create a more specific search term based on the topic and headline
    const searchTerms = topic.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').slice(0, 2).join(',');
    const imageUrl = `https://picsum.photos/800/400?random=${Date.now()}&sig=${encodeURIComponent(searchTerms)}`;
    
    addLog(`Generated image URL for topic: ${topic}`);
    return imageUrl;
  };

  const formatForBlogger = (content: string, headline: string, topic: string, imageUrl: string) => {
    // Format content specifically for Blogger
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
      // Initialize EmailJS with your public key
      emailjs.init(emailConfig.emailjsPublicKey);

      // Format content for Blogger
      const bloggerFormattedContent = formatForBlogger(content, subject, currentBlog.topic, imageUrl);

      // Prepare email template parameters
      const templateParams = {
        to_email: emailConfig.recipientEmail,
        from_email: emailConfig.senderEmail,
        subject: subject,
        blog_content: bloggerFormattedContent,
        image_url: imageUrl,
        generated_at: new Date().toLocaleString(),
        topic: currentBlog.topic
      };

      // Send email using EmailJS
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
      // Step 1: Generate topic
      const topic = await generateTrendingTopic();
      
      // Step 2: Generate headline
      const headline = await generateHeadline(topic);
      
      // Step 3: Generate blog post
      const content = await generateBlogPost(headline, topic);
      
      // Step 4: Generate topic-relevant image URL AFTER getting content
      const imageUrl = await generateTopicRelevantImage(topic, headline);
      
      // Step 5: Update current blog
      setCurrentBlog({
        topic,
        headline,
        content,
        imageUrl
      });

      // Step 6: Send email via EmailJS with Blogger formatting
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
    addLog('Starting automated blog generation...');
    toast.success('Automation started! Blogs will be generated every 3 minutes.');

    await runSingleAutomation();

    const interval = setInterval(async () => {
      if (isAutomated) {
        await runSingleAutomation();
      }
    }, 180000);

    setAutomationInterval(interval);
  };

  const stopAutomation = () => {
    setIsAutomated(false);
    if (automationInterval) {
      clearInterval(automationInterval);
      setAutomationInterval(null);
    }
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
            Fully automated blog generation and email sending via EmailJS
          </p>
        </div>

        {/* Configuration Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-500" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Gemini API Key</label>
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  disabled={isAutomated}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>
                </p>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium">Email Configuration</label>
                <Input
                  placeholder="Recipient email"
                  value={emailConfig.recipientEmail}
                  onChange={(e) => setEmailConfig({...emailConfig, recipientEmail: e.target.value})}
                  disabled={isAutomated}
                />
                <Input
                  placeholder="Your sender email (for display)"
                  value={emailConfig.senderEmail}
                  onChange={(e) => setEmailConfig({...emailConfig, senderEmail: e.target.value})}
                  disabled={isAutomated}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">EmailJS Configuration</label>
                <Input
                  placeholder="EmailJS Service ID"
                  value={emailConfig.emailjsServiceId}
                  onChange={(e) => setEmailConfig({...emailConfig, emailjsServiceId: e.target.value})}
                  disabled={isAutomated}
                />
                <Input
                  placeholder="EmailJS Template ID"
                  value={emailConfig.emailjsTemplateId}
                  onChange={(e) => setEmailConfig({...emailConfig, emailjsTemplateId: e.target.value})}
                  disabled={isAutomated}
                />
                <Input
                  placeholder="EmailJS Public Key"
                  value={emailConfig.emailjsPublicKey}
                  onChange={(e) => setEmailConfig({...emailConfig, emailjsPublicKey: e.target.value})}
                  disabled={isAutomated}
                />
                <p className="text-xs text-gray-500">
                  Get these from your <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">EmailJS dashboard</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Control */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-6 w-6 text-green-500" />
                Automation Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                {!isAutomated ? (
                  <Button 
                    onClick={startAutomation}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    Start Full Automation
                  </Button>
                ) : (
                  <Button 
                    onClick={stopAutomation}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Automation
                  </Button>
                )}
                
                <Button 
                  onClick={runSingleAutomation}
                  disabled={loading || isAutomated}
                  variant="outline"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Run Once
                </Button>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Status: {automationStatus}</p>
                {isAutomated && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Automation running - Next cycle in ~3 minutes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Logs */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-500" />
                Automation Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
                {automationLogs.length === 0 ? (
                  <p className="text-gray-500">No logs yet. Start automation to see activity...</p>
                ) : (
                  automationLogs.map((log, index) => (
                    <div key={index} className="mb-1">{log}</div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Blog Preview */}
        {currentBlog.content && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-6 w-6 text-purple-500" />
                  Latest Generated Blog Post
                </CardTitle>
                <div className="space-y-2">
                  <Badge variant="secondary">{currentBlog.topic}</Badge>
                  <h3 className="text-lg font-semibold">{currentBlog.headline}</h3>
                </div>
              </CardHeader>
              <CardContent>
                {currentBlog.imageUrl && (
                  <div className="mb-6">
                    <img src={currentBlog.imageUrl} alt="Blog post image" className="w-full h-64 object-cover rounded-lg" />
                  </div>
                )}
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm max-h-96 overflow-y-auto">{currentBlog.content}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-800 mb-2">How to set up EmailJS:</h4>
              <ul className="text-sm text-blue-700 space-y-1 mb-4">
                <li>• Sign up at <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">emailjs.com</a></li>
                <li>• Create an email service (Gmail, Outlook, etc.)</li>
                <li>• Create an email template with variables: to_email, subject, blog_content, image_url</li>
                <li>• Get your Service ID, Template ID, and Public Key from the dashboard</li>
                <li>• Enter these details in the configuration above</li>
              </ul>
              <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Configure your Gemini API key and EmailJS settings</li>
                <li>• The system generates topics, headlines, and blog posts using AI</li>
                <li>• Emails are sent directly from the frontend using EmailJS</li>
                <li>• Full automation runs every 3 minutes when started</li>
                <li>• Monitor the logs to see real-time activity</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
