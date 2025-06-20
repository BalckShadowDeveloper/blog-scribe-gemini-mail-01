
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-purple-500" />
          Latest Generated Blog Post
        </CardTitle>
        <div className="space-y-2">
          <Badge variant="secondary">{currentBlog.topic}</Badge>
          <h3 className="text-lg font-semibold">{currentBlog.headline}</h3>
        </div>
      </CardHeader>
      <CardContent>
        {currentBlog.imageUrl && (
          <div className="mb-6">
            <img src={currentBlog.imageUrl} alt="Blog post image" className="w-full h-64 object-cover rounded-lg" />
          </div>
        )}
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm max-h-96 overflow-y-auto">{currentBlog.content}</pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogPostPreview;
