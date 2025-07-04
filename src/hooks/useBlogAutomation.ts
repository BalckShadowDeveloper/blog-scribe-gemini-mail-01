
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { BlogService, BlogContent } from '@/services/blogService';
import { FacebookService, FacebookConfig } from '@/services/facebookService';
import { useContentValidation } from './useContentValidation';
import { useRandomScheduling } from './useRandomScheduling';

export interface AutomationState {
  isAutomated: boolean;
  loading: boolean;
  status: string;
  logs: string[];
  currentBlog: BlogContent;
}

export const useBlogAutomation = (geminiApiKey: string, facebookConfig: FacebookConfig) => {
  const [state, setState] = useState<AutomationState>({
    isAutomated: false,
    loading: false,
    status: 'Ready to start automation',
    logs: [],
    currentBlog: {
      topic: '',
      headline: '',
      content: '',
      imageUrl: ''
    }
  });

  const automationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { performMultipleValidations, validationLogs } = useContentValidation();
  const { generateRandomSchedule, getNextScheduledTime, removeCompletedTime, clearSchedule } = useRandomScheduling();

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-9), logMessage]
    }));
    console.log(logMessage);
  }, []);

  const updateStatus = useCallback((status: string) => {
    setState(prev => ({ ...prev, status }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setCurrentBlog = useCallback((blog: BlogContent) => {
    setState(prev => ({ ...prev, currentBlog: blog }));
  }, []);

  const runSingleAutomation = useCallback(async (): Promise<boolean> => {
    if (!geminiApiKey || !facebookConfig.pageId || !facebookConfig.accessToken) {
      toast.error('Please fill in all configuration fields including Facebook Page ID and Access Token');
      return false;
    }

    setLoading(true);
    updateStatus('Running automation cycle...');

    try {
      const blogService = new BlogService(geminiApiKey);
      const facebookService = new FacebookService(facebookConfig);

      addLog('Generating diverse viral trending topic...');
      const topic = await blogService.generateTrendingTopic();
      addLog(`Generated diverse topic: ${topic}`);

      addLog('Generating viral headline...');
      const headline = await blogService.generateHeadline(topic);
      addLog(`Generated viral headline: ${headline}`);

      addLog('Generating markdown-formatted blog post...');
      const content = await blogService.generateBlogPost(headline, topic);
      
      addLog('Running enhanced content validation...');
      const validatedContent = await performMultipleValidations(content);
      addLog(`Generated markdown blog post (${validatedContent.length} characters)`);

      addLog('Generating topic-specific image...');
      const imageUrl = blogService.generateTopicRelevantImage(topic, headline);
      addLog('Generated topic-specific image');

      const blogData = {
        topic,
        headline,
        content: validatedContent,
        imageUrl
      };

      setCurrentBlog(blogData);

      addLog('Posting to Facebook page...');
      const posted = await facebookService.postToFacebook(blogData);
      
      if (posted) {
        updateStatus('Automation cycle completed successfully');
        addLog('Facebook post published successfully');
        addLog('--- Automation cycle completed ---');
        return true;
      } else {
        updateStatus('Automation cycle completed with Facebook error');
        addLog('Facebook posting failed');
        return false;
      }
      
    } catch (error) {
      console.error('Automation error:', error);
      addLog(`Automation failed: ${error}`);
      updateStatus('Automation cycle failed');
      toast.error('Automation failed. Check logs for details.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [geminiApiKey, facebookConfig, addLog, updateStatus, setLoading, setCurrentBlog, performMultipleValidations]);

  const startAutomation = useCallback(async () => {
    if (!geminiApiKey || !facebookConfig.pageId || !facebookConfig.accessToken) {
      toast.error('Please fill in all configuration fields including Facebook Page ID and Access Token');
      return;
    }

    setState(prev => ({ ...prev, isAutomated: true }));
    addLog('Starting automated blog generation with random scheduling...');
    
    const schedule = generateRandomSchedule();
    toast.success(`Automation started! ${schedule.length} Facebook posts scheduled randomly over the next hour.`);

    // Run first automation immediately
    await runSingleAutomation();

    // Set up interval to check for scheduled times
    const interval = setInterval(async () => {
      if (!state.isAutomated) return;
      
      const nextTime = getNextScheduledTime();
      if (nextTime && Date.now() >= nextTime) {
        addLog('Executing scheduled automation...');
        await runSingleAutomation();
        removeCompletedTime();
        
        // If no more scheduled times, generate new schedule
        if (getNextScheduledTime() === null) {
          const newSchedule = generateRandomSchedule();
          addLog(`Generated new random schedule: ${newSchedule.length} Facebook posts over next hour`);
        }
      }
    }, 30000); // Check every 30 seconds

    automationIntervalRef.current = interval;
  }, [geminiApiKey, facebookConfig, state.isAutomated, addLog, generateRandomSchedule, runSingleAutomation, getNextScheduledTime, removeCompletedTime]);

  const stopAutomation = useCallback(() => {
    setState(prev => ({ ...prev, isAutomated: false }));
    if (automationIntervalRef.current) {
      clearInterval(automationIntervalRef.current);
      automationIntervalRef.current = null;
    }
    clearSchedule();
    updateStatus('Automation stopped');
    addLog('Automation stopped by user');
    toast.info('Automation stopped');
  }, [addLog, updateStatus, clearSchedule]);

  const allLogs = [...state.logs, ...validationLogs];

  return {
    ...state,
    logs: allLogs,
    runSingleAutomation,
    startAutomation,
    stopAutomation
  };
};
