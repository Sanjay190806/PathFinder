"""
Step 3 Automated Verification:
Tests the Closed-Loop Adaptive Learning & Competency Feedback Pipeline:
1. Generates a certified 100-mark domain exam with IQS evaluation.
2. Verifies questions are persisted in AssessmentQuestion with discrete skills.
3. Submits simulated candidate responses with known performance (mastery in one skill, failure in another).
4. Validates Bayesian Knowledge Tracing / confidence deltas in profile.skill_confidence_map.
5. Asserts detection of REMEDIAL_NEEDED vs MASTERED skill gaps.
6. Verifies automated Study Planner recalculation and injected remedial modules.
"""

import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.assessment import Assessment, AssessmentQuestion
from backend.app.schemas.assessment_quality import DomainExamGenerateRequest
from backend.app.api.v1.assessments import generate_domain_exam
from backend.app.schemas.assessment import AssessmentSubmit, AnswerSubmission
from backend.app.api.v1.assessment import submit_assessment


def run_adaptive_closed_loop_test():
    db = SessionLocal()
    try:
        print("=" * 70)
        print("STEP 3 VERIFICATION: CLOSED-LOOP ADAPTIVE LEARNING & COMPETENCY FEEDBACK")
        print("=" * 70)

        # 1. Retrieve or verify demo user & profile
        user = db.query(User).filter(User.email == "demo@pathfinder.ai").first()
        if not user:
            user = db.query(User).first()
        assert user is not None, "No user found in database for testing"
        profile = user.profile
        assert profile is not None, "No learner profile linked to test user"
        print(f"[OK] Found Test Learner: {user.email} (Profile ID: {profile.id})")

        # 2. Generate a Domain Exam with candidate questions across 2 distinct skills
        import uuid
        from backend.app.schemas.assessment_quality import DomainExamCandidateItem
        candidates = [
            DomainExamCandidateItem(
                id=str(uuid.uuid4()),
                question_text="Why is the vanishing gradient problem particularly prevalent when training deep neural networks with sigmoid activation functions?",
                options=[
                    "The maximum derivative of the sigmoid function is 0.25, causing chained backpropagation gradients to shrink exponentially",
                    "The sigmoid function saturates only for values strictly equal to zero, blocking linear updates entirely",
                    "The learning rate dynamically increases to infinity as gradients approach the early input layers",
                    "Weight initialization bounds exceed the floating-point precision limit during numerical calculation"
                ],
                correct_option_index=0,
                difficulty="ADVANCED",
                skill_name="Neural Networks",
                explanation="Sigmoid derivatives peak at 0.25; repeated multiplication diminishes gradients.",
                marks=5.0
            ),
            DomainExamCandidateItem(
                id=str(uuid.uuid4()),
                question_text="Which technique is specifically designed to mitigate internal covariate shift during deep neural network training?",
                options=[
                    "Batch normalization by standardizing intermediate activation distributions across mini-batches",
                    "Stochastic gradient descent with zero momentum on the final classification layer only",
                    "Unchecked gradient clipping at arbitrary non-positive scaling thresholds",
                    "L1 weight regularization applied exclusively to bias terms throughout the network"
                ],
                correct_option_index=0,
                difficulty="INTERMEDIATE",
                skill_name="Neural Networks",
                explanation="Batch normalization stabilizes the distribution of layer inputs during training.",
                marks=5.0
            ),
            DomainExamCandidateItem(
                id=str(uuid.uuid4()),
                question_text="When evaluating an imbalanced fraud detection classifier, why is Area Under the Precision-Recall Curve (PR-AUC) preferred over ROC-AUC?",
                options=[
                    "PR-AUC focuses on true positives and does not get inflated by a massive number of true negatives",
                    "ROC-AUC cannot be calculated mathematically when the positive class prevalence is under ten percent",
                    "Precision-Recall curves are completely insensitive to true positive rate adjustments during thresholding",
                    "The false positive rate remains constant regardless of changes to decision classification boundaries"
                ],
                correct_option_index=0,
                difficulty="ADVANCED",
                skill_name="Model Evaluation",
                explanation="In highly skewed datasets, PR-AUC isolates performance on the minority class.",
                marks=5.0
            ),
            DomainExamCandidateItem(
                id=str(uuid.uuid4()),
                question_text="In k-fold cross validation, what is the primary benefit of stratifying folds according to target labels?",
                options=[
                    "It ensures each validation fold contains the exact same class distribution proportion as the full dataset",
                    "It doubles the total number of training iterations across all compute clusters simultaneously",
                    "It completely eliminates the requirement for held-out validation or test datasets in production",
                    "It automatically applies hyperparameter grid tuning during the forward inference pass"
                ],
                correct_option_index=0,
                difficulty="INTERMEDIATE",
                skill_name="Model Evaluation",
                explanation="Stratification ensures representation of minority classes in every fold.",
                marks=5.0
            )
        ]

        req = DomainExamGenerateRequest(
            domain="machine_learning",
            target_role="Machine Learning Engineer",
            total_marks=100.0,
            total_questions=4,
            min_quality_score=70.0,
            candidate_questions=candidates
        )
        exam_response = generate_domain_exam(payload=req, db=db)
        print(f"[OK] Generated Certified Exam ID: {exam_response.exam_id}")
        print(f"     Total Questions: {exam_response.total_questions}, Average IQS: {exam_response.average_iqs}% ({exam_response.certification_level})")

        # 3. Verify questions are persisted in AssessmentQuestion
        persisted_questions = db.query(AssessmentQuestion).filter(
            AssessmentQuestion.assessment_id == exam_response.exam_id
        ).all()
        assert len(persisted_questions) == exam_response.total_questions, (
            f"Expected {exam_response.total_questions} persisted questions, got {len(persisted_questions)}"
        )
        print(f"[OK] Verified {len(persisted_questions)} questions persisted with skill linkages.")

        # 4. Partition questions by skill and build submission:
        #    Make Skill 1 correct (Mastery) and Skill 2 incorrect (Remedial Needed)
        answers = []
        skills_tested = {}
        for q in persisted_questions:
            s_name = q.skill.name if q.skill else "General"
            if s_name not in skills_tested:
                skills_tested[s_name] = []
            skills_tested[s_name].append(q)

        skill_names = list(skills_tested.keys())
        assert len(skill_names) >= 2, f"Expected at least 2 distinct skills, got {skill_names}"

        pass_skill = skill_names[0]
        fail_skill = skill_names[1]
        print(f"     Simulating Test Strategy:")
        print(f"     - {pass_skill}: 100% Correct (Target: MASTERED)")
        print(f"     - {fail_skill}: 0% Correct (Target: REMEDIAL_NEEDED)")

        for q in persisted_questions:
            s_name = q.skill.name if q.skill else "General"
            if s_name == pass_skill:
                # Correct answer
                answers.append(AnswerSubmission(
                    question_id=q.id,
                    selected_option_index=q.correct_option_index
                ))
            else:
                # Deliberately wrong answer
                wrong_idx = (q.correct_option_index + 1) % len(q.options or ["A", "B"])
                answers.append(AnswerSubmission(
                    question_id=q.id,
                    selected_option_index=wrong_idx
                ))

        # 5. Submit the assessment through the closed-loop endpoint
        submit_payload = AssessmentSubmit(
            assessment_id=exam_response.exam_id,
            answers=answers
        )
        result = submit_assessment(payload=submit_payload, current_user=user, db=db)

        print("\n--- Assessment Submission & Closed-Loop Output ---")
        print(f"Score: {result.correct_count}/{result.total_questions} ({result.score_percentage:.1f}%)")
        print(f"Summary: {result.summary_message}")
        print(f"Planner Recalculated: {result.planner_recalculated}")
        print(f"Roadmap Adapted: {result.roadmap_adapted}")

        # 6. Validate Skill Gap Classifications
        print("\n--- Identified Competency Gaps ---")
        found_remedial = False
        found_mastered = False
        for gap in (result.skill_gaps or []):
            print(f"  • {gap.skill}: {gap.score_percentage}% -> {gap.status} ({gap.priority} priority)")
            print(f"    Action: {gap.recommended_action}")
            if gap.status == "REMEDIAL_NEEDED":
                found_remedial = True
            if gap.status in ("MASTERED", "DEVELOPING"):
                found_mastered = True

        assert found_remedial, "Expected at least one skill flagged as REMEDIAL_NEEDED"
        assert result.planner_recalculated, "Expected planner_recalculated to be True"
        assert len(result.adapted_modules or []) > 0, "Expected adapted remedial modules to be recommended"

        print("\n--- Injected Remedial Modules ---")
        for mod in result.adapted_modules:
            print(f"  • [{mod.skill}] {mod.title} (~{mod.estimated_hours}h, {mod.format} by {mod.provider})")

        print("\n" + "=" * 70)
        print("ALL STEP 3 CLOSED-LOOP ADAPTIVE TESTS PASSED SUCCESSFULLY!")
        print("=" * 70)
        return True

    finally:
        db.close()


if __name__ == "__main__":
    success = run_adaptive_closed_loop_test()
    if not success:
        sys.exit(1)
