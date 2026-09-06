import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.schemas.assessment_quality import ItemQualityEvaluationRequest
from backend.app.assessment.quality_evaluator import AssessmentItemQualityEvaluator


def test_gold_standard_question():
    print("--- 1. Testing Gold Standard MCQ ---")
    req = ItemQualityEvaluationRequest(
        question_text="When grading footage in DaVinci Resolve, which primary control adjusts the darkest tonal regions without clipping sub-black information?",
        options=[
            "Lift wheel with luminance pedestal",
            "Gamma wheel with midtone offset",
            "Gain wheel with highlight slider",
            "Saturation curve with hue rotate"
        ],
        correct_option_index=0,
        difficulty="INTERMEDIATE",
        targeted_bloom_level="APPLY",
        skill_name="Color Grading",
        domain="Video Editing"
    )
    report = AssessmentItemQualityEvaluator.evaluate_item(req)
    print(f"IQS Score: {report.instrumental_quality_score}")
    print(f"Certification: {report.certification_level}")
    print(f"Approved for exam: {report.is_approved_for_exam}")
    print(f"Detected Bloom: {report.detected_bloom_level} (Target: {report.targeted_bloom_level})")
    print(f"Flesch Reading Ease: {report.flesch_reading_ease} ({report.reading_grade_level})")
    assert report.instrumental_quality_score >= 85.0, f"Expected >= 85, got {report.instrumental_quality_score}"
    assert report.is_approved_for_exam is True
    print("? Gold standard test PASSED\n")


def test_flawed_all_of_above():
    print("--- 2. Testing 'All of the above' Flaw ---")
    req = ItemQualityEvaluationRequest(
        question_text="Which features are included in modern video editing non-linear suites?",
        options=[
            "Multicam editing synchronized by waveform",
            "Proxy media generation for 4K playback",
            "Optical flow speed ramp interpolation",
            "All of the above"
        ],
        correct_option_index=3,
        difficulty="BEGINNER"
    )
    report = AssessmentItemQualityEvaluator.evaluate_item(req)
    print(f"IQS Score: {report.instrumental_quality_score}")
    print(f"Flaws: {report.flaws_detected}")
    assert any("All of the above" in f for f in report.flaws_detected), "Expected 'All of the above' flaw"
    print("? 'All of the above' flaw detection PASSED\n")


def test_length_disparity_giveaway():
    print("--- 3. Testing Option Length Disparity Giveaway ---")
    req = ItemQualityEvaluationRequest(
        question_text="What is the primary function of proxy media in a video editing workflow?",
        options=[
            "Faster export",
            "Lower resolution, lightweight intermediate copies of raw footage designed to accelerate timeline playback and smooth scrubbing on hardware with constrained CPU or GPU bandwidth",
            "Audio sync",
            "Color grade"
        ],
        correct_option_index=1,
        difficulty="INTERMEDIATE"
    )
    report = AssessmentItemQualityEvaluator.evaluate_item(req)
    print(f"IQS Score: {report.instrumental_quality_score}")
    print(f"Flaws: {report.flaws_detected}")
    assert any("conspicuously longer" in f for f in report.flaws_detected), "Expected length disparity flaw"
    print("? Length disparity giveaway detection PASSED\n")


def test_duplicate_options_ambiguity():
    print("--- 4. Testing Duplicate Options / Ambiguity ---")
    req = ItemQualityEvaluationRequest(
        question_text="Which video format is uncompressed audio container format?",
        options=[
            "Waveform Audio File Format PCM data",
            "WAV audio format uncompressed PCM data",
            "MPEG-4 Advanced Audio Coding",
            "FLAC lossless compressed"
        ],
        correct_option_index=0,
        difficulty="INTERMEDIATE"
    )
    report = AssessmentItemQualityEvaluator.evaluate_item(req)
    print(f"IQS Score: {report.instrumental_quality_score}")
    print(f"Flaws: {report.flaws_detected}")
    assert any("identical" in f.lower() or "overlap" in f.lower() for f in report.flaws_detected), "Expected duplicate option flaw"
    print("? Ambiguity detection PASSED\n")


def test_llm_artifact_detection():
    print("--- 5. Testing LLM Conversational Artifact Leakage ---")
    req = ItemQualityEvaluationRequest(
        question_text="Sure, here is a multiple choice question for video editing: What is dynamic link in Adobe Creative Cloud?",
        options=[
            "Live inter-application asset synchronization",
            "Offline render caching protocol",
            "Audio equalization plugin",
            "Cloud storage backup"
        ],
        correct_option_index=0,
        difficulty="INTERMEDIATE"
    )
    report = AssessmentItemQualityEvaluator.evaluate_item(req)
    print(f"IQS Score: {report.instrumental_quality_score}")
    print(f"Flaws: {report.flaws_detected}")
    assert any("artifact" in f.lower() for f in report.flaws_detected), "Expected LLM artifact flaw"
    print("? LLM artifact detection PASSED\n")


if __name__ == "__main__":
    test_gold_standard_question()
    test_flawed_all_of_above()
    test_length_disparity_giveaway()
    test_duplicate_options_ambiguity()
    test_llm_artifact_detection()
    print("========================================")
    print("ALL 5 INSTRUMENTAL QUALITY TESTS PASSED!")
    print("========================================")
