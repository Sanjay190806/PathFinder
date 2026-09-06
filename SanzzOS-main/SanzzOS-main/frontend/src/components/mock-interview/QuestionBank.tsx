import React, { useState } from 'react';
import { useMockInterviewOS } from '../../hooks/useMockInterviewOS';
import { InterviewQuestionCategory } from '../../types/mockInterview';
import { Search, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface QuestionBankProps {
  onSelectQuestion: (questionId: string) => void;
}

const CATEGORIES: InterviewQuestionCategory[] = [
  'HR',
  'Technical',
  'Behavioral',
  'Java DSA',
  'SQL',
  'Project Explanation',
  'Resume',
  'Product Thinking',
  'Analytics',
];

export const QuestionBank: React.FC<QuestionBankProps> = ({ onSelectQuestion }) => {
  const { questions, addQuestion, deleteQuestion, answers } = useMockInterviewOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<InterviewQuestionCategory | 'All'>('All');

  const [newQText, setNewQText] = useState('');
  const [newQCategory, setNewQCategory] = useState<InterviewQuestionCategory>('HR');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) return;
    addQuestion({
      category: newQCategory,
      question: newQText,
      notes: 'Custom question added by user.',
    });
    setNewQText('');
    setShowAddForm(false);
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || q.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      {/* Category Pills & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
        <div className="flex items-center gap-2 bg-black/45 border border-white/5 px-3 py-1.5 rounded-xl w-full md:max-w-xs">
          <Search className="h-4 w-4 text-textMuted" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-textPrimary placeholder:text-textMuted focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 bg-accentBlue text-white uppercase tracking-wider font-black text-[10px]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Question
          </Button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddQuestion} className="bg-[#0c0c1e] border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
          <h4 className="text-xs font-black uppercase text-textPrimary">Create Custom Question</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Question text</label>
              <input
                type="text"
                required
                value={newQText}
                onChange={(e) => setNewQText(e.target.value)}
                placeholder="e.g. Tell me about a time you handled a difficult client."
                className="w-full h-9 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Category</label>
              <select
                value={newQCategory}
                onChange={(e) => setNewQCategory(e.target.value as any)}
                className="w-full h-9 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0c0c1e]">{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 self-end">
            <Button size="sm" variant="ghost" type="button" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Question
            </Button>
          </div>
        </form>
      )}

      {/* Category Selection Filter Line */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition shrink-0 ${
            activeCategory === 'All' ? 'bg-accentBlue text-white' : 'bg-white/5 text-textSecondary hover:bg-white/10'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition shrink-0 ${
              activeCategory === cat ? 'bg-accentBlue text-white' : 'bg-white/5 text-textSecondary hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Questions list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredQuestions.length === 0 ? (
          <div className="md:col-span-2 text-center text-textMuted py-8">
            No questions found matching your filter options.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const hasDraft = !!answers[q.id];
            const isPracticed = answers[q.id]?.isPracticed;

            return (
              <Card
                key={q.id}
                onClick={() => onSelectQuestion(q.id)}
                className="p-4 border-white/5 bg-black/45 hover:border-white/10 transition cursor-pointer flex flex-col justify-between gap-3 group relative overflow-hidden"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-textMuted text-[8px] font-bold uppercase tracking-wider">
                      {q.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {hasDraft && (
                        <span className="text-[8px] font-black uppercase text-accentBlue">Drafted</span>
                      )}
                      {isPracticed && (
                        <CheckCircle className="h-3.5 w-3.5 text-accentEmerald" />
                      )}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-textPrimary leading-relaxed mt-1 group-hover:text-accentBlue transition">
                    {q.question}
                  </h4>
                  {q.notes && <p className="text-[10px] text-textMuted font-normal leading-normal italic">{q.notes}</p>}
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                  <span className="text-[9px] text-textMuted">
                    {answers[q.id]?.practicedCount || 0} times practiced
                  </span>

                  <div className="flex items-center gap-2">
                    {q.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuestion(q.id);
                        }}
                        className="p-1 rounded text-red-400 hover:bg-white/5 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-wider text-accentBlue group-hover:underline">
                      Edit Draft →
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
export default QuestionBank;
