import React from 'react';
import { Building2 } from 'lucide-react';
import { ApplicationStatus, PlacementCompany } from '../../types/placement';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface Props {
  company: PlacementCompany;
  status: ApplicationStatus;
  onSelect: () => void;
}

export const CompanyCard: React.FC<Props> = ({ company, status, onSelect }) => (
  <Card hoverable onClick={onSelect}>
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-accentBlue" />
        <h3 className="font-semibold text-textPrimary">{company.name}</h3>
      </div>
      <Badge variant={company.priority === 'high' ? 'danger' : company.priority === 'medium' ? 'warning' : 'neutral'}>{company.priority}</Badge>
    </div>
    <p className="text-sm text-textSecondary">{company.targetRole}</p>
    <p className="mt-2 text-xs text-textMuted">{company.packageRange}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      <Badge>{company.type}</Badge>
      <Badge variant="primary">{status.replace(/_/g, ' ')}</Badge>
    </div>
  </Card>
);
