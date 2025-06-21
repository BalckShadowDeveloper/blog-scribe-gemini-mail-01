
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
    addValidationLog(`Professional formatting validation attempt ${attempt}/4`);
    
    // Multiple passes of aggressive cleanup for professional formatting
    let cleanedContent = content;
    
    // Pass 1: Remove all markdown and ALL CAPS section headers
    cleanedContent = cleanedContent
      .replace(/#{1,6}\s*/g, '')  // Remove ### ## # headers
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1')  // Remove bold+italic markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')  // Remove italic markdown
      // Remove ALL CAPS section headers
      .replace(/^[A-Z\s]+:\s*/gm, '')
      .replace(/^(INTRODUCTION|CONCLUSION|PROBLEM|SOLUTION|THE TRUTH|SECRET|METHOD|REAL RESULTS|COMMON MISTAKES):\s*/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '• ')  // Convert markdown lists
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Remove markdown links
      .replace(/`([^`]+)`/g, '$1')  // Remove code formatting
      .replace(/_{2,}(.*?)_{2,}/g, '$1')  // Remove underline formatting
      .replace(/~~(.*?)~~/g, '$1')  // Remove strikethrough
      .replace(/\*/g, '')  // Remove any remaining asterisks
      .replace(/#/g, '');  // Remove any remaining hash symbols
    
    // Pass 2: Additional professional formatting cleanup
    cleanedContent = cleanedContent
      .replace(/\[.*?\]/g, '')  // Remove any remaining brackets
      .replace(/`/g, '')  // Remove any remaining backticks
      .replace(/~/g, '')  // Remove any remaining tildes
      .replace(/_/g, ' ')  // Replace underscores with spaces
      // Remove common ALL CAPS phrases that survived
      .replace(/\b(WHY EXPERTS ARE WRONG|THE SHOCKING TRUTH|THE SECRET METHOD)\b/g, (match) => 
        match.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()))
      .replace(/\s+/g, ' ')  // Clean up multiple spaces
      .replace(/\n\s*\n/g, '\n\n')  // Ensure proper paragraph breaks
      .trim();
    
    // Pass 3: Final professional formatting pass
    cleanedContent = cleanedContent
      .replace(/^\s*[#*-+]\s*/gm, '')  // Remove any line-starting markdown symbols
      .replace(/[#*`~_]/g, '')  // Remove any remaining markdown symbols
      .replace(/\s+/g, ' ')  // Final space cleanup
      .trim();
    
    // Check for remaining formatting issues
    const hasMarkdown = /[#*_`~\[\]]/g.test(cleanedContent);
    const hasAllCapsHeaders = /^[A-Z\s]+:/.test(cleanedContent);
    const hasDoubleAsterisks = /\*\*/g.test(cleanedContent);
    const hasHashes = /#/g.test(cleanedContent);
    
    if (hasMarkdown || hasAllCapsHeaders || hasDoubleAsterisks || hasHashes) {
      addValidationLog(`❌ Professional formatting failed (Attempt ${attempt})`);
      if (hasAllCapsHeaders) addValidationLog('  - Found ALL CAPS headers');
      if (hasDoubleAsterisks) addValidationLog('  - Found ** symbols');
      if (hasHashes) addValidationLog('  - Found # symbols');
      return { isValid: false, cleanedContent };
    }
    
    addValidationLog(`✅ Professional formatting validated (Attempt ${attempt})`);
    return { isValid: true, cleanedContent };
  };

  const performMultipleValidations = async (content: string): Promise<string> => {
    let finalContent = content;
    
    for (let attempt = 1; attempt <= 4; attempt++) {
      const validation = validateContent(finalContent, attempt);
      finalContent = validation.cleanedContent;
      
      if (validation.isValid) {
        addValidationLog(`✅ Professional formatting completed after ${attempt} attempts`);
        break;
      }
      
      if (attempt === 4) {
        addValidationLog(`⚠️ Final professional formatting cleanup applied`);
        // Final emergency cleanup for professional formatting
        finalContent = finalContent
          .replace(/[#*_`~\[\]]/g, '')
          .replace(/^[A-Z\s]+:\s*/gm, '');
      }
      
      // Wait between attempts
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return finalContent;
  };

  return {
    performMultipleValidations,
    validationLogs
  };
};
