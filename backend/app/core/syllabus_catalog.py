from typing import List, Dict, Any

MULTI_DOMAIN_SYLLABUS_REGISTRY: List[Dict[str, Any]] = [
    # 1. AI/ML Engineering
    {
        "course_slug": "machine-learning-specialization",
        "title": "Machine Learning & Neural Networks Comprehensive",
        "description": "Foundational and applied machine learning covering supervised learning, neural networks, and model evaluation.",
        "language": "English",
        "source": "OFFICIAL_PROVIDER",
        "provider": "DeepLearning.AI / Coursera",
        "verification_status": "VERIFIED",
        "modules": [
            {
                "title": "Module 1: Supervised Learning Fundamentals",
                "description": "Linear and logistic regression, cost functions, gradient descent",
                "order_index": 1,
                "weight": 30.0,
                "estimated_learning_hours": 10.0,
                "topics": [
                    {
                        "title": "Linear Regression and Gradient Descent",
                        "description": "Univariate and multivariate regression models",
                        "order_index": 1,
                        "weight": 50.0,
                        "difficulty": "Beginner",
                        "estimated_learning_hours": 5.0,
                        "subtopics": [
                            {"title": "Cost Function Formulation", "description": "Mean Squared Error", "order_index": 1, "difficulty": "Beginner"},
                            {"title": "Gradient Descent Convergence", "description": "Learning rates and convergence", "order_index": 2, "difficulty": "Intermediate"}
                        ],
                        "objectives": [
                            {"objective": "Formulate and minimize cost function using gradient descent", "objective_type": "APPLY", "skill_ids": ["machine-learning", "linear-regression"], "difficulty": "Intermediate", "importance": "HIGH"},
                            {"objective": "Understand vectorization and matrix operations in regression", "objective_type": "UNDERSTAND", "skill_ids": ["python", "linear-algebra"], "difficulty": "Beginner", "importance": "MEDIUM"}
                        ],
                        "skills": [{"skill_id": "machine-learning", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.9}]
                    },
                    {
                        "title": "Classification and Logistic Regression",
                        "description": "Binary classification, decision boundary, sigmoid function",
                        "order_index": 2,
                        "weight": 50.0,
                        "difficulty": "Intermediate",
                        "estimated_learning_hours": 5.0,
                        "subtopics": [
                            {"title": "Sigmoid Activation", "description": "Log-odds mapping", "order_index": 1, "difficulty": "Beginner"}
                        ],
                        "objectives": [
                            {"objective": "Implement logistic regression decision boundaries", "objective_type": "IMPLEMENT", "skill_ids": ["machine-learning"], "difficulty": "Intermediate", "importance": "HIGH"}
                        ],
                        "skills": [{"skill_id": "machine-learning", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.9}]
                    }
                ]
            },
            {
                "title": "Module 2: Neural Networks & Deep Learning",
                "description": "Multilayer perceptrons, backpropagation, activation functions",
                "order_index": 2,
                "weight": 40.0,
                "estimated_learning_hours": 14.0,
                "topics": [
                    {
                        "title": "Forward and Backward Propagation",
                        "description": "Chain rule and parameter updates",
                        "order_index": 1,
                        "weight": 50.0,
                        "difficulty": "Intermediate",
                        "estimated_learning_hours": 7.0,
                        "subtopics": [
                            {"title": "Activation Functions", "description": "ReLU, LeakyReLU, Softmax", "order_index": 1, "difficulty": "Intermediate"}
                        ],
                        "objectives": [
                            {"objective": "Calculate gradients and backpropagate errors across layers", "objective_type": "ANALYZE", "skill_ids": ["deep-learning", "calculus"], "difficulty": "Intermediate", "importance": "HIGH"}
                        ],
                        "skills": [{"skill_id": "deep-learning", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.9}]
                    },
                    {
                        "title": "Regularization and Hyperparameter Tuning",
                        "description": "Dropout, L1/L2 regularization, batch normalization",
                        "order_index": 2,
                        "weight": 50.0,
                        "difficulty": "Advanced",
                        "estimated_learning_hours": 7.0,
                        "subtopics": [],
                        "objectives": [
                            {"objective": "Prevent model overfitting using dropout and weight decay", "objective_type": "DEBUG", "skill_ids": ["deep-learning"], "difficulty": "Advanced", "importance": "HIGH"}
                        ],
                        "skills": [{"skill_id": "deep-learning", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.85}]
                    }
                ]
            },
            {
                "title": "Module 3: Evaluation Metrics & Practical Production",
                "description": "Precision, Recall, ROC-AUC, cross-validation, deployment",
                "order_index": 3,
                "weight": 30.0,
                "estimated_learning_hours": 8.0,
                "topics": [
                    {
                        "title": "Model Evaluation and Diagnostics",
                        "description": "Confusion matrix, bias-variance tradeoff",
                        "order_index": 1,
                        "weight": 100.0,
                        "difficulty": "Intermediate",
                        "estimated_learning_hours": 8.0,
                        "subtopics": [
                            {"title": "F1-Score and ROC Curves", "description": "Imbalanced classification metrics", "order_index": 1, "difficulty": "Intermediate"}
                        ],
                        "objectives": [
                            {"objective": "Evaluate model trade-offs between precision and recall", "objective_type": "EVALUATE", "skill_ids": ["machine-learning"], "difficulty": "Intermediate", "importance": "HIGH"}
                        ],
                        "skills": [{"skill_id": "machine-learning", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.9}]
                    }
                ]
            }
        ]
    },

    # 2. VLSI & Hardware Engineering
    {
        "course_slug": "vlsi-design-verilog",
        "title": "Digital VLSI Design & Verilog HDL",
        "description": "Hardware description languages, combinational/sequential logic, ASIC synthesis.",
        "language": "English",
        "source": "INSTITUTION",
        "provider": "NPTEL / IIT Madras",
        "verification_status": "VERIFIED",
        "modules": [
            {
                "title": "Module 1: Combinational and Sequential Circuits in Verilog",
                "description": "Gate level modeling, behavioral modeling, finite state machines",
                "order_index": 1,
                "weight": 50.0,
                "estimated_learning_hours": 12.0,
                "topics": [
                    {
                        "title": "RTL Design with Verilog HDL",
                        "description": "Always blocks, blocking vs non-blocking assignments",
                        "order_index": 1,
                        "weight": 100.0,
                        "difficulty": "Intermediate",
                        "estimated_learning_hours": 12.0,
                        "subtopics": [
                            {"title": "Synchronous FSM Design", "description": "Moore and Mealy state machines", "order_index": 1, "difficulty": "Intermediate"}
                        ],
                        "objectives": [
                            {"objective": "Design synthesizable finite state machines in Verilog", "objective_type": "DESIGN", "skill_ids": ["verilog", "digital-electronics"], "difficulty": "Intermediate", "importance": "HIGH"}
                        ],
                        "skills": [{"skill_id": "verilog", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.9}]
                    }
                ]
            },
            {
                "title": "Module 2: Static Timing Analysis & ASIC Synthesis",
                "description": "Setup and hold time constraints, clock tree synthesis, DRC/LVS",
                "order_index": 2,
                "weight": 50.0,
                "estimated_learning_hours": 14.0,
                "topics": [
                    {
                        "title": "Timing Closure and Slack Analysis",
                        "description": "Setup/hold margins, clock skew, jitter",
                        "order_index": 1,
                        "weight": 100.0,
                        "difficulty": "Advanced",
                        "estimated_learning_hours": 14.0,
                        "subtopics": [
                            {"title": "Constraint Generation (SDC)", "description": "Synopsys Design Constraints", "order_index": 1, "difficulty": "Advanced"}
                        ],
                        "objectives": [
                            {"objective": "Analyze setup and hold violations and compute slack", "objective_type": "ANALYZE", "skill_ids": ["vlsi-design"], "difficulty": "Advanced", "importance": "HIGH"}
                        ],
                        "skills": [{"skill_id": "vlsi-design", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.95}]
                    }
                ]
            }
        ]
    },

    # 3. Mechanical Engineering / CAD
    {
        "course_slug": "solidworks-mechanical-cad",
        "title": "Mechanical Design & Parametric CAD Modeling",
        "description": "3D parametric part modeling, assembly, geometric dimensioning, and tolerances (GD&T).",
        "language": "English",
        "source": "OFFICIAL_PROVIDER",
        "provider": "NPTEL / IIT Roorkee",
        "verification_status": "VERIFIED",
        "modules": [
            {
                "title": "Module 1: Parametric 3D Sketching and Features",
                "description": "Extrudes, cuts, lofts, sweeps, and parametric relations",
                "order_index": 1,
                "weight": 50.0,
                "estimated_learning_hours": 10.0,
                "topics": [
                    {
                        "title": "Part Modeling Fundamentals",
                        "description": "Fully defined sketches and datum planes",
                        "order_index": 1,
                        "weight": 100.0,
                        "difficulty": "Beginner",
                        "estimated_learning_hours": 10.0,
                        "subtopics": [],
                        "objectives": [
                            {"objective": "Construct fully constrained 2D sketches and 3D base features", "objective_type": "IMPLEMENT", "skill_ids": ["cad-modeling"], "difficulty": "Beginner", "importance": "HIGH"}
                        ],
                        "skills": [{"skill_id": "cad-modeling", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.9}]
                    }
                ]
            },
            {
                "title": "Module 2: Assemblies and Geometric Dimensioning (GD&T)",
                "description": "Mates, degrees of freedom, interference checks, ASME Y14.5 standards",
                "order_index": 2,
                "weight": 50.0,
                "estimated_learning_hours": 12.0,
                "topics": [
                    {
                        "title": "Top-Down Assembly and Tolerancing",
                        "description": "Concentric, coincident mates, tolerance stacks",
                        "order_index": 1,
                        "weight": 100.0,
                        "difficulty": "Intermediate",
                        "estimated_learning_hours": 12.0,
                        "subtopics": [],
                        "objectives": [
                            {"objective": "Assemble multi-body components and verify interference", "objective_type": "EVALUATE", "skill_ids": ["cad-modeling", "engineering-design"], "difficulty": "Intermediate", "importance": "HIGH"}
                        ],
                        "skills": [{"skill_id": "cad-modeling", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.9}]
                    }
                ]
            }
        ]
    },

    # 4. Commerce & Financial Analysis
    {
        "course_slug": "financial-accounting-valuation",
        "title": "Financial Statement Analysis & Corporate Valuation",
        "description": "P&L, Balance Sheet, Cash Flow modeling, DCF valuation, and ratio analysis.",
        "language": "English",
        "source": "INSTITUTION",
        "provider": "IIM Bangalore",
        "verification_status": "VERIFIED",
        "modules": [
            {
                "title": "Module 1: Financial Statement Interlinkage",
                "description": "Three statement modeling and working capital management",
                "order_index": 1,
                "weight": 50.0,
                "estimated_learning_hours": 10.0,
                "topics": [
                    {
                        "title": "Cash Flow and Working Capital Analysis",
                        "description": "Operating cash flow, EBITDA adjustments",
                        "order_index": 1,
                        "weight": 100.0,
                        "difficulty": "Intermediate",
                        "estimated_learning_hours": 10.0,
                        "subtopics": [],
                        "objectives": [
                            {"objective": "Reconcile net income to operating cash flow in financial statements", "objective_type": "ANALYZE", "skill_ids": ["financial-analysis", "accounting"], "difficulty": "Intermediate", "importance": "HIGH"}
                        ],
                        "skills": [{"skill_id": "financial-analysis", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.9}]
                    }
                ]
            },
            {
                "title": "Module 2: Discounted Cash Flow (DCF) Valuation",
                "description": "WACC calculation, Free Cash Flow to Firm (FCFF), terminal value",
                "order_index": 2,
                "weight": 50.0,
                "estimated_learning_hours": 12.0,
                "topics": [
                    {
                        "title": "Valuation Modeling in Excel",
                        "description": "CAPM, beta unlevering, sensitivity analysis",
                        "order_index": 1,
                        "weight": 100.0,
                        "difficulty": "Advanced",
                        "estimated_learning_hours": 12.0,
                        "subtopics": [],
                        "objectives": [
                            {"objective": "Build a multi-stage DCF valuation model with terminal value", "objective_type": "IMPLEMENT", "skill_ids": ["financial-analysis", "valuation"], "difficulty": "Advanced", "importance": "HIGH"}
                        ],
                        "skills": [{"skill_id": "financial-analysis", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.95}]
                    }
                ]
            }
        ]
    }
]
