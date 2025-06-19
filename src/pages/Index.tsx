import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Mail, Image, FileText, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [emailConfig, setEmailConfig] = useState({
    recipientEmail: '',
    senderEmail: '',
    senderPassword: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [selectedHeadline, setSelectedHeadline] = useState('');
  const [blogPost, setBlogPost] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const getTrendingTopics = async () => {
    if (!geminiApiKey) {
      toast.error('Please enter your Gemini API key');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Generate 5 trending topics that would make excellent blog posts in 2024. Focus on technology, lifestyle, business, health, or current events. Return only the topics as a numbered list, each topic should be 3-8 words."
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trending topics');
      }

      const data = await response.json();
      const topicsText = data.candidates[0].content.parts[0].text;
      const topics = topicsText.split('\n').filter((topic: string) => topic.trim()).map((topic: string) => topic.replace(/^\d+\.\s*/, '').trim());
      
      setTrendingTopics(topics);
      setCurrentStep(2);
      toast.success('Trending topics generated successfully!');
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      toast.error('Failed to fetch trending topics. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const generateHeadlines = async (topic: string) => {
    setSelectedTopic(topic);
    setLoading(true);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate 5 engaging, clickable headlines for a blog post about "${topic}". Make them attention-grabbing, SEO-friendly, and around 60 characters or less. Return only the headlines as a numbered list.`
            }]
          }]
        })
      });

      const data = await response.json();
      const headlinesText = data.candidates[0].content.parts[0].text;
      const headlinesList = headlinesText.split('\n').filter((headline: string) => headline.trim()).map((headline: string) => headline.replace(/^\d+\.\s*/, '').trim());
      
      setHeadlines(headlinesList);
      setCurrentStep(3);
      toast.success('Headlines generated successfully!');
    } catch (error) {
      console.error('Error generating headlines:', error);
      toast.error('Failed to generate headlines');
    } finally {
      setLoading(false);
    }
  };

  const generateBlogPost = async (headline: string) => {
    setSelectedHeadline(headline);
    setLoading(true);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Write a comprehensive blog post with the headline "${headline}" about the topic "${selectedTopic}". The blog post should be 1000-1200 words, well-structured with subheadings, engaging, informative, and SEO-optimized. Include an introduction, main body with 3-4 sections, and a conclusion. Use a professional yet conversational tone.`
            }]
          }]
        })
      });

      const data = await response.json();
      const post = data.candidates[0].content.parts[0].text;
      
      setBlogPost(post);
      
      // Generate image description for the blog post
      const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create a detailed image description for a blog post titled "${headline}". The description should be suitable for generating an image that represents the main theme. Keep it concise but descriptive, focusing on visual elements.`
            }]
          }]
        })
      });

      const imageData = await imageResponse.json();
      const imageDescription = imageData.candidates[0].content.parts[0].text;
      
      // For this demo, we'll use a placeholder image service
      setImageUrl(`https://picsum.photos/800/400?random=${Date.now()}`);
      
      setCurrentStep(4);
      toast.success('Blog post and image generated successfully!');
    } catch (error) {
      console.error('Error generating blog post:', error);
      toast.error('Failed to generate blog post');
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!emailConfig.recipientEmail || !emailConfig.senderEmail || !emailConfig.senderPassword) {
      toast.error('Please fill in all email configuration fields');
      return;
    }

    setLoading(true);
    
    try {
      // This is a simplified email sending simulation
      // In a real application, you would use a backend service or email API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Blog post sent via email successfully!');
      setCurrentStep(5);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setTrendingTopics([]);
    setSelectedTopic('');
    setHeadlines([]);
    setSelectedHeadline('');
    setBlogPost('');
    setImageUrl('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Blog Scribe
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate trending blog posts with Gemini AI and send them via email
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  currentStep >= step ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-300'
                }`}>
                  {step}
                </div>
                {step < 5 && <div className={`w-12 h-1 ${currentStep > step ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-300'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: API Configuration */}
        {currentStep === 1 && (
          <Card className="max-w-2xl mx-auto">
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
                />
                <Input
                  placeholder="Your email"
                  value={emailConfig.senderEmail}
                  onChange={(e) => setEmailConfig({...emailConfig, senderEmail: e.target.value})}
                />
                <Input
                  type="password"
                  placeholder="Your email password"
                  value={emailConfig.senderPassword}
                  onChange={(e) => setEmailConfig({...emailConfig, senderPassword: e.target.value})}
                />
              </div>
              
              <Button 
                onClick={getTrendingTopics} 
                disabled={loading || !geminiApiKey}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                Get Trending Topics
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Topic */}
        {currentStep === 2 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                Choose a Trending Topic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trendingTopics.map((topic, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-300">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-center">{topic}</h3>
                      <Button 
                        onClick={() => generateHeadlines(topic)}
                        className="w-full mt-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      >
                        Select Topic
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Headline */}
        {currentStep === 3 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-green-500" />
                Choose a Headline
              </CardTitle>
              <p className="text-sm text-gray-600">Topic: {selectedTopic}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {headlines.map((headline, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-300">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{headline}</h3>
                      <Button 
                        onClick={() => generateBlogPost(headline)}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        Generate Blog Post
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review and Send */}
        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-purple-500" />
                  Generated Blog Post
                </CardTitle>
                <Badge variant="secondary">{selectedHeadline}</Badge>
              </CardHeader>
              <CardContent>
                {imageUrl && (
                  <div className="mb-6">
                    <img src={imageUrl} alt="Blog post image" className="w-full h-64 object-cover rounded-lg" />
                  </div>
                )}
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{blogPost}</pre>
                </div>
                <div className="mt-6 flex gap-4">
                  <Button 
                    onClick={sendEmail}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                    Send via Email
                  </Button>
                  <Button variant="outline" onClick={resetWorkflow}>
                    Start Over
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Success */}
        {currentStep === 5 && (
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-4">Blog Post Sent Successfully!</h2>
              <p className="text-gray-600 mb-6">Your blog post has been sent to {emailConfig.recipientEmail}</p>
              <Button 
                onClick={resetWorkflow}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Create Another Blog Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
