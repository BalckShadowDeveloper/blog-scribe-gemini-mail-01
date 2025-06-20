
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';

interface ConfigurationFormProps {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  emailConfig: {
    recipientEmail: string;
    senderEmail: string;
    senderPassword: string;
    emailjsServiceId: string;
    emailjsTemplateId: string;
    emailjsPublicKey: string;
  };
  setEmailConfig: (config: any) => void;
  isAutomated: boolean;
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({
  geminiApiKey,
  setGeminiApiKey,
  emailConfig,
  setEmailConfig,
  isAutomated
}) => {
  return (
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
  );
};

export default ConfigurationForm;
