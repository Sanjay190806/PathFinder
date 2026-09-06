import React, { useState } from 'react';
import { LearningPath, LearningSession } from '../../types/learning';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const LearningSessionForm: React.FC<{ paths: LearningPath[]; selectedPathId: string; onSubmit: (session: Omit<LearningSession, 'id' | 'createdAt'>) => void }> = ({ paths, selectedPathId, onSubmit }) => {
  const [pathId, setPathId] = useState(selectedPathId);
  const [topic, setTopic] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [confidence, setConfidence] = useState<LearningSession['confidence']>('medium');
  const [difficulty, setDifficulty] = useState<LearningSession['difficulty']>('medium');

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-textPrimary">Log learning session</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <select className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary" value={pathId} onChange={(event) => setPathId(event.target.value)}>
          {paths.map((path) => <option key={path.id} value={path.id}>{path.title}</option>)}
        </select>
        <input className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary" placeholder="Topic, e.g. SQL joins" value={topic} onChange={(event) => setTopic(event.target.value)} />
        <input className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary" type="number" min={5} value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} />
        <select className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary" value={confidence} onChange={(event) => setConfidence(event.target.value as LearningSession['confidence'])}>
          <option value="low">Low confidence</option>
          <option value="medium">Medium confidence</option>
          <option value="high">High confidence</option>
        </select>
        <select className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary" value={difficulty} onChange={(event) => setDifficulty(event.target.value as LearningSession['difficulty'])}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <Button onClick={() => {
          if (!topic.trim()) return;
          onSubmit({ pathId, topic: topic.trim(), minutes, confidence, difficulty, notes: '', completed: true, mistakes: confidence === 'low' ? topic.trim() : '', nextAction: `Review ${topic.trim()}` });
          setTopic('');
        }}>Log session</Button>
      </div>
    </Card>
  );
};
