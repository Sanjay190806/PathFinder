import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useFeedbackStore, FeedbackType, FeedbackSeverity } from '../../app/store/useFeedbackStore';
import { submitFeedback } from '../../services/feedbackService';

const TYPES: FeedbackType[] = ['bug', 'feature', 'idea', 'issue'];
const SEVERITIES: FeedbackSeverity[] = ['low', 'medium', 'high'];

export const FeedbackPanel: React.FC = () => {
  const feedback = useFeedbackStore((s) => s.feedback);
  const addFeedback = useFeedbackStore((s) => s.addFeedback);
  const markSynced = useFeedbackStore((s) => s.markSynced);
  const [type, setType] = useState<FeedbackType>('idea');
  const [severity, setSeverity] = useState<FeedbackSeverity>('medium');
  const [page, setPage] = useState('Settings');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');

  const recentItems = useMemo(() => feedback.slice(0, 5), [feedback]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;

    const payload = {
      type,
      severity,
      page,
      title: title.trim(),
      description: description.trim(),
    };

    addFeedback(payload);
    setStatus('Saved locally.');
    setTitle('');
    setDescription('');

    try {
      const result = await submitFeedback(payload);
      markSynced(result.id);
      setStatus('Saved locally and sent to backend.');
    } catch {
      setStatus('Saved locally. Backend sync will wait until later.');
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Feedback</p>
        <h3 className="mt-1 text-lg font-semibold text-textPrimary">Local-first feedback inbox</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs font-semibold text-textSecondary">
          Type
          <select value={type} onChange={(e) => setType(e.target.value as FeedbackType)} className="rounded-2xl border border-border-subtle bg-white/[0.03] px-3 py-2 text-sm text-textPrimary">
            {TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-textSecondary">
          Severity
          <select value={severity} onChange={(e) => setSeverity(e.target.value as FeedbackSeverity)} className="rounded-2xl border border-border-subtle bg-white/[0.03] px-3 py-2 text-sm text-textPrimary">
            {SEVERITIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-2 text-xs font-semibold text-textSecondary">
        Page
        <input value={page} onChange={(e) => setPage(e.target.value)} className="rounded-2xl border border-border-subtle bg-white/[0.03] px-3 py-2 text-sm text-textPrimary" />
      </label>
      <label className="flex flex-col gap-2 text-xs font-semibold text-textSecondary">
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-2xl border border-border-subtle bg-white/[0.03] px-3 py-2 text-sm text-textPrimary" />
      </label>
      <label className="flex flex-col gap-2 text-xs font-semibold text-textSecondary">
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="resize-none rounded-2xl border border-border-subtle bg-white/[0.03] px-3 py-2 text-sm text-textPrimary" />
      </label>
      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit}>Save feedback</Button>
        <span className="text-xs text-textSecondary">{status}</span>
      </div>
      <div className="grid gap-2">
        {recentItems.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-textPrimary">{item.title}</span>
              <Badge variant={item.synced ? 'success' : 'neutral'}>{item.synced ? 'synced' : 'local'}</Badge>
            </div>
            <p className="mt-1 text-xs text-textSecondary">{item.type} · {item.severity} · {item.page}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

