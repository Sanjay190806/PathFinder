import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';

export const ResumeKeywordPanel: React.FC = () => {
  const [role, setRole] = useState("swe");

  const keywordsByRole: Record<string, { found: string[]; missing: string[] }> = {
    swe: {
      found: ["Java", "OOPs", "Data Structures", "Algorithms", "React", "Git", "SQL"],
      missing: ["Docker", "CI/CD", "Redis", "Spring Boot", "Design Patterns", "TypeScript"]
    },
    ai_eng: {
      found: ["Python", "XGBoost", "FastAPI", "Data Structures", "Pandas", "Scikit-Learn"],
      missing: ["PyTorch", "MLflow", "SHAP Explanations", "TensorFlow", "Kubernetes", "CUDA"]
    }
  };

  const roleOptions = [
    { value: "swe", label: "Software Engineer Target" },
    { value: "ai_eng", label: "AI / ML Engineer Target" }
  ];

  const currentKeywords = keywordsByRole[role] || keywordsByRole.swe;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider block pl-0.5">Recruiter ATS Keywords Matcher</span>
        <div className="max-w-[200px]">
          <Select
            options={roleOptions}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="text-[11px] py-1 h-8 rounded-lg"
          />
        </div>
      </div>

      <div>
        <span className="text-[10px] font-bold text-accentEmerald uppercase block mb-2 pl-0.5">Found Keywords in Resume ({currentKeywords.found.length})</span>
        <div className="flex flex-wrap gap-1.5 p-2.5 bg-bgSurface/40 border border-border-subtle rounded-xl min-h-[60px]">
          {currentKeywords.found.map((kw, idx) => (
            <Badge key={idx} variant="success">{kw}</Badge>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[10px] font-bold text-red-400 uppercase block mb-2 pl-0.5">Missing Target keywords ({currentKeywords.missing.length})</span>
        <div className="flex flex-wrap gap-1.5 p-2.5 bg-bgSurface/40 border border-border-subtle rounded-xl min-h-[60px]">
          {currentKeywords.missing.map((kw, idx) => (
            <Badge key={idx} variant="danger">{kw}</Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};
