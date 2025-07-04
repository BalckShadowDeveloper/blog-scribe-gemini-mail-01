
import React, { useState, useEffect } from 'react';
import ConfigurationForm from '@/components/ConfigurationForm';
import AutomationControl from '@/components/AutomationControl';
import AutomationLogs from '@/components/AutomationLogs';
import BlogPostPreview from '@/components/BlogPostPreview';
import { useBlogAutomation } from '@/hooks/useBlogAutomation';
import { FacebookService } from '@/services/facebookService';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [facebookConfig, setFacebookConfig] = useState({
    pageId: '',
    accessToken: '',
    appId: '',
    appSecret: ''
  });

  const {
    isAutomated,
    loading,
    status: automationStatus,
    logs: automationLogs,
    currentBlog,
    runSingleAutomation,
    startAutomation,
    stopAutomation
  } = useBlogAutomation(geminiApiKey, facebookConfig);

  const handleTestConnection = async () => {
    if (!facebookConfig.pageId || !facebookConfig.accessToken) {
      return;
    }
    
    setTestingConnection(true);
    const facebookService = new FacebookService(facebookConfig);
    await facebookService.testConnection();
    setTestingConnection(false);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (isAutomated) {
        stopAutomation();
      }
    };
  }, [isAutomated, stopAutomation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Blog Scribe - Facebook Auto-Poster
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate diverse viral blog posts and automatically publish them to your Facebook page
          </p>
        </div>

        {/* Configuration Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <ConfigurationForm
            geminiApiKey={geminiApiKey}
            setGeminiApiKey={setGeminiApiKey}
            facebookConfig={facebookConfig}
            setFacebookConfig={setFacebookConfig}
            isAutomated={isAutomated}
            onTestConnection={handleTestConnection}
            testingConnection={testingConnection}
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
          <AutomationLogs automationLogs={automationLogs} />
        </div>

        {/* Current Blog Preview */}
        <div className="max-w-4xl mx-auto mb-8">
          <BlogPostPreview currentBlog={currentBlog} />
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Facebook Auto-Posting Features:</h4>
              <ul className="text-sm text-blue-700 space-y-1 mb-4">
                <li>• Direct posting to Facebook pages with images</li>
                <li>• Professional Facebook-optimized formatting</li>
                <li>• Diverse topic generation across 15+ niches</li>
                <li>• Viral headline generation using proven formulas</li>
                <li>• Automatic hashtag generation for better reach</li>
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
