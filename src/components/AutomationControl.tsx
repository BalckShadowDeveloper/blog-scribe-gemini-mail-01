
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Square, Sparkles } from 'lucide-react';

interface AutomationControlProps {
  isAutomated: boolean;
  loading: boolean;
  automationStatus: string;
  startAutomation: () => void;
  stopAutomation: () => void;
  runSingleAutomation: () => void;
}

const AutomationControl: React.FC<AutomationControlProps> = ({
  isAutomated,
  loading,
  automationStatus,
  startAutomation,
  stopAutomation,
  runSingleAutomation
}) => {
  return (
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
              ✅ Automation running - Random schedule active
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationControl;
