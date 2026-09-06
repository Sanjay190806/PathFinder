import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useRoadmapStore } from '../../app/store/useRoadmapStore';
import { ROADMAP } from '../../data/roadmap';

export const RoadmapFilters: React.FC = () => {
  const searchQuery = useRoadmapStore((s) => s.searchQuery);
  const setSearchQuery = useRoadmapStore((s) => s.setSearchQuery);
  
  const selectedTopic = useRoadmapStore((s) => s.selectedTopic);
  const setSelectedTopic = useRoadmapStore((s) => s.setSelectedTopic);

  const selectedDifficulty = useRoadmapStore((s) => s.selectedDifficulty);
  const setSelectedDifficulty = useRoadmapStore((s) => s.setSelectedDifficulty);

  const selectedStatus = useRoadmapStore((s) => s.selectedStatus);
  const setSelectedStatus = useRoadmapStore((s) => s.setSelectedStatus);

  const topicOptions = [
    { value: "", label: "All Topics" },
    ...Array.from(new Set(Object.values(ROADMAP).flat().map((problem) => problem.topic)))
      .sort((a, b) => a.localeCompare(b))
      .map((topic) => ({ value: topic, label: topic }))
  ];

  const diffOptions = [
    { value: "", label: "All Difficulties" },
    { value: "Easy", label: "Easy Challenges" },
    { value: "Medium", label: "Medium Challenges" },
    { value: "Hard", label: "Hard Challenges" }
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "solved", label: "Solved Only" },
    { value: "unsolved", label: "Unsolved Only" }
  ];

  return (
    <Card className="mb-6 p-4">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchQuery('');
            setSelectedTopic('');
            setSelectedDifficulty('');
            setSelectedStatus('all');
          }}
        >
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
        {/* Search */}
        <Input
          placeholder="Search by title, topic, pattern..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {/* Topic dropdown */}
        <Select
          options={topicOptions}
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        />

        {/* Difficulty dropdown */}
        <Select
          options={diffOptions}
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
        />

        {/* Status select */}
        <Select
          options={statusOptions}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
        />
      </div>
    </Card>
  );
};
