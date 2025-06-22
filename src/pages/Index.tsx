
import React, { useState, useEffect } from 'react';
import ConfigurationForm from '@/components/ConfigurationForm';
import AutomationControl from '@/components/AutomationControl';
import AutomationLogs from '@/components/AutomationLogs';
import BlogPostPreview from '@/components/BlogPostPreview';
import { useBlogAutomation } from '@/hooks/useBlogAutomation';
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

  const {
    isAutomated,
    loading,
    status: automationStatus,
    logs: automationLogs,
    currentBlog,
    runSingleAutomation,
    startAutomation,
    stopAutomation
  } = useBlogAutomation(geminiApiKey, emailConfig);

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
