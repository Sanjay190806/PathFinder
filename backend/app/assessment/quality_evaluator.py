import re
import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple, Set

from backend.app.schemas.assessment_quality import (
    ItemQualityEvaluationRequest,
    ItemQualityEvaluationReport,
    ItemQualityMetric,
    DistractorDetail,
)
from backend.app.core.logger import logger


class AssessmentItemQualityEvaluator:
    """
    Instrumental Quality Evaluation Engine for LLM-Generated Assessment Items.
    Implements psychometric validation, distractor plausibility analysis, key ambiguity checks,
    and cognitive depth alignment grounded in Bloom's Taxonomy.
    """

    # Bloom's Cognitive Operation Lexicon
    BLOOM_LEXICON: Dict[str, Set[str]] = {
        "REMEMBER": {
            "define", "list", "name", "recall", "identify", "state", "recognize",
            "which", "what", "who", "when", "where", "label", "match", "select"
        },
        "UNDERSTAND": {
            "explain", "describe", "summarize", "interpret", "clarify", "paraphrase",
            "classify", "indicate", "exemplify", "illustrate", "discuss", "represent"
        },
        "APPLY": {
            "calculate", "compute", "implement", "execute", "apply", "solve",
            "determine", "demonstrate", "modify", "operate", "use", "employ", "configure"
        },
        "ANALYZE": {
            "compare", "contrast", "differentiate", "distinguish", "diagnose",
            "troubleshoot", "deconstruct", "dissect", "examine", "investigate",
            "trace", "isolate", "correlate", "breakdown"
        },
        "EVALUATE": {
            "evaluate", "assess", "judge", "critique", "justify", "defend",
            "prioritize", "validate", "rate", "appraise", "select the best", "argue"
        },
        "CREATE": {
            "design", "architect", "formulate", "construct", "generate",
            "produce", "devise", "synthesize", "originate", "plan", "compose"
        }
    }

    # Expected Bloom's level based on declared difficulty
    DIFFICULTY_TO_BLOOM_TARGET = {
        "BEGINNER": ["REMEMBER", "UNDERSTAND"],
        "INTERMEDIATE": ["UNDERSTAND", "APPLY"],
        "ADVANCED": ["APPLY", "ANALYZE"],
        "EXPERT": ["ANALYZE", "EVALUATE", "CREATE"]
    }

    # Prohibited / Flawed Distractor Patterns
    FLAWED_PATTERNS = [
        (re.compile(r"\ball\s+of\s+the\s+above\b", re.IGNORECASE), "'All of the above' option reduces item discrimination."),
        (re.compile(r"\bnone\s+of\s+the\s+above\b", re.IGNORECASE), "'None of the above' option introduces construct-irrelevant variance."),
        (re.compile(r"\bboth\s+[a-d]\s+and\s+[a-d]\b", re.IGNORECASE), "Complex combination options ('Both A and B') weaken psychometric validity."),
        (re.compile(r"\bneither\s+[a-d]\s+nor\s+[a-d]\b", re.IGNORECASE), "Negative combination options ('Neither A nor B') distort difficulty estimation.")
    ]

    # LLM Hallucination / Leakage Artifacts
    LLM_ARTIFACT_PATTERNS = [
        re.compile(r"\b(as\s+an\s+ai|here\s+is\s+a\s+multiple|sure,\s+here|certainly!|let\s+me\s+know)\b", re.IGNORECASE),
        re.compile(r"```(json|python)?", re.IGNORECASE),
        re.compile(r"\b(\[insert\s+|TODO:|YOUR_ANSWER_HERE)\b", re.IGNORECASE),
    ]

    @classmethod
    def evaluate_item(
        cls,
        item: ItemQualityEvaluationRequest,
        question_id: Optional[str] = None
    ) -> ItemQualityEvaluationReport:
        """
        Runs comprehensive instrumental quality evaluation across all psychometric dimensions.
        """
        flaws: List[str] = []
        recommendations: List[str] = []
        metrics: Dict[str, ItemQualityMetric] = {}

        # 1. Evaluate Construct Validity & LLM Artifact Cleanliness
        validity_score, validity_flags, validity_recs = cls._evaluate_construct_validity(item)
        flaws.extend(validity_flags)
        recommendations.extend(validity_recs)
        metrics["construct_validity"] = ItemQualityMetric(
            name="Construct Validity & Artifact Cleanliness",
            score=validity_score,
            weight=0.15,
            status="PASS" if validity_score >= 80 else ("WARN" if validity_score >= 60 else "FAIL"),
            details=f"Factual cleanliness score {validity_score:.1f}/100 with {len(validity_flags)} detected irregularities.",
            recommendations=validity_recs
        )

        # 2. Evaluate Key Uniqueness & Ambiguity
        key_score, key_flags, key_recs = cls._evaluate_key_uniqueness(item)
        flaws.extend(key_flags)
        recommendations.extend(key_recs)
        metrics["key_uniqueness"] = ItemQualityMetric(
            name="Key Unambiguity & Stem Integrity",
            score=key_score,
            weight=0.30,
            status="PASS" if key_score >= 85 else ("WARN" if key_score >= 65 else "FAIL"),
            details=f"Answer key integrity scored {key_score:.1f}/100. Single correct answer verification.",
            recommendations=key_recs
        )

        # 3. Evaluate Distractor Plausibility, Length Symmetry & Discrimination
        dist_score, dist_analysis, dist_flags, dist_recs = cls._evaluate_distractors(item)
        flaws.extend(dist_flags)
        recommendations.extend(dist_recs)
        metrics["distractor_quality"] = ItemQualityMetric(
            name="Distractor Plausibility & Length Symmetry",
            score=dist_score,
            weight=0.25,
            status="PASS" if dist_score >= 80 else ("WARN" if dist_score >= 60 else "FAIL"),
            details=f"Distractor quality scored {dist_score:.1f}/100 across {len(dist_analysis)} options.",
            recommendations=dist_recs
        )

        # 4. Evaluate Cognitive Depth & Bloom's Taxonomy Alignment
        detected_bloom, target_bloom, bloom_score, bloom_flags, bloom_recs = cls._evaluate_bloom_alignment(item)
        flaws.extend(bloom_flags)
        recommendations.extend(bloom_recs)
        metrics["bloom_alignment"] = ItemQualityMetric(
            name="Cognitive Depth & Bloom's Alignment",
            score=bloom_score,
            weight=0.20,
            status="PASS" if bloom_score >= 75 else ("WARN" if bloom_score >= 55 else "FAIL"),
            details=f"Detected cognitive depth: {detected_bloom} (Targeted: {target_bloom}). Alignment: {bloom_score:.1f}/100.",
            recommendations=bloom_recs
        )

        # 5. Evaluate Readability & Cognitive Load
        flesch_score, grade_level, read_score, read_flags, read_recs = cls._evaluate_readability(item)
        flaws.extend(read_flags)
        recommendations.extend(read_recs)
        metrics["readability"] = ItemQualityMetric(
            name="Linguistic Clarity & Cognitive Load",
            score=read_score,
            weight=0.10,
            status="PASS" if read_score >= 75 else ("WARN" if read_score >= 55 else "FAIL"),
            details=f"Flesch Reading Ease: {flesch_score:.1f} ({grade_level}). Score: {read_score:.1f}/100.",
            recommendations=read_recs
        )

        # Calculate Composite Instrumental Quality Score (IQS)
        iqs = (
            key_score * 0.30 +
            dist_score * 0.25 +
            bloom_score * 0.20 +
            validity_score * 0.15 +
            read_score * 0.10
        )
        iqs = round(max(0.0, min(100.0, iqs)), 1)

        # Determine Certification Tier
        if iqs >= 88.0 and not any(m.status == "FAIL" for m in metrics.values()):
            certification_level = "EXCELLENT"
            is_approved = True
        elif iqs >= 75.0 and key_score >= 70.0:
            certification_level = "ACCEPTABLE"
            is_approved = True
        elif iqs >= 60.0:
            certification_level = "NEEDS_REVISION"
            is_approved = False
        else:
            certification_level = "REJECTED"
            is_approved = False

        return ItemQualityEvaluationReport(
            question_id=question_id,
            instrumental_quality_score=iqs,
            certification_level=certification_level,
            is_approved_for_exam=is_approved,
            key_uniqueness_score=round(key_score, 1),
            distractor_quality_score=round(dist_score, 1),
            bloom_alignment_score=round(bloom_score, 1),
            construct_validity_score=round(validity_score, 1),
            readability_score=round(read_score, 1),
            detected_bloom_level=detected_bloom,
            targeted_bloom_level=target_bloom,
            flesch_reading_ease=round(flesch_score, 1),
            reading_grade_level=grade_level,
            distractor_analysis=dist_analysis,
            metrics=metrics,
            flaws_detected=flaws,
            improvement_recommendations=list(dict.fromkeys(recommendations)),
            validated_at=datetime.now(timezone.utc).isoformat()
        )

    # -- Internal Evaluator Subroutines ---------------------------------------

    @classmethod
    def _evaluate_construct_validity(
        cls,
        item: ItemQualityEvaluationRequest
    ) -> Tuple[float, List[str], List[str]]:
        score = 100.0
        flags: List[str] = []
        recs: List[str] = []

        all_text = item.question_text + " " + " ".join(item.options) + " " + (item.explanation or "")

        # Check for LLM conversational remnants
        for pattern in cls.LLM_ARTIFACT_PATTERNS:
            if pattern.search(all_text):
                score -= 35.0
                flags.append("Detected raw LLM meta-prompt or conversational artifact in text.")
                recs.append("Strip conversational greetings and markdown wrapper tags from question content.")

        # Minimum length requirements
        stem = item.question_text.strip()
        if len(stem) < 20:
            score -= 25.0
            flags.append("Question stem is excessively short (<20 characters).")
            recs.append("Elaborate stem context to clearly articulate problem situation.")

        # Check for ungrounded negative phrasing ("Which is NOT...")
        if re.search(r"\b(not|except|never|false)\b", stem, re.IGNORECASE):
            if not re.search(r"\b(NOT|EXCEPT|NEVER)\b", stem):
                score -= 10.0
                flags.append("Negative stem phrasing detected without uppercase emphasis.")
                recs.append("Capitalize negative stem operators ('NOT', 'EXCEPT') to prevent candidate oversight.")

        return max(0.0, score), flags, recs

    @classmethod
    def _evaluate_key_uniqueness(
        cls,
        item: ItemQualityEvaluationRequest
    ) -> Tuple[float, List[str], List[str]]:
        score = 100.0
        flags: List[str] = []
        recs: List[str] = []

        if not (0 <= item.correct_option_index < len(item.options)):
            return 0.0, ["Correct option index is out of bounds."], ["Ensure correct option index accurately targets an available option."]

        correct_text = item.options[item.correct_option_index].strip()
        if not correct_text:
            return 0.0, ["Correct option text is empty."], ["Provide non-empty correct answer text."]

        # Check for duplicate options (exact or near-exact synonyms)
        words_per_opt = [set(cls._clean_words(opt)) for opt in item.options]
        for i in range(len(item.options)):
            for j in range(i + 1, len(item.options)):
                set_a = words_per_opt[i]
                set_b = words_per_opt[j]
                if not set_a or not set_b:
                    continue
                inter_len = len(set_a.intersection(set_b))
                union_len = len(set_a.union(set_b))
                jaccard = inter_len / union_len
                min_len = max(1, min(len(set_a), len(set_b)))
                overlap_ratio = inter_len / min_len
                if jaccard >= 0.50 or overlap_ratio >= 0.60:
                    score -= 30.0
                    flags.append(f"Options {i+1} and {j+1} have high conceptual overlap / identical synonymy ({overlap_ratio*100:.0f}% shared vocabulary).")
                    recs.append(f"Differentiate options {i+1} and {j+1} to avoid ambiguous answer selection.")

        # Stem completeness check (does it end with proper punctuation or interrogative?)
        stem = item.question_text.strip()
        if not (stem.endswith("?") or stem.endswith(":") or stem.endswith(".")):
            score -= 10.0
            flags.append("Question stem lacks terminal punctuation.")
            recs.append("Conclude stem with a clear interrogative question mark or colon.")

        return max(0.0, score), flags, recs

    @classmethod
    def _evaluate_distractors(
        cls,
        item: ItemQualityEvaluationRequest
    ) -> Tuple[float, List[DistractorDetail], List[str], List[str]]:
        score = 100.0
        flags: List[str] = []
        recs: List[str] = []
        analysis: List[DistractorDetail] = []

        correct_opt = item.options[item.correct_option_index].strip()
        correct_words = len(correct_opt.split())
        correct_chars = len(correct_opt)
        correct_word_set = set(cls._clean_words(correct_opt))

        distractor_chars: List[int] = []
        distractor_words: List[int] = []

        for idx, opt_text in enumerate(item.options):
            cleaned = opt_text.strip()
            w_count = len(cleaned.split())
            c_count = len(cleaned)
            is_correct = (idx == item.correct_option_index)

            opt_flags: List[str] = []

            # Check flawed patterns (all of the above, etc.)
            for pat, warning in cls.FLAWED_PATTERNS:
                if pat.search(cleaned):
                    score -= 15.0
                    flags.append(f"Option {idx+1}: {warning}")
                    opt_flags.append(warning)
                    recs.append("Replace meta-options ('All/None of the above') with plausible conceptual alternatives.")

            if not is_correct:
                distractor_chars.append(c_count)
                distractor_words.append(w_count)

                # Similarity to correct key
                dist_word_set = set(cls._clean_words(cleaned))
                jaccard = 0.0
                if correct_word_set and dist_word_set:
                    jaccard = len(correct_word_set.intersection(dist_word_set)) / len(correct_word_set.union(dist_word_set))

                # Plausibility rating
                if jaccard > 0.65:
                    plausibility = "HIGH"
                    opt_flags.append("Overlap with correct key is excessively high (possible double correct answer).")
                    score -= 10.0
                elif jaccard < 0.05 and c_count < 10:
                    plausibility = "TRIVIAL"
                    opt_flags.append("Distractor is conspicuously short and trivial.")
                    score -= 10.0
                elif jaccard >= 0.15:
                    plausibility = "HIGH"
                else:
                    plausibility = "MODERATE"

                length_ratio = round(c_count / max(1, correct_chars), 2)

                analysis.append(DistractorDetail(
                    index=idx,
                    text=cleaned,
                    char_length=c_count,
                    word_count=w_count,
                    relative_length_ratio=length_ratio,
                    jaccard_similarity_to_key=round(jaccard, 3),
                    plausibility_rating=plausibility,
                    flags=opt_flags
                ))

        # Check Length Parity / Clue Bias (Correct answer conspicuously longer/shorter)
        if distractor_chars:
            avg_dist_chars = sum(distractor_chars) / len(distractor_chars)
            length_ratio = correct_chars / max(1, avg_dist_chars)

            if length_ratio > 2.2:
                score -= 20.0
                flags.append(f"Correct answer is conspicuously longer ({length_ratio:.1f}x) than average distractor.")
                recs.append("Harmonize option lengths: expand distractors or make the correct option more concise.")
            elif length_ratio < 0.45:
                score -= 15.0
                flags.append(f"Correct answer is conspicuously shorter ({length_ratio:.1f}x) than average distractor.")
                recs.append("Ensure correct option matches length symmetry of distractors.")

        return max(0.0, score), analysis, flags, recs

    @classmethod
    def _evaluate_bloom_alignment(
        cls,
        item: ItemQualityEvaluationRequest
    ) -> Tuple[str, str, float, List[str], List[str]]:
        score = 100.0
        flags: List[str] = []
        recs: List[str] = []

        words = cls._clean_words(item.question_text.lower())
        bloom_hits: Dict[str, int] = {k: 0 for k in cls.BLOOM_LEXICON}

        for word in words:
            for level, keywords in cls.BLOOM_LEXICON.items():
                if word in keywords:
                    bloom_hits[level] += 1

        # Check scenario phrases for higher levels
        if re.search(r"\b(how would you|given the scenario|what would happen if|troubleshoot)\b", item.question_text, re.IGNORECASE):
            bloom_hits["ANALYZE"] += 2
        if re.search(r"\b(best approach|which is superior|evaluate whether|justify)\b", item.question_text, re.IGNORECASE):
            bloom_hits["EVALUATE"] += 2

        detected_level = max(bloom_hits.items(), key=lambda x: x[1])[0]
        if bloom_hits[detected_level] == 0:
            detected_level = "UNDERSTAND"  # default fallback

        target_level = item.targeted_bloom_level
        if not target_level:
            target_list = cls.DIFFICULTY_TO_BLOOM_TARGET.get(item.difficulty.upper(), ["UNDERSTAND", "APPLY"])
            target_level = target_list[-1]
        else:
            target_level = target_level.upper()

        level_order = ["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"]
        try:
            detected_idx = level_order.index(detected_level)
            target_idx = level_order.index(target_level)
            diff = abs(detected_idx - target_idx)
            if diff == 0:
                score = 100.0
            elif diff == 1:
                score = 85.0
            elif diff == 2:
                score = 65.0
                flags.append(f"Cognitive level mismatch: Question requires {detected_level} but target is {target_level}.")
                recs.append(f"Adjust question framing from {detected_level} toward {target_level} depth.")
            else:
                score = 45.0
                flags.append(f"Severe cognitive depth gap: Question is {detected_level} whereas target is {target_level}.")
                recs.append(f"Rewrite question to introduce rigorous {target_level} problem-solving constraints.")
        except ValueError:
            score = 80.0

        return detected_level, target_level, max(0.0, score), flags, recs

    @classmethod
    def _evaluate_readability(
        cls,
        item: ItemQualityEvaluationRequest
    ) -> Tuple[float, str, float, List[str], List[str]]:
        flags: List[str] = []
        recs: List[str] = []

        text = item.question_text.strip()
        words = cls._clean_words(text)
        num_words = max(1, len(words))

        # Sentence count estimation
        sentences = [s for s in re.split(r"[.!?]+", text) if s.strip()]
        num_sentences = max(1, len(sentences))

        # Syllable count estimation
        syllables = sum(cls._estimate_syllables(w) for w in words)

        # Flesch Reading Ease Formula
        words_per_sent = num_words / num_sentences
        syllables_per_word = syllables / num_words
        flesch_ease = 206.835 - (1.015 * words_per_sent) - (84.6 * syllables_per_word)
        flesch_ease = max(0.0, min(100.0, flesch_ease))

        if flesch_ease >= 70.0:
            grade_level = "Middle School / Clear"
            score = 100.0
        elif flesch_ease >= 50.0:
            grade_level = "High School / Standard"
            score = 90.0
        elif flesch_ease >= 30.0:
            grade_level = "College Undergraduate"
            score = 80.0
        else:
            grade_level = "Graduate / Academic (Dense)"
            score = 65.0
            flags.append(f"Question text has high linguistic density (Flesch score {flesch_ease:.1f}).")
            recs.append("Shorten complex sentence clauses to minimize construct-irrelevant reading burden.")

        if words_per_sent > 35:
            score -= 15.0
            flags.append(f"Average sentence length is excessive ({words_per_sent:.1f} words/sentence).")
            recs.append("Break long compound sentences into concise statements.")

        return flesch_ease, grade_level, max(0.0, score), flags, recs

    # -- Utility Helpers ------------------------------------------------------

    @staticmethod
    def _clean_words(text: str) -> List[str]:
        cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())
        return [w for w in cleaned.split() if w]

    @staticmethod
    def _estimate_syllables(word: str) -> int:
        w = word.lower()
        if len(w) <= 3:
            return 1
        w = re.sub(r"(?:[^laeiouy]|ed|es|e)$", "", w)
        w = re.sub(r"^y", "", w)
        syllables = len(re.findall(r"[aeiouy]{1,2}", w))
        return max(1, syllables)
