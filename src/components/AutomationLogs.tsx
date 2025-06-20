
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface AutomationLogsProps {
  automationLogs: string[];
}

const AutomationLogs: React.FC<AutomationLogsProps> = ({ automationLogs }) => {
  return (
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
  );
};

export default AutomationLogs;
