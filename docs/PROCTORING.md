# PathFinder Privacy-Conscious Integrity & Proctoring Subsystem
**Phase 10: Client-Side Edge Detection, Debounced Events & Authoritative Policy Engine**

---

## 1. Privacy Principles
1. **Zero Unnecessary Video/Audio Storage**: Raw webcam video and audio streams are never transmitted to or stored on backend servers.
2. **Explicit Consent Lifecycle**: Camera activates only after explicit learner consent for monitored exams.
3. **Automatic Camera Termination**: Camera monitoring halts immediately upon exam submission, timer expiry, abandonment, or route change.
4. **Probabilistic Nature**: Detections are probabilistic cues for proctoring review, never converted into automated "cheating verdicts".

## 2. Detection Capabilities
- **Webcam Integrity (`integrity_monitor.py`)**: Face presence, face absence, multiple faces detected.
- **Gadget & Phone Detection (`gadget_detection.py`)**: Unauthorized mobile device detection with confidence calibration.
- **Client Debouncing**: Events are client-debounced to prevent event flooding on intermittent camera glitches.

## 3. Authoritative Policy Engine (`integrity_policy_engine.py`)
- Centralized server rules process incoming events through cooldown windows.
- Proportionate response escalation:
  $$\text{Detection} \rightarrow \text{Confidence} \rightarrow \text{Warning} \rightarrow \text{Escalation} \rightarrow \text{Review Required} \rightarrow \text{Invalidation}$$
- Academic scores and integrity states remain strictly isolated in result summaries.
