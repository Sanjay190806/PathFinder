import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { GermanStory } from '../../data/germanStories';
import { MessageCircle } from 'lucide-react';

export const GermanStoryCard: React.FC<{
  story: GermanStory;
  onExplain: (story: GermanStory) => void;
}> = ({ story, onExplain }) => {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-textPrimary">{story.title}</h3>
          <p className="mt-1 text-xs text-textSecondary">{story.german}</p>
        </div>
        <Badge variant={story.level === 'A1' ? 'success' : 'primary'}>{story.level}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {story.vocabularyHighlights.map((item) => <Badge key={item} variant="neutral">{item}</Badge>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => onExplain(story)}>
          <MessageCircle className="h-4 w-4" /> Shayla explain
        </Button>
      </div>
    </Card>
  );
};

