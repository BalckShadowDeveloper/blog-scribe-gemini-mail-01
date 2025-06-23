
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, Eye } from 'lucide-react';
import { markdownToHtml, cleanMarkdownForPreview } from '@/lib/markdownUtils';

interface BlogPostPreviewProps {
  currentBlog: {
    topic: string;
    headline: string;
    content: string;
    imageUrl: string;
  };
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({ currentBlog }) => {
  if (!currentBlog.content) return null;

  const cleanContent = cleanMarkdownForPreview(currentBlog.content);
  const htmlContent = markdownToHtml(cleanContent);

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden border-0 shadow-xl bg-white">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Mail className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1"
              >
                {currentBlog.topic}
              </Badge>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold leading-tight">
              {currentBlog.headline}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {currentBlog.imageUrl && (
            <div className="relative">
              <img 
                src={currentBlog.imageUrl} 
                alt={currentBlog.headline} 
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}
          
          <div className="p-8">
            <article 
              className="max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
            
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Ready to Share
                  </h4>
                </div>
                <p className="text-gray-600 mb-4">
                  This professionally formatted blog post is ready to be sent via email with proper markdown rendering and beautiful typography.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    Markdown Formatted
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Mobile Responsive
                  </Badge>
                  <Badge variant="outline" className="text-indigo-600 border-indigo-200">
                    SEO Optimized
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPostPreview;
