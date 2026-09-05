import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.assessment import (
    Assessment, AssessmentSession, AssessmentIntegrityEvent, AssessmentIntegrityPolicy
)
from backend.app.engine.explainer import UniversalDecisionTrace, DecisionFactor, DecisionEvidence


TECHNICAL_INTERRUPTION_EVENTS = {
    "CAMERA_OFF", "PERMISSION_DENIED", "CAMERA_INTERRUPTED", "MONITORING_INTERRUPTED"
}

BEHAVIORAL_FACE_EVENTS = {
    "NO_FACE", "MULTIPLE_FACES", "LOOKING_AWAY", "FACE_OUT_OF_FRAME"
}

GADGET_EVENTS = {
    "POSSIBLE_PHONE", "POSSIBLE_TABLET", "POSSIBLE_SECOND_SCREEN",
    "POSSIBLE_SMART_DEVICE", "POSSIBLE_HEADPHONES", "POSSIBLE_OTHER_GADGET",
    "POSSIBLE_UNKNOWN_DEVICE"
}

LEARNER_WARNING_MESSAGES = {
    "NO_FACE": "Please remain visible to the camera.",
    "LOOKING_AWAY": "Please keep your attention on the assessment.",
    "MULTIPLE_FACES": "Please ensure you are the only person visible during the assessment.",
    "FACE_OUT_OF_FRAME": "Please center your face within the camera frame.",
    "POSSIBLE_PHONE": "Please remove unauthorized devices from your assessment area.",
    "POSSIBLE_TABLET": "Please remove unauthorized secondary screens or tablets from your workspace.",
    "POSSIBLE_SECOND_SCREEN": "Please ensure only one authorized display is used during the assessment.",
    "POSSIBLE_HEADPHONES": "Please remove unauthorized audio headsets during this proctored assessment.",
    "POSSIBLE_SMART_DEVICE": "Please remove wearable smart devices from your testing area.",
    "POSSIBLE_OTHER_GADGET": "Please clear unauthorized electronic accessories from your assessment desk.",
    "POSSIBLE_UNKNOWN_DEVICE": "Please clear unauthorized objects from your assessment area.",
    "CAMERA_INTERRUPTED": "Your camera connection was interrupted. Please restore camera access.",
    "CAMERA_OFF": "Camera stream was stopped. Please turn your camera back on.",
    "PERMISSION_DENIED": "Camera hardware permission was revoked. Please enable camera access.",
    "MONITORING_INTERRUPTED": "Assessment monitoring was temporarily interrupted. Please resume when ready."
}


class IntegrityPolicyEngine:
    """
    Authoritative assessment integrity policy, warning & escalation engine.
    Applies configurable policies by mode (PRACTICE, STANDARD, EXAM), enforces anti-spam
    cooldowns, correlates multi-signal events, logs DecisionTrace explainability records,
    and manages learner warning acknowledgment.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_or_create_policy(self, assessment: Assessment, mode: str = "EXAM") -> AssessmentIntegrityPolicy:
        """Retrieves configured policy or synthesizes mode-aware defaults."""
        policy = self.db.query(AssessmentIntegrityPolicy).filter(
            AssessmentIntegrityPolicy.assessment_id == assessment.id
        ).first()

        if policy:
            return policy

        # Synthesize defaults based on mode
        norm_mode = (mode or getattr(assessment, "assessment_type", "EXAM") or "EXAM").upper()
        if norm_mode == "PRACTICE":
            policy = AssessmentIntegrityPolicy(
                id=str(uuid.uuid4()),
                assessment_id=assessment.id,
                monitoring_required=False,
                camera_required=False,
                allowed_warning_count=10,
                warning_cooldown_seconds=45,
                review_required_threshold=99,
                invalidation_threshold=0,
                auto_pause_on_interruption=False,
                event_thresholds={"min_duration": 5.0, "min_confidence": 0.6},
                escalation_rules={"mode": "PRACTICE", "strict_escalation": False}
            )
        elif norm_mode in {"STANDARD", "DIAGNOSTIC"}:
            policy = AssessmentIntegrityPolicy(
                id=str(uuid.uuid4()),
                assessment_id=assessment.id,
                monitoring_required=True,
                camera_required=True,
                allowed_warning_count=4,
                warning_cooldown_seconds=30,
                review_required_threshold=5,
                invalidation_threshold=0,
                auto_pause_on_interruption=True,
                event_thresholds={"min_duration": 3.0, "min_confidence": 0.65},
                escalation_rules={"mode": "STANDARD", "strict_escalation": True}
            )
        else:  # EXAM, FINAL, CERTIFICATION
            policy = AssessmentIntegrityPolicy(
                id=str(uuid.uuid4()),
                assessment_id=assessment.id,
                monitoring_required=True,
                camera_required=True,
                allowed_warning_count=3,
                warning_cooldown_seconds=30,
                review_required_threshold=4,
                invalidation_threshold=6,  # hard limit for invalidation if configured
                auto_pause_on_interruption=True,
                event_thresholds={"min_duration": 2.0, "min_confidence": 0.70},
                escalation_rules={"mode": "EXAM", "strict_escalation": True}
            )

        self.db.add(policy)
        try:
            self.db.commit()
        except Exception:
            self.db.rollback()
            policy = self.db.query(AssessmentIntegrityPolicy).filter(
                AssessmentIntegrityPolicy.assessment_id == assessment.id
            ).first()
        return policy

    def evaluate_event(
        self,
        session: AssessmentSession,
        event: AssessmentIntegrityEvent
    ) -> Tuple[str, str, Optional[Dict[str, Any]], Optional[UniversalDecisionTrace]]:
        """
        Evaluates a newly ingested integrity event against session policy.
        Returns: (integrity_state, action_instruction, active_warning, decision_trace)
        """
        now = datetime.now(timezone.utc)
        policy = self.get_or_create_policy(session.assessment, session.mode)

        # 1. Check if session is already finalized or invalidated
        if session.integrity_state == "INVALIDATED" or session.status in {"COMPLETED", "SUBMITTED", "PASSED", "FAILED", "EXPIRED"}:
            return session.integrity_state or "INVALIDATED", "INVALIDATE", session.active_warning, None

        # 2. Distinguish Technical Interruption vs Behavioral Anomaly
        if event.event_type in TECHNICAL_INTERRUPTION_EVENTS:
            return self._handle_technical_interruption(session, policy, event, now)

        # 3. Filter Weak Signals (False-Positive Guard)
        if not self._is_actionable_event(event, policy):
            # Non-actionable weak event: do not interrupt learner
            return session.integrity_state or "NORMAL", "CONTINUE", session.active_warning, None

        # 4. Anti-Spam Warning Cooldown
        last_warn = session.last_warning_issued_at
        if last_warn:
            # Handle naive or aware datetimes
            if last_warn.tzinfo is None:
                last_warn = last_warn.replace(tzinfo=timezone.utc)
            elapsed = (now - last_warn).total_seconds()
            if elapsed < policy.warning_cooldown_seconds:
                # In cooldown: do not issue new warning banner
                curr_instruction = session.action_instruction or "CONTINUE"
                return session.integrity_state or "NORMAL", curr_instruction, session.active_warning, None

        # 5. Multi-Signal Correlation Evaluation
        correlated = self._evaluate_multi_signal_correlation(session, event)

        # 6. Increment Warning Count & State Machine Progression
        new_count = (session.warning_count or 0) + 1
        session.warning_count = new_count
        session.last_warning_issued_at = now

        msg = LEARNER_WARNING_MESSAGES.get(
            event.event_type,
            "Assessment integrity notice: please maintain standard testing posture."
        )

        warning_id = f"warn_{uuid.uuid4().hex[:10]}"
        new_warning = {
            "warning_id": warning_id,
            "event_type": event.event_type,
            "message": msg,
            "severity": event.severity,
            "timestamp": now.isoformat(),
            "acknowledged": False
        }
        session.active_warning = new_warning

        # Determine next integrity state & runtime action
        new_state = "WARNING"
        action_instruction = "SHOW_WARNING"
        reason = f"Integrity event {event.event_type} detected with severity {event.severity}."

        if policy.invalidation_threshold > 0 and new_count >= policy.invalidation_threshold:
            new_state = "INVALIDATED"
            action_instruction = "INVALIDATE"
            session.review_status = "INVALIDATED"
            session.status = "FAILED"
            reason = f"Assessment invalidated: exceeded hard violation threshold ({new_count} warnings)."
        elif correlated:
            # Elevated escalation due to multiple concurrent signals
            new_state = "ESCALATED" if new_count < policy.review_required_threshold else "REVIEW_REQUIRED"
            reason = f"Increased integrity concern: correlated signals ({event.event_type} combined with face anomaly)."
            if new_state == "REVIEW_REQUIRED":
                session.review_status = "PENDING_REVIEW"
                action_instruction = "MARK_REVIEW_REQUIRED"
            else:
                action_instruction = "SHOW_WARNING"
        else:
            if new_count == 1:
                new_state = "WARNING"
                action_instruction = "SHOW_WARNING"
                reason = f"First integrity warning: {event.event_type}."
            elif new_count == 2:
                new_state = "REPEATED_WARNING"
                action_instruction = "SHOW_WARNING"
                reason = f"Repeated integrity warning (2/{policy.allowed_warning_count}): {event.event_type}."
            elif new_count < policy.review_required_threshold:
                new_state = "ESCALATED"
                action_instruction = "SHOW_WARNING"
                reason = f"Escalated integrity warning ({new_count}/{policy.allowed_warning_count}): {event.event_type}."
            else:
                new_state = "REVIEW_REQUIRED"
                action_instruction = "MARK_REVIEW_REQUIRED"
                session.review_status = "PENDING_REVIEW"
                reason = f"Integrity review required: accumulated {new_count} warnings."

        session.integrity_state = new_state
        session.action_instruction = action_instruction

        # 7. Append structured audit event
        audit = list(session.audit_events or [])
        audit.append({
            "event": f"INTEGRITY_STATE_{new_state}",
            "event_type": f"INTEGRITY_{new_state}",
            "timestamp": now.isoformat(),
            "metadata": {
                "warning_id": warning_id,
                "trigger_event": event.event_type,
                "warning_count": new_count,
                "reason": reason,
                "correlated": correlated
            }
        })
        session.audit_events = audit

        # 8. DecisionTrace Generation
        trace = self._create_decision_trace(session, event, new_state, reason, policy)

        self.db.commit()
        return new_state, action_instruction, new_warning, trace

    def acknowledge_warning(self, session_id: str, profile_id: str) -> Dict[str, Any]:
        """Processes learner acknowledgment of active warning banner."""
        session = self.db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment session not found")
        if session.profile_id != profile_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied (IDOR protection)")

        now = datetime.now(timezone.utc)
        active = session.active_warning

        if not active:
            return {
                "session_id": session.id,
                "acknowledged": True,
                "action_instruction": session.action_instruction or "CONTINUE",
                "integrity_state": session.integrity_state or "NORMAL",
                "message": "No active warning requiring acknowledgment."
            }

        # Archive active warning into history
        active["acknowledged"] = True
        active["acknowledged_at"] = now.isoformat()

        history = list(session.warning_history or [])
        history.append(active)
        session.warning_history = history
        session.active_warning = None

        # Reset action instruction if not invalidated or paused
        if session.action_instruction in {"SHOW_WARNING", "PAUSE_REQUIRED"}:
            session.action_instruction = "CONTINUE"

        audit = list(session.audit_events or [])
        audit.append({
            "event": "WARNING_ACKNOWLEDGED",
            "event_type": "WARNING_ACKNOWLEDGED",
            "timestamp": now.isoformat(),
            "metadata": {"warning_id": active.get("warning_id")}
        })
        session.audit_events = audit
        self.db.commit()

        return {
            "session_id": session.id,
            "acknowledged": True,
            "action_instruction": session.action_instruction,
            "integrity_state": session.integrity_state or "NORMAL",
            "message": "Warning acknowledged. You may continue your assessment."
        }

    def get_session_integrity_state(self, session_id: str, profile_id: str) -> Dict[str, Any]:
        """Retrieves authoritative integrity state for the session."""
        session = self.db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment session not found")
        if session.profile_id != profile_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied (IDOR protection)")

        policy = self.get_or_create_policy(session.assessment, session.mode)

        return {
            "session_id": session.id,
            "integrity_state": session.integrity_state or "NORMAL",
            "action_instruction": session.action_instruction or "CONTINUE",
            "warning_count": session.warning_count or 0,
            "allowed_warning_count": policy.allowed_warning_count,
            "last_warning_issued_at": session.last_warning_issued_at,
            "active_warning": session.active_warning,
            "review_status": session.review_status or "NOT_APPLICABLE",
            "monitoring_consent": session.monitoring_consent or "MONITORING_CONSENT_REQUIRED",
            "decision_trace_id": None
        }

    # -------------------------------------------------------------------------
    # Private Helpers
    # -------------------------------------------------------------------------

    def _handle_technical_interruption(
        self,
        session: AssessmentSession,
        policy: AssessmentIntegrityPolicy,
        event: AssessmentIntegrityEvent,
        now: datetime
    ) -> Tuple[str, str, Dict[str, Any], Optional[UniversalDecisionTrace]]:
        """Handles camera/monitoring hardware disruptions separately from behavioral misconduct."""
        msg = LEARNER_WARNING_MESSAGES.get(
            event.event_type,
            "Your camera connection was interrupted. Please restore camera access."
        )
        warning_id = f"tech_{uuid.uuid4().hex[:10]}"
        interruption_alert = {
            "warning_id": warning_id,
            "event_type": event.event_type,
            "message": msg,
            "severity": "MEDIUM",
            "timestamp": now.isoformat(),
            "acknowledged": False,
            "is_technical_interruption": True
        }
        session.active_warning = interruption_alert

        # Action: pause required if policy configured
        action = "PAUSE_REQUIRED" if policy.auto_pause_on_interruption else "SHOW_WARNING"
        state = session.integrity_state or "NORMAL"

        session.action_instruction = action
        session.integrity_state = state

        audit = list(session.audit_events or [])
        audit.append({
            "event": "TECHNICAL_MONITORING_INTERRUPTION",
            "event_type": "TECHNICAL_MONITORING_INTERRUPTION",
            "timestamp": now.isoformat(),
            "metadata": {"event_type": event.event_type, "action": action}
        })
        session.audit_events = audit
        self.db.commit()

        return state, action, interruption_alert, None

    def _is_actionable_event(self, event: AssessmentIntegrityEvent, policy: AssessmentIntegrityPolicy) -> bool:
        """Determines whether an event exceeds minimum confidence and duration thresholds."""
        dur = float(event.duration or 0.0)
        conf = float(event.confidence or 0.0) if event.confidence is not None else 0.70

        # Disregard INFO events (brief glances, low-confidence jitter)
        if event.severity == "INFO":
            return False

        # Specific duration checks
        if event.event_type in {"NO_FACE", "FACE_OUT_OF_FRAME"}:
            return dur >= 3.0
        elif event.event_type == "LOOKING_AWAY":
            return dur >= 4.0
        elif event.event_type == "MULTIPLE_FACES":
            return dur >= 2.0
        elif event.event_type in GADGET_EVENTS:
            return conf >= 0.50 and dur >= 1.5

        return dur >= 2.0

    def _evaluate_multi_signal_correlation(
        self,
        session: AssessmentSession,
        current_event: AssessmentIntegrityEvent
    ) -> bool:
        """Detects correlation between hardware detection and face deviation."""
        # Query recent events in session within last 60 seconds
        cutoff = datetime.now(timezone.utc) - timedelta(seconds=60)
        recent_events = self.db.query(AssessmentIntegrityEvent).filter(
            AssessmentIntegrityEvent.session_id == session.id,
            AssessmentIntegrityEvent.timestamp >= cutoff
        ).all()

        has_gadget = any(e.event_type in GADGET_EVENTS for e in recent_events) or (current_event.event_type in GADGET_EVENTS)
        has_face_anomaly = any(e.event_type in BEHAVIORAL_FACE_EVENTS for e in recent_events) or (current_event.event_type in BEHAVIORAL_FACE_EVENTS)

        return bool(has_gadget and has_face_anomaly)

    def _create_decision_trace(
        self,
        session: AssessmentSession,
        event: AssessmentIntegrityEvent,
        new_state: str,
        reason: str,
        policy: AssessmentIntegrityPolicy
    ) -> UniversalDecisionTrace:
        """Constructs an explainability trace recording the integrity escalation reasoning."""
        factor = DecisionFactor(
            name=f"Integrity Signal: {event.event_type}",
            weight=1.0,
            raw_score=float(event.confidence or 0.7),
            contribution=float(event.duration or 1.0),
            reason=f"Event {event.event_type} (duration={event.duration}s, severity={event.severity})"
        )
        evidence = DecisionEvidence(
            evidence_type="integrity_policy_evaluation",
            description=reason,
            source="IntegrityPolicyEngine"
        )
        return UniversalDecisionTrace(
            decision_type="integrity_escalation",
            profile_id=session.profile_id,
            target_role=getattr(session.assessment, "domain", "GENERAL"),
            decision=f"State transitioned to {new_state}",
            rationale=reason,
            factors=[factor],
            evidence=[evidence],
            affected_skills=[],
            recommended_action=session.action_instruction
        )
