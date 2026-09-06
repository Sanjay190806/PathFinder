import React, { useEffect, useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useCareerStore } from '../../app/store/useCareerStore';
import {
  ApplicationPriority,
  ApplicationSource,
  CareerApplicationStatus,
  ApplicationWorkMode,
  CareerApplication,
} from '../../types';
import {
  APPLICATION_PRIORITY_OPTIONS,
  APPLICATION_SOURCE_OPTIONS,
  APPLICATION_STATUSES,
  calculateJDMatch,
  createTimelineEvent,
  ensureApplicationDefaults,
  extractKeywords,
  getCompanyPrepPlan,
  getNextAction,
} from '../../utils/applicationCrmUtils';

interface ApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: CareerApplication;
}

export const ApplicationDrawer: React.FC<ApplicationDrawerProps> = ({ isOpen, onClose, application }) => {
  const updateApplication = useCareerStore((s) => s.updateApplication);
  const deleteApplication = useCareerStore((s) => s.deleteApplication);

  const [company, setCompany] = useState(application.company);
  const [role, setRole] = useState(application.role);
  const [status, setStatus] = useState<CareerApplicationStatus>(application.status);
  const [salary, setSalary] = useState(application.salary);
  const [date, setDate] = useState(application.date);
  const [source, setSource] = useState<ApplicationSource>(application.source || 'Other');
  const [priority, setPriority] = useState<ApplicationPriority>(application.priority || 'Medium');
  const [jobUrl, setJobUrl] = useState(application.jobUrl || '');
  const [deadline, setDeadline] = useState(application.deadline || '');
  const [resumeVersion, setResumeVersion] = useState(application.resumeVersion || '');
  const [referralContact, setReferralContact] = useState(application.referralContact || '');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(application.nextFollowUpDate || '');
  const [location, setLocation] = useState(application.location || '');
  const [workMode, setWorkMode] = useState<ApplicationWorkMode>(application.workMode || '');
  const [jdText, setJdText] = useState(application.jdText || '');
  const [notes, setNotes] = useState(application.notes || '');

  useEffect(() => {
    if (!isOpen) return;
    setCompany(application.company);
    setRole(application.role);
    setStatus(application.status);
    setSalary(application.salary);
    setDate(application.date);
    setSource(application.source || 'Other');
    setPriority(application.priority || 'Medium');
    setJobUrl(application.jobUrl || '');
    setDeadline(application.deadline || '');
    setResumeVersion(application.resumeVersion || '');
    setReferralContact(application.referralContact || '');
    setNextFollowUpDate(application.nextFollowUpDate || '');
    setLocation(application.location || '');
    setWorkMode(application.workMode || '');
    setJdText(application.jdText || '');
    setNotes(application.notes || '');
  }, [isOpen, application]);

  const enriched = ensureApplicationDefaults(application);
  const draftApplication: CareerApplication = {
    ...enriched,
    company,
    role,
    status,
    salary,
    date,
    source,
    priority,
    jobUrl,
    deadline,
    resumeVersion,
    referralContact,
    nextFollowUpDate,
    location,
    workMode,
    jdText,
    notes,
    jdKeywords: jdText ? extractKeywords(jdText) : enriched.jdKeywords,
  };
  const nextAction = getNextAction(draftApplication);
  const jdMatch = calculateJDMatch(draftApplication);
  const prepPlan = getCompanyPrepPlan(draftApplication);

  const statusOptions = APPLICATION_STATUSES.map((item) => ({ value: item, label: item }));
  const sourceOptions = APPLICATION_SOURCE_OPTIONS.map((item) => ({ value: item, label: item }));
  const priorityOptions = APPLICATION_PRIORITY_OPTIONS.map((item) => ({ value: item, label: item }));
  const workModeOptions = [
    { value: '', label: 'Not specified' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'On-site', label: 'On-site' },
    { value: 'Flexible', label: 'Flexible' },
  ];

  const handleSave = () => {
    const keywords = jdText ? extractKeywords(jdText) : application.jdKeywords || [];
    const statusChanged = status !== application.status;

    updateApplication(application.id, {
      company,
      role,
      status,
      salary,
      date,
      source,
      priority,
      jobUrl,
      deadline,
      resumeVersion,
      referralContact,
      nextFollowUpDate,
      location,
      workMode,
      jdText,
      jdKeywords: keywords,
      notes,
      risk: nextAction.urgency === 'high' ? 'High' : nextAction.urgency === 'medium' ? 'Medium' : 'Low',
      timeline: [
        ...(enriched.timeline || []),
        ...(statusChanged ? [createTimelineEvent(status, `Moved to ${status}`, `${company} - ${role}`)] : []),
        ...(jdText && jdText !== application.jdText
          ? [createTimelineEvent('JD Review', 'Updated JD keyword analysis', keywords.slice(0, 8).join(', '))]
          : []),
      ],
      lastUpdatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete application for ${company}?`)) {
      deleteApplication(application.id);
      onClose();
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Application details: ${application.company}`}>
      <div className="flex flex-col gap-5 select-none pb-6">
        <div className="rounded-2xl border border-border-subtle bg-bgCard/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Next Action</p>
          <h4 className="mt-1 text-base font-semibold text-textPrimary">{nextAction.label}</h4>
          <p className="mt-1 text-xs text-textSecondary">{nextAction.reason}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Input label="Job Role / Position" value={role} onChange={(e) => setRole(e.target.value)} />
          <Select label="Application Status" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value as CareerApplicationStatus)} />
          <Select label="Priority" options={priorityOptions} value={priority} onChange={(e) => setPriority(e.target.value as ApplicationPriority)} />
          <Select label="Source" options={sourceOptions} value={source} onChange={(e) => setSource(e.target.value as ApplicationSource)} />
          <Select label="Work Mode" options={workModeOptions} value={workMode} onChange={(e) => setWorkMode(e.target.value as ApplicationWorkMode)} />
          <Input label="Salary details" value={salary} onChange={(e) => setSalary(e.target.value)} />
          <Input label="Application Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <Input label="Next Follow-up" type="date" value={nextFollowUpDate} onChange={(e) => setNextFollowUpDate(e.target.value)} />
          <Input label="Job URL" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
          <Input label="Resume Version" value={resumeVersion} onChange={(e) => setResumeVersion(e.target.value)} />
          <Input label="Referral Contact" value={referralContact} onChange={(e) => setReferralContact(e.target.value)} />
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-textSecondary pl-1">Job Description</span>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="min-h-[140px] rounded-2xl border border-border-subtle bg-white/[0.03] px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBlue/35"
          />
        </label>

        <div className="rounded-2xl border border-border-subtle bg-bgCard/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">JD Match</p>
            <span className="font-mono text-sm font-semibold text-accentBlue">{jdMatch.score}%</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(jdMatch.missing.length ? jdMatch.missing : extractKeywords(jdText, 10)).slice(0, 12).map((keyword) => (
              <span key={keyword} className="rounded-full border border-border-subtle px-2 py-1 text-[10px] text-textSecondary">
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bgCard/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Company Prep Dashboard</p>
              <h4 className="mt-1 text-sm font-semibold text-textPrimary">{prepPlan.focus}</h4>
            </div>
            <span className="rounded-full border border-border-subtle px-2 py-1 text-[10px] text-textSecondary">{status}</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ['DSA/OA', prepPlan.dsa],
              ['Aptitude', prepPlan.aptitude],
              ['Interview', prepPlan.interview],
              ['Resume', prepPlan.resume],
              ['Communication', prepPlan.communication],
            ].map(([title, items]) => (
              <div key={title as string} className="rounded-xl border border-border-subtle bg-white/[0.02] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">{title as string}</p>
                <ul className="mt-2 space-y-1">
                  {(items as string[]).map((item) => (
                    <li key={item} className="text-[11px] text-textSecondary">- {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-textSecondary pl-1">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px] rounded-2xl border border-border-subtle bg-white/[0.03] px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBlue/35"
          />
        </label>

        <div className="rounded-2xl border border-border-subtle bg-bgCard/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Timeline</p>
          <div className="mt-3 flex flex-col gap-3">
            {(enriched.timeline || []).slice().reverse().map((event) => (
              <div key={event.id} className="border-l border-border-subtle pl-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-textPrimary">{event.title}</p>
                  <span className="font-mono text-[10px] text-textMuted">{event.date}</span>
                </div>
                {event.note && <p className="mt-1 text-[11px] text-textSecondary">{event.note}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 border-t border-border-subtle/50">
          <Button onClick={handleSave} className="w-full rounded-xl">Save Changes</Button>
          <Button onClick={handleDelete} variant="danger" className="w-full rounded-xl mt-1">Delete Application</Button>
        </div>
      </div>
    </Drawer>
  );
};
