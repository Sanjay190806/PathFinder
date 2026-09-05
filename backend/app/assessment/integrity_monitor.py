import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.assessment import (
    Assessment, AssessmentSession, AssessmentIntegrityEvent
)
from backend.app.schemas.assessment_blueprint import (
    IntegrityEventCreate, IntegrityEventOut,
    IntegrityMonitoringConsentRequest, IntegrityMonitoringConsentResponse,
    IntegritySummaryOut
)

VALID_FACE_EVENTS = {
    "NO_FACE", "MULTIPLE_FACES", "LOOKING_AWAY", "FACE_OUT_OF_FRAME",
    "CAMERA_OFF", "PERMISSION_DENIED", "CAMERA_INTERRUPTED", "MONITORING_INTERRUPTED"
}

VALID_GADGET_EVENTS = {
    "POSSIBLE_PHONE", "POSSIBLE_TABLET", "POSSIBLE_SECOND_SCREEN",
    "POSSIBLE_SMART_DEVICE", "POSSIBLE_HEADPHONES", "POSSIBLE_OTHER_GADGET",
    "POSSIBLE_UNKNOWN_DEVICE"
}

ALL_INTEGRITY_EVENTS = VALID_FACE_EVENTS | VALID_GADGET_EVENTS

DEBOUNCE_COOLDOWN_SECONDS = 5.0


class IntegrityMonitor:
    """
    Privacy-first, assistive integrity monitoring and gadget detection engine.
    Processes structured browser telemetry, applies smart debouncing, validates
    session ownership, enforces monitoring policies, and prepares multi-signal correlation.
    """

    def __init__(self, db: Session):
        self.db = db

    def _get_authorized_session(self, session_id: str, profile_id: str) -> AssessmentSession:
        """Retrieves session with strict IDOR verification."""
        session = self.db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment session not found")
        if session.profile_id != profile_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to assessment session denied (IDOR protection)")
        return session

    def record_consent(
        self,
        session_id: str,
        profile_id: str,
        request: IntegrityMonitoringConsentRequest
    ) -> IntegrityMonitoringConsentResponse:
        """
        Records learner consent decision for webcam & device integrity monitoring.
        Enforces assessment monitoring policy (REQUIRED vs OPTIONAL / WARNING_ONLY).
        """
        session = self._get_authorized_session(session_id, profile_id)
        assessment = session.assessment
        policy = getattr(assessment, "integrity_monitoring_policy", "WARNING_ONLY") or "WARNING_ONLY"

        consent_decision = request.consent.strip().upper()
        if consent_decision not in {"CONSENT_GRANTED", "CONSENT_DENIED"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid consent value '{request.consent}'. Must be CONSENT_GRANTED or CONSENT_DENIED."
            )

        now = datetime.now(timezone.utc)

        if consent_decision == "CONSENT_DENIED":
            if policy == "REQUIRED":
                session.monitoring_consent = "CONSENT_DENIED"
                self.db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Webcam integrity monitoring is strictly required for this certified assessment."
                )
            else:
                session.monitoring_consent = "CONSENT_DENIED"
                session.monitoring_started_at = None
                status_msg = "DENIED"
                user_msg = "Integrity monitoring declined. Assessment proceeding without camera supervision."
        else:
            session.monitoring_consent = "CONSENT_GRANTED"
            session.monitoring_started_at = now
            status_msg = "ACTIVE"
            user_msg = "Consent granted. Assistive integrity monitoring initialized."

        # Audit event
        audit = list(session.audit_events or [])
        audit.append({
            "event": f"MONITORING_{consent_decision}",
            "event_type": f"MONITORING_{consent_decision}",
            "timestamp": now.isoformat(),
            "metadata": {"policy": policy}
        })
        session.audit_events = audit
        self.db.commit()

        return IntegrityMonitoringConsentResponse(
            session_id=session.id,
            monitoring_consent=session.monitoring_consent,
            monitoring_status=status_msg,
            message=user_msg
        )

    def record_event(
        self,
        session_id: str,
        profile_id: str,
        payload: IntegrityEventCreate
    ) -> IntegrityEventOut:
        """
        Ingests structured integrity event with server-side validation, IDOR protection,
        privilege checks, smart debouncing, and authoritative severity normalization.
        """
        session = self._get_authorized_session(session_id, profile_id)

        # 1. State Validation: must be active
        if session.status in {"COMPLETED", "SUBMITTED", "EXPIRED", "PASSED", "FAILED"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot record integrity events for finalized session with status '{session.status}'."
            )

        # 2. Source Privilege: reject client manual review spoofing
        src = (payload.source or "BROWSER_CAMERA").upper()
        if src == "MANUAL_REVIEW":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Learners are not permitted to submit MANUAL_REVIEW integrity events."
            )

        # 3. Event Type Validation
        evt_type = payload.event_type.strip().upper()
        if evt_type not in ALL_INTEGRITY_EVENTS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown integrity event type '{payload.event_type}'."
            )

        # 4. Confidence Clamping
        conf = payload.confidence
        if conf is not None:
            conf = max(0.0, min(1.0, float(conf)))

        # 5. Timestamp validation
        now = datetime.now(timezone.utc)
        evt_time = payload.timestamp.replace(tzinfo=timezone.utc) if payload.timestamp and payload.timestamp.tzinfo is None else (payload.timestamp or now)
        if evt_time > now + timedelta(seconds=60):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Integrity event timestamp cannot be in the future."
            )

        dur = max(0.0, float(payload.duration or 0.0))

        # 6. Authoritative Severity Normalization (server-side calculation)
        norm_severity = self._normalize_severity(
            evt_type=evt_type,
            duration=dur,
            confidence=conf,
            policy=getattr(session.assessment, "integrity_monitoring_policy", "WARNING_ONLY") or "WARNING_ONLY"
        )

        # 7. Smart Debouncing & Duration Aggregation
        cutoff = now - timedelta(seconds=DEBOUNCE_COOLDOWN_SECONDS)
        recent_match = self.db.query(AssessmentIntegrityEvent).filter(
            AssessmentIntegrityEvent.session_id == session.id,
            AssessmentIntegrityEvent.event_type == evt_type,
            AssessmentIntegrityEvent.timestamp >= cutoff
        ).order_by(AssessmentIntegrityEvent.timestamp.desc()).first()

        if recent_match:
            # Aggregate duration and update confidence / timestamp
            recent_match.duration = round((recent_match.duration or 0.0) + max(1.0, dur), 1)
            recent_match.timestamp = now
            if conf is not None:
                recent_match.confidence = max(recent_match.confidence or 0.0, conf)
            recent_match.severity = self._normalize_severity(
                evt_type=evt_type,
                duration=recent_match.duration,
                confidence=recent_match.confidence,
                policy=getattr(session.assessment, "integrity_monitoring_policy", "WARNING_ONLY") or "WARNING_ONLY"
            )
            self.db.commit()
            self.db.refresh(recent_match)
            from backend.app.assessment.integrity_policy_engine import IntegrityPolicyEngine
            IntegrityPolicyEngine(self.db).evaluate_event(session, recent_match)
            return self._to_event_out(recent_match)

        # 8. Create new record
        event_record = AssessmentIntegrityEvent(
            id=str(uuid.uuid4()),
            session_id=session.id,
            profile_id=session.profile_id,
            assessment_id=session.assessment_id,
            event_type=evt_type,
            timestamp=evt_time,
            duration=dur,
            confidence=conf,
            severity=norm_severity,
            source=src,
            metadata_minimized=payload.metadata_minimized or {}
        )
        self.db.add(event_record)

        # Log audit event
        audit = list(session.audit_events or [])
        audit.append({
            "event": "INTEGRITY_EVENT_RECORDED",
            "event_type": "INTEGRITY_EVENT_RECORDED",
            "timestamp": now.isoformat(),
            "metadata": {
                "event_type": evt_type,
                "severity": norm_severity,
                "confidence": conf
            }
        })
        session.audit_events = audit

        self.db.commit()
        self.db.refresh(event_record)
        from backend.app.assessment.integrity_policy_engine import IntegrityPolicyEngine
        IntegrityPolicyEngine(self.db).evaluate_event(session, event_record)
        return self._to_event_out(event_record)

    def get_integrity_summary(self, session_id: str, profile_id: str) -> IntegritySummaryOut:
        """
        Aggregates all integrity and gadget events into categorized summary counts
        and prepares multi-signal correlation flags.
        """
        session = self._get_authorized_session(session_id, profile_id)
        assessment = session.assessment

        events = self.db.query(AssessmentIntegrityEvent).filter(
            AssessmentIntegrityEvent.session_id == session.id
        ).order_by(AssessmentIntegrityEvent.timestamp.desc()).all()

        face_abs = sum(1 for e in events if e.event_type == "NO_FACE")
        multi_face = sum(1 for e in events if e.event_type == "MULTIPLE_FACES")
        looking_away = sum(1 for e in events if e.event_type == "LOOKING_AWAY")
        out_of_frame = sum(1 for e in events if e.event_type == "FACE_OUT_OF_FRAME")
        cam_outage = sum(1 for e in events if e.event_type in {"CAMERA_OFF", "PERMISSION_DENIED"})

        phone_cnt = sum(1 for e in events if e.event_type == "POSSIBLE_PHONE")
        tablet_cnt = sum(1 for e in events if e.event_type == "POSSIBLE_TABLET")
        headphone_cnt = sum(1 for e in events if e.event_type == "POSSIBLE_HEADPHONES")
        other_gadget_cnt = sum(1 for e in events if e.event_type in {
            "POSSIBLE_SECOND_SCREEN", "POSSIBLE_SMART_DEVICE", "POSSIBLE_OTHER_GADGET", "POSSIBLE_UNKNOWN_DEVICE"
        })
        total_devices = phone_cnt + tablet_cnt + headphone_cnt + other_gadget_cnt

        high_conf = sum(1 for e in events if (e.confidence and e.confidence >= 0.8) or e.severity == "HIGH")
        warning_candidates = sum(1 for e in events if e.severity in {"MEDIUM", "HIGH"})

        # Multi-signal correlation: device detected AND prolonged face absence / deviation
        multi_signal = bool(total_devices > 0 and (face_abs > 0 or looking_away > 0 or multi_face > 0))

        recent_out = [self._to_event_out(e) for e in events[:20]]

        return IntegritySummaryOut(
            session_id=session.id,
            monitoring_policy=getattr(assessment, "integrity_monitoring_policy", "WARNING_ONLY") or "WARNING_ONLY",
            gadget_detection_enabled=bool(getattr(assessment, "gadget_detection_enabled", True)),
            monitoring_consent=session.monitoring_consent or "MONITORING_CONSENT_REQUIRED",
            face_absence_events=face_abs,
            multiple_face_events=multi_face,
            looking_away_events=looking_away,
            face_out_of_frame_events=out_of_frame,
            camera_outage_events=cam_outage,
            total_device_events=total_devices,
            phone_events=phone_cnt,
            tablet_events=tablet_cnt,
            headphones_events=headphone_cnt,
            other_gadget_events=other_gadget_cnt,
            high_confidence_events=high_conf,
            total_integrity_events=len(events),
            warning_candidates_count=warning_candidates,
            multi_signal_warning_candidate=multi_signal,
            recent_events=recent_out
        )

    def shutdown_monitoring(self, session_id: str):
        """Halts integrity monitoring when assessment terminates."""
        session = self.db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
        if not session:
            return

        now = datetime.now(timezone.utc)
        session.monitoring_consent = "MONITORING_STOPPED"
        session.monitoring_ended_at = now

        audit = list(session.audit_events or [])
        audit.append({
            "event": "MONITORING_STOPPED",
            "event_type": "MONITORING_STOPPED",
            "timestamp": now.isoformat(),
            "metadata": {}
        })
        session.audit_events = audit
        self.db.commit()

    def _normalize_severity(
        self,
        evt_type: str,
        duration: float,
        confidence: Optional[float],
        policy: str
    ) -> str:
        """Authoritatively classifies event severity without trusting arbitrary client input."""
        if evt_type == "NO_FACE":
            if duration < 3.0:
                return "INFO"
            elif duration < 8.0:
                return "LOW"
            elif duration < 15.0:
                return "MEDIUM"
            return "HIGH"

        elif evt_type == "MULTIPLE_FACES":
            return "HIGH" if duration >= 5.0 else "MEDIUM"

        elif evt_type == "LOOKING_AWAY":
            if duration < 4.0:
                return "INFO"
            elif duration < 10.0:
                return "LOW"
            return "MEDIUM"

        elif evt_type == "FACE_OUT_OF_FRAME":
            return "MEDIUM" if duration >= 5.0 else "LOW"

        elif evt_type in VALID_GADGET_EVENTS:
            # Device events
            conf = confidence or 0.7
            if conf < 0.5:
                return "INFO"
            elif conf < 0.8:
                return "HIGH" if duration >= 5.0 else "MEDIUM"
            else:
                return "HIGH" if duration >= 2.0 else "MEDIUM"

        elif evt_type in {"CAMERA_OFF", "PERMISSION_DENIED", "CAMERA_INTERRUPTED", "MONITORING_INTERRUPTED"}:
            return "HIGH" if policy == "REQUIRED" else "MEDIUM"

        return "INFO"

    def _to_event_out(self, record: AssessmentIntegrityEvent) -> IntegrityEventOut:
        return IntegrityEventOut(
            id=record.id,
            session_id=record.session_id,
            profile_id=record.profile_id,
            learner_id=record.profile_id,
            assessment_id=record.assessment_id,
            event_type=record.event_type,
            timestamp=record.timestamp,
            duration=record.duration,
            confidence=record.confidence,
            severity=record.severity,
            source=record.source,
            metadata_minimized=record.metadata_minimized or {},
            created_at=record.created_at
        )
