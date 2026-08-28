from typing import List, Dict, Any

CURATED_SCENARIOS: List[Dict[str, Any]] = [
    {
        "slug": "production-inference-latency-spike",
        "title": "Production Transformer Inference Latency Spike",
        "description": "P99 inference latency jumped from 45ms to 850ms under peak traffic. Diagnose the root cause and execute mitigation.",
        "scenario_type": "Incident Response",
        "career_roles": ["AI/ML Engineer", "Software Engineer"],
        "skills": ["python", "deep-learning", "transformers", "mlops"],
        "difficulty": "Intermediate",
        "context_data": {
            "p99_latency_ms": 850,
            "gpu_vram_utilization_pct": 98,
            "batch_size_dynamic": False,
            "error_log_sample": "CUDA out-of-memory avoidance trigger: fallback to host memory pinned paging."
        },
        "available_actions": [
            {"id": "act_dynamic_batching", "text": "Enable dynamic tensor batching and KV-cache quantization."},
            {"id": "act_host_fallback", "text": "Route overflow traffic to CPU host memory pool."},
            {"id": "act_rate_limit", "text": "Apply immediate 503 load shedding at the API gateway."}
        ],
        "constraints": ["Zero data loss on active requests", "SLA recovery within 3 minutes"],
        "correct_actions": ["act_dynamic_batching", "act_rate_limit"],
        "time_limit_minutes": 25
    },
    {
        "slug": "lateral-movement-incident",
        "title": "Suspicious Lateral Movement via SSH Jump Host",
        "description": "Security alerts show repeated credential reuse from an internal staging node across production clusters.",
        "scenario_type": "Incident Response",
        "career_roles": ["Cybersecurity Analyst", "Cloud / DevOps Engineer"],
        "skills": ["networking", "linux", "web-security", "pentesting"],
        "difficulty": "Intermediate",
        "context_data": {
            "source_ip": "10.0.4.12",
            "alert_severity": "HIGH",
            "failed_auth_count": 42,
            "target_services": ["prod-db-01", "vault-primary"]
        },
        "available_actions": [
            {"id": "act_isolate_host", "text": "Isolate staging node 10.0.4.12 via security group firewall rules."},
            {"id": "act_revoke_keys", "text": "Revoke compromised SSH keys and rotate administrative credentials."},
            {"id": "act_ignore_burst", "text": "Whitelist the staging IP as a legitimate test harness."}
        ],
        "constraints": ["Do not disrupt production DB queries", "Preserve memory dump for forensic analysis"],
        "correct_actions": ["act_isolate_host", "act_revoke_keys"],
        "time_limit_minutes": 20
    }
]
