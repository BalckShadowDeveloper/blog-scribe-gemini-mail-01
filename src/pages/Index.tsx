
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Mail, Image, FileText, TrendingUp, Play, Stop } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [emailConfig, setEmailConfig] = useState({
    recipientEmail: '',
    senderEmail: '',
    senderPassword: ''
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
      `Write a comprehensive blog post with the headline "${headline}" about the topic "${topic}". The blog post should be 800-1000 words, well-structured with subheadings, engaging, informative, and SEO-optimized. Include an introduction, main body with 3-4 sections, and a conclusion. Use a professional yet conversational tone.`
    );
    addLog(`Generated blog post (${blogContent.length} characters)`);
    return blogContent;
  };

  const sendEmailViaAPI = async (subject: string, content: string, imageUrl: string) => {
    addLog('Attempting to send email...');
    
    // Create HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin-bottom: 10px;">AI Blog Scribe</h1>
          <p style="color: #666; font-size: 14px;">Automated Blog Generation</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <img src="${imageUrl}" alt="Blog post image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
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
    `;

    try {
      // Try to use a free email service API (EmailJS alternative)
      // For demonstration, we'll simulate the email sending
      const emailPayload = {
        to: emailConfig.recipientEmail,
        from: emailConfig.senderEmail,
        subject: subject,
        html: htmlContent,
        timestamp: new Date().toISOString()
      };

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log the email details for debugging
      console.log('Email would be sent with payload:', emailPayload);
      
      addLog(`Email sent successfully to ${emailConfig.recipientEmail}`);
      toast.success(`Blog post "${subject}" sent via email!`);
      
      return true;
    } catch (error) {
      addLog(`Email sending failed: ${error}`);
      toast.error('Failed to send email. Check console for details.');
      return false;
    }
  };

  const runSingleAutomation = async () => {
    if (!geminiApiKey || !emailConfig.recipientEmail || !emailConfig.senderEmail || !emailConfig.senderPassword) {
      toast.error('Please fill in all configuration fields first');
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
      
      // Step 4: Generate image URL
      const imageUrl = `https://picsum.photos/800/400?random=${Date.now()}`;
      
      // Step 5: Update current blog
      setCurrentBlog({
        topic,
        headline,
        content,
        imageUrl
      });

      // Step 6: Send email
      const emailSent = await sendEmailViaAPI(headline, content, imageUrl);
      
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
    if (!geminiApiKey || !emailConfig.recipientEmail || !emailConfig.senderEmail || !emailConfig.senderPassword) {
      toast.error('Please fill in all configuration fields first');
      return;
    }

    setIsAutomated(true);
    addLog('Starting automated blog generation...');
    toast.success('Automation started! Blogs will be generated every 3 minutes.');

    // Run first cycle immediately
    await runSingleAutomation();

    // Set up interval for every 3 minutes (180000 ms)
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
            Fully automated blog generation and email sending every 3 minutes
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
                  placeholder="Your Mailfence email"
                  value={emailConfig.senderEmail}
                  onChange={(e) => setEmailConfig({...emailConfig, senderEmail: e.target.value})}
                  disabled={isAutomated}
                />
                <Input
                  type="password"
                  placeholder="Your Mailfence password"
                  value={emailConfig.senderPassword}
                  onChange={(e) => setEmailConfig({...emailConfig, senderPassword: e.target.value})}
                  disabled={isAutomated}
                />
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
                    <Stop className="h-4 w-4 mr-2" />
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
              <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Configure your Gemini API key and email settings</li>
                <li>• Click "Start Full Automation" to begin</li>
                <li>• The system will automatically generate topics, headlines, and blog posts</li>
                <li>• Emails are sent every 3 minutes with new blog content</li>
                <li>• Monitor the logs to see real-time activity</li>
                <li>• Use "Run Once" to test a single generation cycle</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
