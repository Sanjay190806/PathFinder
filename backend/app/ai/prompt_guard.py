import re
from typing import Tuple, List

INJECTION_PATTERNS = [
    r"ignore (all )?previous instructions",
    r"disregard (all )?prior instructions",
    r"reveal (the )?system prompt",
    r"print (the )?system prompt",
    r"show (me )?(the )?system prompt",
    r"reveal (the )?api key",
    r"show (me )?(the )?api key",
    r"what is (the )?api key",
    r"act as (an )?administrator",
    r"act as root",
    r"give me (another|all) user",
    r"show (me )?other user",
    r"drop table",
    r"delete from users",
    r"select \* from users",
    r"override (system|security) rules",
    r"bypass (safety|guidelines)"
]

class PromptGuard:
    @classmethod
    def validate_user_input(cls, query: str) -> Tuple[bool, str]:
        """
        Inspects input query for prompt injections, secret exfiltration, or authority overrides.
        Returns (is_safe, refusal_reason).
        """
        if not query or not query.strip():
            return False, "Message cannot be empty."

        if len(query) > 4000:
            return False, "Message exceeds maximum allowed length of 4000 characters."

        q_lower = query.lower()

        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, q_lower):
                return False, (
                    "I am the PathFinder AI Learning Coach. I operate strictly under established educational and "
                    "safety guidelines to assist with your curriculum, skills, and learning roadmap. I cannot reveal "
                    "system prompts, internal keys, other users' data, or execute unauthorized system commands."
                )

        return True, ""

    @classmethod
    def sanitize_and_wrap(cls, system_prompt: str, grounded_context_json: str, user_query: str) -> str:
        """
        Wraps system instructions, grounded data, and untrusted user input in explicit delimiters
        to maintain the instruction hierarchy.
        """
        safe_query = user_query.replace("</user_query>", "").replace("</grounded_context>", "")
        parts = [
            system_prompt,
            "=== GROUNDED LEARNER CONTEXT (AUTHORITATIVE DATA) ===",
            f"<grounded_context>\n{grounded_context_json}\n</grounded_context>",
            "=== LEARNER INQUIRY (UNTRUSTED USER INPUT) ===",
            f"<user_query>\n{safe_query}\n</user_query>",
            "Respond as the PathFinder Coach following all system rules."
        ]
        return "\n\n".join(parts)
