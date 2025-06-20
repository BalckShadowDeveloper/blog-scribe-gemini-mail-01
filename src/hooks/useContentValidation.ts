
import { useState } from 'react';

export const useContentValidation = () => {
  const [validationLogs, setValidationLogs] = useState<string[]>([]);

  const addValidationLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[VALIDATION ${timestamp}] ${message}`;
    setValidationLogs(prev => [...prev.slice(-4), logMessage]);
    console.log(logMessage);
  };

  const validateContent = (content: string, attempt: number): { isValid: boolean; cleanedContent: string } => {
    addValidationLog(`Validation attempt ${attempt}/4 - Checking content...`);
    
    // Multiple passes of aggressive markdown cleanup
    let cleanedContent = content;
    
    // Pass 1: Remove headers and formatting
    cleanedContent = cleanedContent
      .replace(/#{1,6}\s*/g, '')  // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')  // Remove italic markdown
      .replace(/^\s*[-*+]\s+/gm, '• ')  // Convert markdown lists
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Remove markdown links
      .replace(/\*/g, '')  // Remove any remaining asterisks
      .replace(/#/g, '')  // Remove any remaining hash symbols
      .replace(/`([^`]+)`/g, '$1')  // Remove code formatting
      .replace(/_{2,}(.*?)_{2,}/g, '$1')  // Remove underline formatting
      .replace(/~~(.*?)~~/g, '$1');  // Remove strikethrough
    
    // Pass 2: Additional cleanup
    cleanedContent = cleanedContent
      .replace(/\s+/g, ' ')  // Clean up multiple spaces
      .replace(/\n\s*\n/g, '\n\n')  // Ensure proper paragraph breaks
      .trim();
    
    // Check for remaining markdown
    const hasMarkdown = /[#*_`~\[\]]/g.test(cleanedContent);
    const hasDoubleAsterisks = /\*\*/g.test(cleanedContent);
    const hasHashes = /#/g.test(cleanedContent);
    
    if (hasMarkdown || hasDoubleAsterisks || hasHashes) {
      addValidationLog(`❌ Validation failed - Found markdown symbols (Attempt ${attempt})`);
      if (hasDoubleAsterisks) addValidationLog('  - Found ** symbols');
      if (hasHashes) addValidationLog('  - Found # symbols');
      return { isValid: false, cleanedContent };
    }
    
    addValidationLog(`✅ Validation passed - Content is clean (Attempt ${attempt})`);
    return { isValid: true, cleanedContent };
  };

  const performMultipleValidations = async (content: string): Promise<string> => {
    let finalContent = content;
    
    for (let attempt = 1; attempt <= 4; attempt++) {
      const validation = validateContent(finalContent, attempt);
      finalContent = validation.cleanedContent;
      
      if (validation.isValid) {
        addValidationLog(`✅ Content validation completed successfully after ${attempt} attempts`);
        break;
      }
      
      if (attempt === 4) {
        addValidationLog(`⚠️ Max validation attempts reached. Content may still contain markdown.`);
      }
      
      // Wait a bit between attempts
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return finalContent;
  };

  return {
    performMultipleValidations,
    validationLogs
  };
};
