
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Facebook } from 'lucide-react';

interface ConfigurationFormProps {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  facebookConfig: {
    pageId: string;
    accessToken: string;
    appId: string;
    appSecret: string;
  };
  setFacebookConfig: (config: any) => void;
  isAutomated: boolean;
  onTestConnection?: () => void;
  testingConnection?: boolean;
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({
  geminiApiKey,
  setGeminiApiKey,
  facebookConfig,
  setFacebookConfig,
  isAutomated,
  onTestConnection,
  testingConnection = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-6 w-6 text-blue-500" />
          Facebook Configuration
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
          <label className="block text-sm font-medium">Facebook Page Configuration</label>
          <Input
            placeholder="Facebook Page ID"
            value={facebookConfig.pageId}
            onChange={(e) => setFacebookConfig({...facebookConfig, pageId: e.target.value})}
            disabled={isAutomated}
          />
          <Input
            type="password"
            placeholder="Page Access Token"
            value={facebookConfig.accessToken}
            onChange={(e) => setFacebookConfig({...facebookConfig, accessToken: e.target.value})}
            disabled={isAutomated}
          />
          <p className="text-xs text-gray-500">
            Get your Page Access Token from <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Facebook Graph API Explorer</a>
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Optional: App Configuration</label>
          <Input
            placeholder="Facebook App ID (optional)"
            value={facebookConfig.appId}
            onChange={(e) => setFacebookConfig({...facebookConfig, appId: e.target.value})}
            disabled={isAutomated}
          />
          <Input
            type="password"
            placeholder="Facebook App Secret (optional)"
            value={facebookConfig.appSecret}
            onChange={(e) => setFacebookConfig({...facebookConfig, appSecret: e.target.value})}
            disabled={isAutomated}
          />
          <p className="text-xs text-gray-500">
            Create a Facebook App at <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Facebook for Developers</a>
          </p>
        </div>

        {onTestConnection && (
          <div className="pt-2">
            <Button
              onClick={onTestConnection}
              disabled={isAutomated || testingConnection || !facebookConfig.pageId || !facebookConfig.accessToken}
              variant="outline"
              className="w-full"
            >
              {testingConnection ? 'Testing...' : 'Test Facebook Connection'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfigurationForm;
