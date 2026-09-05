"""
Phase 11 Stage 10: Canonical Multilingual Career Translation Seed Data
Contains comprehensive translation overlays across all 12 supported Indian & global languages:
English (en), Hindi (hi), Tamil (ta), Telugu (te), Kannada (kn), Malayalam (ml),
Marathi (mr), Bengali (bn), Gujarati (gu), Punjabi (pa), Odia (or), Urdu (ur).

Crucial rule: Technical terms (Python, SQL, React, AWS, Docker, Kubernetes, etc.)
are preserved in Latin script within localized sentences.
"""

from typing import Dict, Any, List

SUPPORTED_LANGUAGES_REGISTRY = {
    "en": {"code": "en", "name": "English", "native_name": "English", "locale": "en-IN", "direction": "ltr"},
    "hi": {"code": "hi", "name": "Hindi", "native_name": "हिन्दी", "locale": "hi-IN", "direction": "ltr"},
    "ta": {"code": "ta", "name": "Tamil", "native_name": "தமிழ்", "locale": "ta-IN", "direction": "ltr"},
    "te": {"code": "te", "name": "Telugu", "native_name": "తెలుగు", "locale": "te-IN", "direction": "ltr"},
    "kn": {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ", "locale": "kn-IN", "direction": "ltr"},
    "ml": {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം", "locale": "ml-IN", "direction": "ltr"},
    "mr": {"code": "mr", "name": "Marathi", "native_name": "मराठी", "locale": "mr-IN", "direction": "ltr"},
    "bn": {"code": "bn", "name": "Bengali", "native_name": "বাংলা", "locale": "bn-IN", "direction": "ltr"},
    "gu": {"code": "gu", "name": "Gujarati", "native_name": "ગુજરાતી", "locale": "gu-IN", "direction": "ltr"},
    "pa": {"code": "pa", "name": "Punjabi", "native_name": "ਪੰਜਾਬੀ", "locale": "pa-IN", "direction": "ltr"},
    "or": {"code": "or", "name": "Odia", "native_name": "ଓଡ଼ିଆ", "locale": "or-IN", "direction": "ltr"},
    "ur": {"code": "ur", "name": "Urdu", "native_name": "اردو", "locale": "ur-IN", "direction": "rtl"},
}

CAREER_TRANSLATIONS_SEED: Dict[str, Dict[str, Dict[str, Any]]] = {
    "ai-ml-engineer": {
        "en": {
            "title": "AI/ML Engineer",
            "description": "Designs, trains, and operationalizes machine learning, deep learning, and AI agent architectures.",
            "family_name": "Artificial Intelligence & Data",
            "domain_name": "Technology & Computing",
            "search_terms": ["AI", "ML", "Machine Learning", "Artificial Intelligence", "Deep Learning", "LLM", "NLP"],
            "requirement_notes": {"skills": "Strong command of Python, PyTorch, Linear Algebra, and MLOps."},
            "pathway_notes": {"degree": "B.Tech Computer Science / AI or specialized conversion pathway."}
        },
        "hi": {
            "title": "एआई / एमएल इंजीनियर",
            "description": "मशीन लर्निंग, डीप लर्निंग और आर्टिफिशियल इंटेलिजेंस मॉडल का निर्माण और परिनियोजन करता है।",
            "family_name": "आर्टिफिशियल इंटेलिजेंस और डेटा",
            "domain_name": "प्रौद्योगिकी और कंप्यूटिंग",
            "search_terms": ["एआई", "एमएल", "मशीन लर्निंग", "आर्टिफिशियल इंटेलिजेंस", "कृत्रिम बुद्धिमत्ता", "डीप लर्निंग"],
            "requirement_notes": {"skills": "Python, PyTorch, Linear Algebra और MLOps में दक्षता।"},
            "pathway_notes": {"degree": "कंप्यूटर साइंस बी.टेक या डिग्री मार्ग।"}
        },
        "ta": {
            "title": "ஏஐ / எம்எல் பொறியாளர்",
            "description": "செயற்கை நுண்ணறிவு, மெஷின் லேர்னிங் மற்றும் ஆழமான கற்றல் மாதிரிகளை வடிவமைத்து உருவாக்குகிறார்.",
            "family_name": "செயற்கை நுண்ணறிவு & தரவு",
            "domain_name": "தொழில்நுட்பம் & கணினியியல்",
            "search_terms": ["ஏஐ", "எம்எல்", "செயற்கை நுண்ணறிவு", "மெஷின் லேர்னிங்", "டேட்டா சயின்ஸ்"],
            "requirement_notes": {"skills": "Python, PyTorch, Linear Algebra மற்றும் MLOps அறிவாற்றல் அவசியம்."},
            "pathway_notes": {"degree": "கம்ப்யூட்டர் சயின்ஸ் பொறியியல் பட்டம் அல்லது பாலம் வழித்தடம்."}
        },
        "te": {
            "title": "ఏఐ / ఎంఎల్ ఇంజనీర్",
            "description": "మెషిన్ లెర్నింగ్, డీప్ లెర్నింగ్ మరియు కృత్రిమ మేధస్సు మోడళ్లను నిర్మించి ఆపరేట్ చేస్తారు.",
            "family_name": "ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ & డేటా",
            "domain_name": "టెక్నాలజీ & కంప్యూటింగ్",
            "search_terms": ["ఏఐ", "ఎంఎల్", "మెషిన్ లెర్నింగ్", "ఆర్టిఫిషియల్ ఇంటెలిజెన్స్", "కృత్రిమ మేధస్సు"],
            "requirement_notes": {"skills": "Python, PyTorch, లీనియర్ ఆల్జీబ్రా మరియు MLOps లో నైపుణ్యం."},
            "pathway_notes": {"degree": "కంప్యూటర్ సైన్స్ బి.టెక్ లేదా డిగ్రీ మార్గం."}
        },
        "kn": {
            "title": "ಎಐ / ಎಂಎಲ್ ಇಂಜಿನಿಯರ್",
            "description": "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಮೆಷಿನ್ ಲರ್ನಿಂಗ್ ಮಾದರಿಗಳನ್ನು ನಿರ್ಮಿಸಿ ನಿಯೋಜಿಸುತ್ತಾರೆ.",
            "family_name": "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಡೇಟಾ",
            "domain_name": "ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಕಂಪ್ಯೂಟಿಂಗ್",
            "search_terms": ["ಎಐ", "ಎಂಎಲ್", "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ", "ಮೆಷಿನ್ ಲರ್ನಿಂಗ್"],
            "requirement_notes": {"skills": "Python, PyTorch ಮತ್ತು MLOps ಕೌಶಲ್ಯಗಳು."},
            "pathway_notes": {"degree": "ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಬಿ.ಇ/ಬಿ.ಟೆಕ್."}
        },
        "ml": {
            "title": "എഐ / എംഎൽ എഞ്ചിനീയർ",
            "description": "മെഷീൻ ലേണിംഗ്, ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസ് മോഡലുകൾ രൂപകൽപ്പന ചെയ്തു നടപ്പിലാക്കുന്നു.",
            "family_name": "ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസ് & ഡാറ്റ",
            "domain_name": "സാങ്കേതികവിദ്യ & കമ്പ്യൂട്ടിംഗ്",
            "search_terms": ["എഐ", "എംഎൽ", "മെഷീൻ ലേണിംഗ്", "ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസ്"],
            "requirement_notes": {"skills": "Python, PyTorch, MLOps പ്രാവീണ്യം."},
            "pathway_notes": {"degree": "കമ്പ്യൂട്ടർ സയൻസ് ബി.ടെക് ബിരുദം."}
        },
        "mr": {
            "title": "एआय / एमएल अभियंता",
            "description": "मशीन लर्निंग, डीप लर्निंग आणि कृत्रिम बुद्धिमत्ता प्रणाली तयार व कार्यान्वित करतो.",
            "family_name": "कृत्रिम बुद्धिमत्ता आणि डेटा",
            "domain_name": "तंत्रज्ञान आणि संगणन",
            "search_terms": ["एआय", "एमएल", "मशीन लर्निंग", "कृत्रिम बुद्धिमत्ता"],
            "requirement_notes": {"skills": "Python, PyTorch आणि MLOps कौशल्ये."},
            "pathway_notes": {"degree": "संगणक अभियांत्रिकी पदवी."}
        },
        "bn": {
            "title": "এআই / এমএল ইঞ্জিনিয়ার",
            "description": "মেশিন লার্নিং, ডিপ লার্নিং ও কৃত্রিম বুদ্ধিমত্তা মডেল তৈরি এবং পরিচালনা করে।",
            "family_name": "কৃত্রিম বুদ্ধিমত্তা ও ডেটা",
            "domain_name": "প্রযুক্তি ও কম্পিউটিং",
            "search_terms": ["এআই", "এমএল", "মেশিন লার্নিং", "কৃত্রিম বুদ্ধিমত্তা"],
            "requirement_notes": {"skills": "Python, PyTorch ও MLOps দক্ষতা।"},
            "pathway_notes": {"degree": "কম্পিউটার সায়েন্স বি.টেক ডিগ্রি।"}
        },
        "gu": {
            "title": "એઆઈ / એમએલ એન્જિનિયર",
            "description": "મશીન લર્નિંગ, ડીપ લર્નિંગ અને આર્ટિફિશિયલ ઇન્ટેલિજન્સ સિસ્ટમ્સ બનાવે છે.",
            "family_name": "આર્ટિફિશિયલ ઇન્ટેલિજન્સ અને ડેટા",
            "domain_name": "ટેકનોલોજી અને કમ્પ્યુટિંગ",
            "search_terms": ["એઆઈ", "એમએલ", "કૃત્રિમ બુદ્ધિમત્તા", "મશીન લર્નિંગ"],
            "requirement_notes": {"skills": "Python, PyTorch અને MLOps પ્રાવીણ્ય."},
            "pathway_notes": {"degree": "કમ્પ્યુટર સાયન્સ એન્જિનિયરિંગ ડિગ્રી."}
        },
        "pa": {
            "title": "ਏਆਈ / ਐਮਐਲ ਇੰਜੀਨੀਅਰ",
            "description": "ਮਸ਼ੀਨ ਲਰਨਿੰਗ ਅਤੇ ਆਰਟੀਫੀਸ਼ੀਅਲ ਇੰਟੈਲੀਜੈਂਸ ਮਾਡਲਾਂ ਨੂੰ ਵਿਕਸਤ ਅਤੇ ਤੈਨਾਤ ਕਰਦਾ ਹੈ।",
            "family_name": "ਆਰਟੀਫੀਸ਼ੀਅਲ ਇੰਟੈਲੀਜੈਂਸ ਅਤੇ ਡੇਟਾ",
            "domain_name": "ਤਕਨਾਲੋਜੀ ਅਤੇ ਕੰਪਿਊਟਿੰਗ",
            "search_terms": ["ਏਆਈ", "ਐਮਐਲ", "ਮਸ਼ੀਨ ਲਰਨਿੰਗ", "ਆਰਟੀਫੀਸ਼ੀਅਲ ਇੰਟੈਲੀਜੈਂਸ"],
            "requirement_notes": {"skills": "Python, PyTorch ਅਤੇ MLOps ਨਿਪੁੰਨਤਾ।"},
            "pathway_notes": {"degree": "ਕੰਪਿਊਟਰ ਸਾਇੰਸ ਡਿਗਰੀ ਰੂਟ।"}
        },
        "or": {
            "title": "ଏଆଇ / ଏମଏଲ ଇଞ୍ଜିନିୟର",
            "description": "ମେସିନ୍ ଲର୍ଣ୍ଣିଂ ଏବଂ କୃତ୍ରିମ ବୁଦ୍ଧିମତ୍ତା ସିଷ୍ଟମ ଡିଜାଇନ୍ ଏବଂ ପରିଚାଳନା କରନ୍ତି।",
            "family_name": "କୃତ୍ରିମ ବୁଦ୍ଧିମତ୍ତା ଏବଂ ଡାଟା",
            "domain_name": "ପ୍ରଯୁକ୍ତିବିଦ୍ୟା ଏବଂ କମ୍ପ୍ୟୁଟିଂ",
            "search_terms": ["ଏଆଇ", "ଏମଏଲ", "କୃତ୍ରିମ ବୁଦ୍ଧିମତ୍ତା", "ମେସିନ ଲର୍ଣ୍ଣିଂ"],
            "requirement_notes": {"skills": "Python, PyTorch ଏବଂ MLOps ଦକ୍ଷତା।"},
            "pathway_notes": {"degree": "କମ୍ପ୍ୟୁଟର ସାଇନ୍ସ ବି.ଟେକ୍ ଡିଗ୍ରୀ।"}
        },
        "ur": {
            "title": "اے آئی / ایم ایل انجینئر",
            "description": "مشین لرننگ اور مصنوعی ذہانت کے ماڈلز کو ڈیزائن اور تعینات کرتا ہے۔",
            "family_name": "مصنوعی ذہانت اور ڈیٹا",
            "domain_name": "ٹیکنالوجی اور کمپیوٹنگ",
            "search_terms": ["مصنوعی ذہانت", "مشین لرننگ", "اے آئی", "ڈیپ لرننگ"],
            "requirement_notes": {"skills": "Python، PyTorch اور MLOps میں مہارت۔"},
            "pathway_notes": {"degree": "کمپیوٹر سائنس ڈگری کا راستہ۔"}
        }
    },
    "software-engineer": {
        "en": {
            "title": "Software Engineer",
            "description": "Builds, tests, and maintains scalable software applications, backend services, and distributed systems.",
            "family_name": "Software & Web Development",
            "domain_name": "Technology & Computing",
            "search_terms": ["Software", "Programmer", "Developer", "Coder", "Backend", "Frontend"],
            "requirement_notes": {"skills": "DSA, Python/Java/C++, System Design, SQL, Git."},
            "pathway_notes": {"degree": "B.Tech CSE/IT, BCA/MCA, or technical bootcamp pathway."}
        },
        "hi": {
            "title": "सॉफ्टवेयर इंजीनियर",
            "description": "स्केलेबल सॉफ्टवेयर एप्लिकेशन, बैकएंड सेवाओं और वितरित प्रणालियों का निर्माण और रखरखाव करता है।",
            "family_name": "सॉफ्टवेयर और वेब विकास",
            "domain_name": "प्रौद्योगिकी और कंप्यूटिंग",
            "search_terms": ["सॉफ्टवेयर", "प्रोग्रामर", "डेवलपर", "कोडर", "कंप्यूटर इंजीनियर"],
            "requirement_notes": {"skills": "DSA, Python/Java/C++, System Design और SQL।"},
            "pathway_notes": {"degree": "बी.टेक कंप्यूटर साइंस, बीसीए/एमसीए या कोडिंग मार्ग।"}
        },
        "ta": {
            "title": "மென்பொருள் பொறியாளர்",
            "description": "நவீன மென்பொருள் பயன்பாடுகள், சேவைகள் மற்றும் கணினி அமைப்புகளை உருவாக்குகிறார்.",
            "family_name": "மென்பொருள் & வலை உருவாக்கம்",
            "domain_name": "தொழில்நுட்பம் & கணினியியல்",
            "search_terms": ["மென்பொருள் பொறியாளர்", "புரோகிராமர்", "டெவலப்பர்", "மென்பொருள்"],
            "requirement_notes": {"skills": "DSA, Python/Java/C++, System Design மற்றும் SQL."},
            "pathway_notes": {"degree": "பொறியியல் பட்டம் (CSE/IT), BCA/MCA."}
        },
        "te": {
            "title": "సాఫ్ట్‌వేర్ ఇంజనీర్",
            "description": "సాఫ్ట్‌వేర్ అప్లికేషన్లు, బ్యాకెండ్ సేవలు మరియు సిస్టమ్‌లను అభివృద్ధి చేస్తారు.",
            "family_name": "సాఫ్ట్‌వేర్ & వెబ్ డెవలప్‌మెంట్",
            "domain_name": "టెక్నాలజీ & కంప్యూటింగ్",
            "search_terms": ["సాఫ్ట్‌వేర్ ఇంజనీర్", "డెవలపర్", "ప్రోగ్రామర్"],
            "requirement_notes": {"skills": "DSA, Python/Java, System Design మరియు SQL నైపుణ్యాలు."},
            "pathway_notes": {"degree": "బి.టెక్ లేదా ఎంసీఏ మార్గం."}
        },
        "kn": {
            "title": "ಸಾಫ್ಟ್‌ವೇರ್ ಇಂಜಿನಿಯರ್",
            "description": "ಸಾಫ್ಟ್‌ವೇರ್ ಅಪ್ಲಿಕೇಶನ್‌ಗಳು ಮತ್ತು ಬ್ಯಾಕೆಂಡ್ ಸೇವೆಗಳನ್ನು ನಿರ್ಮಿಸುತ್ತಾರೆ.",
            "family_name": "ಸಾಫ್ಟ್‌ವೇರ್ ಮತ್ತು ವೆಬ್ ಅಭಿವೃದ್ಧಿ",
            "domain_name": "ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಕಂಪ್ಯೂಟಿಂಗ್",
            "search_terms": ["ಸಾಫ್ಟ್‌ವೇರ್ ಇಂಜಿನಿಯರ್", "ಡೆವಲಪರ್", "ಪ್ರೋಗ್ರಾಮರ್"],
            "requirement_notes": {"skills": "DSA, Python/Java ಮತ್ತು SQL."},
            "pathway_notes": {"degree": "ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಬಿ.ಇ/ಬಿ.ಟೆಕ್ ಅಥವಾ ಬಿಸಿಎ."}
        },
        "ml": {
            "title": "സോഫ്റ്റ്‌വെയർ എഞ്ചിനീയർ",
            "description": "സോഫ്റ്റ്‌വെയർ ആപ്ലിക്കേഷനുകളും അനുബന്ധ സിസ്റ്റങ്ങളും നിർമ്മിക്കുകയും പരിപാലിക്കുകയും ചെയ്യുന്നു.",
            "family_name": "സോഫ്റ്റ്‌വെയർ & വെബ് ഡെവലപ്‌മെന്റ്",
            "domain_name": "സാങ്കേതികവിദ്യ & കമ്പ്യൂട്ടിംഗ്",
            "search_terms": ["സോഫ്റ്റ്‌വെയർ എഞ്ചിനീയർ", "ഡെവലപ്പർ", "പ്രോഗ്രാമർ"],
            "requirement_notes": {"skills": "DSA, Python/Java, SQL പ്രാവീണ്യം."},
            "pathway_notes": {"degree": "ബി.ടെക് കമ്പ്യൂട്ടർ സയൻസ്."}
        },
        "mr": {
            "title": "सॉफ्टवेअर अभियंता",
            "description": "सॉफ्टवेअर अनुप्रयोग आणि प्रणालींचे डिझाइन आणि विकास करतो.",
            "family_name": "सॉफ्टवेअर आणि वेब विकास",
            "domain_name": "तंत्रज्ञान आणि संगणन",
            "search_terms": ["सॉफ्टवेअर अभियंता", "प्रोग्रामर", "डेव्हलपर"],
            "requirement_notes": {"skills": "DSA, Python/Java/C++ आणि SQL."},
            "pathway_notes": {"degree": "बी.ई./बी.टेक संगणक किंवा बीसीए/एमसीए."}
        },
        "bn": {
            "title": "সফটওয়্যার ইঞ্জিনিয়ার",
            "description": "স্কেলেবল সফটওয়্যার অ্যাপ্লিকেশন ও সিস্টেম তৈরি এবং পরিচালনা করে।",
            "family_name": "সফটওয়্যার ও ওয়েব ডেভেলপমেন্ট",
            "domain_name": "প্রযুক্তি ও কম্পিউটিং",
            "search_terms": ["সফটওয়্যার ইঞ্জিনিয়ার", "প্রোগ্রামার", "ডেভেলপার"],
            "requirement_notes": {"skills": "DSA, Python/Java, System Design ও SQL।"},
            "pathway_notes": {"degree": "কম্পিউটার সায়েন্স বি.টেক বা বিসিএ/এমসিএ।"}
        },
        "gu": {
            "title": "સોફ્ટવેર એન્જિનિયર",
            "description": "સોફ્ટવેર એપ્લિકેશનો અને ડિસ્ટ્રિબ્યુટેડ સિસ્ટમ્સ બનાવે છે.",
            "family_name": "સોફ્ટવેર અને વેબ ડેવલપમેન્ટ",
            "domain_name": "ટેકનોલોજી અને કમ્પ્યુટિંગ",
            "search_terms": ["સોફ્ટવેર એન્જિનિયર", "પ્રોગ્રામર", "ડેવલપર"],
            "requirement_notes": {"skills": "DSA, Python/Java અને SQL કૌશલ્ય."},
            "pathway_notes": {"degree": "બી.ટેક કમ્પ્યુટર સાયન્સ."}
        },
        "pa": {
            "title": "ਸਾਫਟਵੇਅਰ ਇੰਜੀਨੀਅਰ",
            "description": "ਸਾਫਟਵੇਅਰ ਐਪਲੀਕੇਸ਼ਨਾਂ ਅਤੇ ਬੈਕਐਂਡ ਸਿਸਟਮਾਂ ਦਾ ਨਿਰਮਾਣ ਕਰਦਾ ਹੈ।",
            "family_name": "ਸਾਫਟਵੇਅਰ ਅਤੇ ਵੈੱਬ ਵਿਕਾਸ",
            "domain_name": "ਤਕਨਾਲੋਜੀ ਅਤੇ ਕੰਪਿਊਟਿੰਗ",
            "search_terms": ["ਸਾਫਟਵੇਅਰ ਇੰਜੀਨੀਅਰ", "ਪ੍ਰੋਗਰਾਮਰ", "ਡਿਵੈਲਪਰ"],
            "requirement_notes": {"skills": "DSA, Python/Java ਅਤੇ SQL।"},
            "pathway_notes": {"degree": "ਕੰਪਿਊਟਰ ਸਾਇੰਸ ਬੀ.ਟੈਕ ਡਿਗਰੀ।"}
        },
        "or": {
            "title": "ସଫ୍ଟୱେର୍ ଇଞ୍ଜିନିୟର",
            "description": "ସଫ୍ଟୱେର୍ ଆପ୍ଲିକେସନ୍ ଏବଂ ବ୍ୟାକ୍ଏଣ୍ଡ୍ ସିଷ୍ଟମ୍ ବିକାଶ କରନ୍ତି।",
            "family_name": "ସଫ୍ଟୱେର୍ ଏବଂ ୱେବ୍ ବିକାଶ",
            "domain_name": "ପ୍ରଯୁକ୍ତିବିଦ୍ୟା ଏବଂ କମ୍ପ୍ୟୁଟିଂ",
            "search_terms": ["ସଫ୍ଟୱେର୍ ଇଞ୍ଜିନିୟର", "ପ୍ରୋଗ୍ରାମର୍", "ଡେଭଲପର୍"],
            "requirement_notes": {"skills": "DSA, Python/Java ଏବଂ SQL ଦକ୍ଷତା।"},
            "pathway_notes": {"degree": "କମ୍ପ୍ୟୁଟର ସାଇନ୍ସ ବି.ଟେକ୍ ଡିଗ୍ରୀ।"}
        },
        "ur": {
            "title": "سافٹ ویئر انجینئر",
            "description": "اسکیل ایبل سافٹ ویئر ایپلی کیشنز اور بیک اینڈ سسٹمز کو ڈیزائن اور ڈیولپ کرتا ہے۔",
            "family_name": "سافٹ ویئر اور ویب ڈویلپمنٹ",
            "domain_name": "ٹیکنالوجی اور کمپیوٹنگ",
            "search_terms": ["سافٹ ویئر انجینئر", "پروگرامر", "ڈویلپر", "کوڈر"],
            "requirement_notes": {"skills": "DSA، Python/Java اور SQL میں مہارت۔"},
            "pathway_notes": {"degree": "کمپیوٹر سائنس بی ٹیک یا بی سی اے راستہ۔"}
        }
    },
    "data-scientist": {
        "en": {
            "title": "Data Scientist",
            "description": "Extracts predictive insights from structured and unstructured data using statistics, ML, and visualization.",
            "family_name": "Artificial Intelligence & Data",
            "domain_name": "Technology & Computing",
            "search_terms": ["Data Science", "Analytics", "Statistics", "Machine Learning", "Pandas", "SQL"],
            "requirement_notes": {"skills": "Python, SQL, Statistics, Machine Learning, Tableau/PowerBI."},
            "pathway_notes": {"degree": "Degree in Mathematics, Statistics, Computer Science, or Data Science."}
        },
        "hi": {
            "title": "डेटा वैज्ञानिक",
            "description": "सांख्यिकी, मशीन लर्निंग और विज़ुअलाइज़ेशन का उपयोग करके डेटा से व्यावहारिक अंतर्दृष्टि निकालता है।",
            "family_name": "आर्टिफिशियल इंटेलिजेंस और डेटा",
            "domain_name": "प्रौद्योगिकी और कंप्यूटिंग",
            "search_terms": ["डेटा वैज्ञानिक", "डेटा साइंस", "सांख्यिकी", "एनालिटिक्स"],
            "requirement_notes": {"skills": "Python, SQL, सांख्यिकी और मशीन लर्निंग।"},
            "pathway_notes": {"degree": "गणित, सांख्यिकी या कंप्यूटर साइंस में डिग्री।"}
        },
        "ta": {
            "title": "தரவு விஞ்ஞானி",
            "description": "புள்ளியியல் மற்றும் இயந்திரக் கற்றல் முறைகளைப் பயன்படுத்தி தரவுகளில் இருந்து அறிவார்ந்த முடிவுகளை எடுக்கிறார்.",
            "family_name": "செயற்கை நுண்ணறிவு & தரவு",
            "domain_name": "தொழில்நுட்பம் & கணினியியல்",
            "search_terms": ["தரவு விஞ்ஞானி", "டேட்டா சயின்டிஸ்ட்", "புள்ளியியல்", "அனலிட்டிக்ஸ்"],
            "requirement_notes": {"skills": "Python, SQL, Statistics மற்றும் Machine Learning."},
            "pathway_notes": {"degree": "கணிதம், புள்ளியியல் அல்லது கணினி அறிவியல் பட்டம்."}
        },
        "te": {
            "title": "డేటా సైంటిస్ట్",
            "description": "గణాంకాలు మరియు మెషిన్ లెర్నింగ్ ద్వారా డేటా నుండి అంతర్దృష్టులను సంగ్రహిస్తారు.",
            "family_name": "ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ & డేటా",
            "domain_name": "టెక్నాలజీ & కంప్యూటింగ్",
            "search_terms": ["డేటా సైంటిస్ట్", "డేటా సైన్స్", "స్టాటిస్టిక్స్"],
            "requirement_notes": {"skills": "Python, SQL, స్టాటిస్టిక్స్ మరియు మెషిన్ లెర్నింగ్."},
            "pathway_notes": {"degree": "గణితం లేదా కంప్యూటర్ సైన్స్ డిగ్రీ."}
        },
        "kn": {
            "title": "ಡೇಟಾ ಸೈಂಟಿಸ್ಟ್",
            "description": "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಮತ್ತು ಯಂತ್ರ ಕಲಿಕೆಯ ಮೂಲಕ ಡೇಟಾವನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಾರೆ.",
            "family_name": "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಡೇಟಾ",
            "domain_name": "ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಕಂಪ್ಯೂಟಿಂಗ್",
            "search_terms": ["ಡೇಟಾ ಸೈಂಟಿಸ್ಟ್", "ಡೇಟಾ ವಿಜ್ಞಾನ"],
            "requirement_notes": {"skills": "Python, SQL ಮತ್ತು ಸಂಖ್ಯಾಶಾಸ್ತ್ರ."},
            "pathway_notes": {"degree": "ಗಣಿತ ಅಥವಾ ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಪದವಿ."}
        },
        "ml": {
            "title": "ഡാറ്റാ സയന്റിസ്റ്റ്",
            "description": "സ്റ്റാറ്റിസ്റ്റിക്സ്, മെഷീൻ ലേണിംഗ് എന്നിവ ഉപയോഗിച്ച് വിവരങ്ങൾ വിശകലനം ചെയ്യുന്നു.",
            "family_name": "ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസ് & ഡാറ്റ",
            "domain_name": "സാങ്കേതികവിദ്യ & കമ്പ്യൂട്ടിംഗ്",
            "search_terms": ["ഡാറ്റാ സയന്റിസ്റ്റ്", "ഡാറ്റ സയൻസ്"],
            "requirement_notes": {"skills": "Python, SQL, സ്റ്റാറ്റിസ്റ്റിക്സ്."},
            "pathway_notes": {"degree": "കമ്പ്യൂട്ടർ സയൻസ് അല്ലെങ്കിൽ ഗണിത ബിരുദം."}
        },
        "mr": {
            "title": "डेटा शास्त्रज्ञ",
            "description": "सांख्यिकी आणि मशीन लर्निंगचा वापर करून डेटाचे विश्लेषण करतो.",
            "family_name": "कृत्रिम बुद्धिमत्ता आणि डेटा",
            "domain_name": "तंत्रज्ञान आणि संगणन",
            "search_terms": ["डेटा शास्त्रज्ञ", "डेटा सायन्स"],
            "requirement_notes": {"skills": "Python, SQL आणि सांख्यिकी."},
            "pathway_notes": {"degree": "गणित किंवा संगणक पदवी."}
        },
        "bn": {
            "title": "ডেটা সায়েন্টিস্ট",
            "description": "পরিসংখ্যান ও মেশিন লার্নিং ব্যবহার করে ডেটা থেকে গুরুত্বপূর্ণ সিদ্ধান্ত গ্রহণ করে।",
            "family_name": "কৃত্রিম বুদ্ধিমত্তা ও ডেটা",
            "domain_name": "প্রযুক্তি ও কম্পিউটিং",
            "search_terms": ["ডেটা সায়েন্টিস্ট", "ডেটা বিজ্ঞান"],
            "requirement_notes": {"skills": "Python, SQL ও পরিসংখ্যান।"},
            "pathway_notes": {"degree": "গণিত বা কম্পিউটার বিজ্ঞানে ডিগ্রি।"}
        },
        "gu": {
            "title": "ડેટા સાયન્ટિસ્ટ",
            "description": "આંકડાશાસ્ત્ર અને મશીન લર્નિંગનો ઉપયોગ કરીને ડેટામાંથી મૂલ્યવાન માહિતી મેળવે છે.",
            "family_name": "આર્ટિફિશિયલ ઇન્ટેલિજન્સ અને ડેટા",
            "domain_name": "ટેકનોલોજી અને કમ્પ્યુટિંગ",
            "search_terms": ["ડેટા સાયન્ટિસ્ટ", "ડેટા સાયન્સ"],
            "requirement_notes": {"skills": "Python, SQL અને આંકડાશાસ્ત્ર."},
            "pathway_notes": {"degree": "ગણિત અથવા કમ્પ્યુટર સાયન્સ ડિગ્રી."}
        },
        "pa": {
            "title": "ਡੇਟਾ ਸਾਇੰਟਿਸਟ",
            "description": "ਅੰਕੜਿਆਂ ਅਤੇ ਮਸ਼ੀਨ ਲਰਨਿੰਗ ਰਾਹੀਂ ਡੇਟਾ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਦਾ ਹੈ।",
            "family_name": "ਆਰਟੀਫੀਸ਼ੀਅਲ ਇੰਟੈਲੀਜੈਂਸ ਅਤੇ ਡੇਟਾ",
            "domain_name": "ਤਕਨਾਲੋਜੀ ਅਤੇ ਕੰਪਿਊਟਿੰਗ",
            "search_terms": ["ਡੇਟਾ ਸਾਇੰਟਿਸਟ", "ਡੇਟਾ ਸਾਇੰਸ"],
            "requirement_notes": {"skills": "Python, SQL ਅਤੇ ਅੰਕੜਾ ਵਿਗਿਆਨ।"},
            "pathway_notes": {"degree": "ਗਣਿਤ ਜਾਂ ਕੰਪਿਊਟਰ ਸਾਇੰਸ ਡਿਗਰੀ।"}
        },
        "or": {
            "title": "ଡାଟା ବୈଜ୍ଞାନିକ",
            "description": "ପରିସଂଖ୍ୟାନ ଏବଂ ମେସିନ ଲର୍ଣ୍ଣିଂ ମାଧ୍ୟମରେ ତଥ୍ୟର ବିଶ୍ଳେଷଣ କରନ୍ତି।",
            "family_name": "କୃତ୍ରିମ ବୁଦ୍ଧିମତ୍ତା ଏବଂ ଡାଟା",
            "domain_name": "ପ୍ରଯୁକ୍ତିବିଦ୍ୟା ଏବଂ କମ୍ପ୍ୟୁଟିଂ",
            "search_terms": ["ଡାଟା ବୈଜ୍ଞାନିକ", "ଡାଟା ସାଇନ୍ସ"],
            "requirement_notes": {"skills": "Python, SQL ଏବଂ ପରିସଂଖ୍ୟାନ।"},
            "pathway_notes": {"degree": "ଗଣିତ କିମ୍ବା କମ୍ପ୍ୟୁଟର ସାଇନ୍ସ ଡିଗ୍ରୀ।"}
        },
        "ur": {
            "title": "ڈیٹا سائنسدان",
            "description": "شماریات اور مشین لرننگ کے ذریعے ڈیٹا سے مفید معلومات اخذ کرتا ہے۔",
            "family_name": "مصنوعی ذہانت اور ڈیٹا",
            "domain_name": "ٹیکنالوجی اور کمپیوٹنگ",
            "search_terms": ["ڈیٹا سائنسدان", "ڈیٹا سائنس", "شماریات"],
            "requirement_notes": {"skills": "Python، SQL اور شماریات۔"},
            "pathway_notes": {"degree": "ریاضی یا کمپیوٹر سائنس ڈگری۔"}
        }
    },
    "doctor": {
        "en": {
            "title": "General Physician / Doctor",
            "description": "Diagnoses, treats, and prevents human illnesses and injuries under statutory medical guidelines (NMC).",
            "family_name": "Clinical Medicine & Surgery",
            "domain_name": "Healthcare & Medicine",
            "search_terms": ["Doctor", "Physician", "MBBS", "Medical", "Medicine", "Healthcare", "Clinic", "Hospital"],
            "requirement_notes": {"statutory": "Mandatory MBBS degree registered with State Medical Council / NMC; NEET qualifying exam."},
            "pathway_notes": {"neet": "Class 12 PCB -> NEET-UG -> 5.5-year MBBS including 1-year rotating internship."}
        },
        "hi": {
            "title": "सामान्य चिकित्सक / डॉक्टर",
            "description": "मानव रोगों और चोटों का निदान, उपचार और रोकथाम करता है (एनएमसी दिशानिर्देश)।",
            "family_name": "क्लिनिकल मेडिसिन और सर्जरी",
            "domain_name": "स्वास्थ्य सेवा और चिकित्सा",
            "search_terms": ["डॉक्टर", "चिकित्सक", "एमबीबीएस", "अस्पताल", "नीट"],
            "requirement_notes": {"statutory": "एनएमसी पंजीकृत एमबीबीएस डिग्री और नीट अर्हता अनिवार्य।"},
            "pathway_notes": {"neet": "12वीं पीसीबी -> नीट-यूजी -> 5.5 वर्षीय एमबीबीएस।"}
        },
        "ta": {
            "title": "பொது மருத்துவர்",
            "description": "மனித நோய்கள் மற்றும் காயங்களை சட்டப்பூர்வ மருத்துவ வழிகாட்டுதல்களின்படி கண்டறிந்து குணப்படுத்துகிறார்.",
            "family_name": "மருத்துவம் & அறுவை சிகிச்சை",
            "domain_name": "சுகாதாரம் & மருத்துவம்",
            "search_terms": ["மருத்துவர்", "டாக்டர்", "எம்பிபிஎஸ்", "நீட்", "மருத்துவமனை"],
            "requirement_notes": {"statutory": "NMC பதிவு பெற்ற MBBS பட்டம் மற்றும் NEET தகுதி கட்டாயம்."},
            "pathway_notes": {"neet": "பிளஸ் 2 PCB -> NEET-UG -> 5.5 வருட MBBS படிப்பு."}
        },
        "te": {
            "title": "వైద్యుడు / డాక్టర్",
            "description": "మానవ వ్యాధులు మరియు గాయాలకు రోగ నిర్ధారణ మరియు చికిత్స అందిస్తారు.",
            "family_name": "క్లినికల్ మెడిసిన్ & సర్జరీ",
            "domain_name": "ఆరోగ్య సంరక్షణ & వైద్యం",
            "search_terms": ["డాక్టర్", "వైద్యుడు", "ఎంబీబీఎస్", "నీట్"],
            "requirement_notes": {"statutory": "NMC రిజిస్టర్డ్ MBBS మరియు NEET అర్హత తప్పనిసరి."},
            "pathway_notes": {"neet": "ఇంటర్ PCB -> NEET-UG -> MBBS."}
        },
        "kn": {
            "title": "ಸಾಮಾನ್ಯ ವೈದ್ಯ / ಡಾಕ್ಟರ್",
            "description": "ಮಾನವ ಕಾಯಿಲೆಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ ಗುಣಪಡಿಸುತ್ತಾರೆ.",
            "family_name": "ವೈದ್ಯಕೀಯ ವಿಜ್ಞಾನ",
            "domain_name": "ಆರೋಗ್ಯ ಮತ್ತು ವೈದ್ಯಕೀಯ",
            "search_terms": ["ವೈದ್ಯ", "ಡಾಕ್ಟರ್", "ಎಂಬಿಬಿಎಸ್"],
            "requirement_notes": {"statutory": "NMC ನೋಂದಾಯಿತ MBBS ಪದವಿ."},
            "pathway_notes": {"neet": "ಪಿಯುಸಿ PCB -> NEET-UG -> MBBS."}
        },
        "ml": {
            "title": "ഡോക്ടർ / ജനറൽ ഫിസിഷ്യൻ",
            "description": "രോഗങ്ങൾ നിർണ്ണയിക്കുകയും ചികിത്സിക്കുകയും ചെയ്യുന്നു.",
            "family_name": "ക്ലിനിക്കൽ മെഡിസിൻ",
            "domain_name": "ആരോഗ്യ സംരക്ഷണം",
            "search_terms": ["ഡോക്ടർ", "ഫിസിഷ്യൻ", "എംബിബിഎസ്"],
            "requirement_notes": {"statutory": "NMC രജിസ്ട്രേഷനും MBBS ബിരുദവും."},
            "pathway_notes": {"neet": "പ്ലസ് ടു PCB -> NEET -> MBBS."}
        },
        "mr": {
            "title": "डॉक्टर / फिजिशियन",
            "description": "रोगनिदान आणि वैद्यकीय उपचार प्रदान करतो.",
            "family_name": "क्लिनिकल मेडिसिन",
            "domain_name": "आरोग्य आणि औषधोपचार",
            "search_terms": ["डॉक्टर", "वैद्य", "एमबीबीएस", "नीट"],
            "requirement_notes": {"statutory": "NMC मान्यताप्राप्त MBBS पदवी."},
            "pathway_notes": {"neet": "१२ वी PCB -> NEET-UG -> MBBS."}
        },
        "bn": {
            "title": "ডাক্তার / ফিজিশিয়ান",
            "description": "রোগ নির্ণয় ও যথাযথ চিকিৎসা প্রদান করে।",
            "family_name": "ক্লিনিক্যাল মেডিসিন",
            "domain_name": "স্বাস্থ্যসেবা ও চিকিৎসা",
            "search_terms": ["ডাক্তার", "চিকিৎসক", "এমবিবিএস", "নিট"],
            "requirement_notes": {"statutory": "NMC নিবন্ধিত MBBS ডিগ্রি।"},
            "pathway_notes": {"neet": "দ্বাদশ পিসিবি -> NEET-UG -> MBBS."}
        },
        "gu": {
            "title": "ડૉક્ટર / ફિઝિશિયન",
            "description": "રોગોનું નિદાન અને તબીબી સારવાર આપે છે.",
            "family_name": "ક્લિનિકલ મેડિસિન",
            "domain_name": "આરોગ્ય અને દવા",
            "search_terms": ["ડૉક્ટર", "તબીબ", "એમબીબીએસ"],
            "requirement_notes": {"statutory": "NMC નોંધાયેલ MBBS ડિગ્રી."},
            "pathway_notes": {"neet": "ધોરણ ૧૨ PCB -> NEET -> MBBS."}
        },
        "pa": {
            "title": "ਡਾਕਟਰ / ਫਿਜ਼ੀਸ਼ੀਅਨ",
            "description": "ਮਨੁੱਖੀ ਬਿਮਾਰੀਆਂ ਦਾ ਇਲਾਜ ਅਤੇ ਰੋਕਥਾਮ ਕਰਦਾ ਹੈ।",
            "family_name": "ਕਲੀਨਿਕਲ ਮੈਡੀਸਨ",
            "domain_name": "ਸਿਹਤ ਸੰਭਾਲ",
            "search_terms": ["ਡਾਕਟਰ", "ਤਬੀਬ", "ਐਮਬੀਬੀਐਸ"],
            "requirement_notes": {"statutory": "NMC ਮਾਨਤਾ ਪ੍ਰਾਪਤ MBBS ਡਿਗਰੀ।"},
            "pathway_notes": {"neet": "12ਵੀਂ PCB -> NEET -> MBBS."}
        },
        "or": {
            "title": "ଡାକ୍ତର / ଚିକିତ୍ସକ",
            "description": "ରୋଗ ନିର୍ଣ୍ଣୟ ଏବଂ ଚିକିତ୍ସା ସେବା ପ୍ରଦାନ କରନ୍ତି।",
            "family_name": "କ୍ଲିନିକାଲ୍ ମେଡିସିନ୍",
            "domain_name": "ସ୍ୱାସ୍ଥ୍ୟସେବା ଏବଂ ଚିକିତ୍ସା",
            "search_terms": ["ଡାକ୍ତର", "ଚିକିତ୍ସକ", "ଏମବିବିଏସ"],
            "requirement_notes": {"statutory": "NMC ପଞ୍ଜୀକୃତ MBBS ଡିଗ୍ରୀ।"},
            "pathway_notes": {"neet": "ଯୁକ୍ତ ୨ PCB -> NEET -> MBBS."}
        },
        "ur": {
            "title": "طبیب / ڈاکٹر",
            "description": "بیماریوں کی تشخیص اور علاج معالجہ فراہم کرتا ہے۔",
            "family_name": "کلینکل میڈیسن اور سرجری",
            "domain_name": "صحت اور طب",
            "search_terms": ["طبیب", "ڈاکٹر", "ایم بی بی ایس", "علاج"],
            "requirement_notes": {"statutory": "NMC سے تصدیق شدہ MBBS ڈگری اور NEET۔"},
            "pathway_notes": {"neet": "انٹرمیڈیٹ پری میڈیکل -> NEET -> MBBS۔"}
        }
    },
    "commercial-airline-pilot": {
        "en": {
            "title": "Commercial Airline Pilot",
            "description": "Operates multi-engine passenger or cargo transport aircraft safely under statutory DGCA regulations.",
            "family_name": "Aviation Operations & Flight Crew",
            "domain_name": "Aviation & Aerospace",
            "search_terms": ["Pilot", "Airline", "DGCA", "Commercial Pilot", "Aviation", "Flight", "Aircraft", "Cockpit"],
            "requirement_notes": {"statutory": "DGCA Class 1 Medical, CPL (Commercial Pilot License), 200 logged flight hours."},
            "pathway_notes": {"cpl": "Class 12 PCM -> DGCA Ground Exams + Flight Training (200 hours) -> CPL & Type Rating."}
        },
        "hi": {
            "title": "कमर्शियल एयरलाइन पायलट",
            "description": "डीजीसीए नियमों के तहत वाणिज्यिक विमानों का सुरक्षित संचालन करता है।",
            "family_name": "विमानन संचालन और उड़ान दल",
            "domain_name": "विमानन और एयरोस्पेस",
            "search_terms": ["पायलट", "विमान", "एयरलाइन", "डीजीसीए", "सीपीएल"],
            "requirement_notes": {"statutory": "डीजीसीए क्लास 1 मेडिकल और सीपीएल लाइसेंस अनिवार्य।"},
            "pathway_notes": {"cpl": "12वीं पीसीएम -> डीजीसीए ग्राउंड परीक्षा + उड़ान प्रशिक्षण।"}
        },
        "ta": {
            "title": "வணிக விமானி",
            "description": "DGCA விதிமுறைகளின்படி பயணிகள் மற்றும் சரக்கு விமானங்களை பாதுகாப்பாக இயக்குகிறார்.",
            "family_name": "விமானப் போக்குவரத்து & விமானக் குழு",
            "domain_name": "விமானப் போக்குவரத்து & விண்வெளி",
            "search_terms": ["விமானி", "பைலட்", "DGCA", "விமானம்", "வானூர்தி"],
            "requirement_notes": {"statutory": "DGCA வகுப்பு 1 மருத்துவச் சான்றிதழ் மற்றும் CPL உரிமம் கட்டாயம்."},
            "pathway_notes": {"cpl": "பிளஸ் 2 PCM -> DGCA தேர்வுகள் + விமானப் பயிற்சி (200 மணிநேரம்)."}
        },
        "te": {
            "title": "కమర్షియల్ ఎయిర్‌లైన్ పైలట్",
            "description": "DGCA నిబంధనల ప్రకారం విమానాలను నడుపుతారు.",
            "family_name": "ఏవియేషన్ కార్యకలాపాలు",
            "domain_name": "ఏవియేషన్ & ఏరోస్పేస్",
            "search_terms": ["పైలట్", "విమానం", "DGCA"],
            "requirement_notes": {"statutory": "DGCA క్లాస్ 1 మెడికల్ మరియు CPL లైసెన్స్."},
            "pathway_notes": {"cpl": "ఇంటర్ PCM -> ఫ్లైట్ ట్రైనింగ్."}
        },
        "kn": {
            "title": "ಕಮರ್ಷಿಯಲ್ ಏರ್‌ಲೈನ್ ಪೈಲಟ್",
            "description": "DGCA ನಿಯಮಗಳಡಿಯಲ್ಲಿ ವಿಮಾನಗಳನ್ನು ಹಾರಿಸುತ್ತಾರೆ.",
            "family_name": "ವಾಯುಯಾನ ಕಾರ್ಯಾಚರಣೆಗಳು",
            "domain_name": "ವಾಯುಯಾನ ಮತ್ತು ಏರೋಸ್ಪೇಸ್",
            "search_terms": ["ಪೈಲಟ್", "ವಿಮಾನ ಚಾಲಕ", "DGCA"],
            "requirement_notes": {"statutory": "DGCA ಕ್ಲಾಸ್ 1 ವೈದ್ಯಕೀಯ ಮತ್ತು CPL ಪರವಾನಗಿ."},
            "pathway_notes": {"cpl": "ಪಿಯುಸಿ PCM -> ಫ್ಲೈಯಿಂಗ್ ತರಬೇತಿ."}
        },
        "ml": {
            "title": "കൊമേഴ്‌സ്യൽ എയർലൈൻ പൈലറ്റ്",
            "description": "DGCA ചട്ടങ്ങൾക്ക് വിധേയമായി വിമാനങ്ങൾ നിയന്ത്രിക്കുന്നു.",
            "family_name": "ഏവിയേഷൻ ഓപ്പറേഷൻസ്",
            "domain_name": "ഏവിയേഷൻ",
            "search_terms": ["പൈലറ്റ്", "വിമാന പൈലറ്റ്", "DGCA"],
            "requirement_notes": {"statutory": "DGCA ക്ലാസ് 1 മെഡിക്കലും CPL ലൈസൻസും."},
            "pathway_notes": {"cpl": "പ്ലസ് ടു PCM -> ഫ്ലൈറ്റ് ട്രെയിനിംഗ്."}
        },
        "mr": {
            "title": "व्यावसायिक विमानचालक (पायलट)",
            "description": "डीजीसीए नियमांनुसार प्रवासी व मालवाहू विमाने चालवतो.",
            "family_name": "विमान वाहतूक",
            "domain_name": "विमानचालन आणि एरोस्पेस",
            "search_terms": ["पायलट", "विमानचालक", "डीजीसीए"],
            "requirement_notes": {"statutory": "DGCA क्लास १ मेडिकल आणि CPL लायસન્સ."},
            "pathway_notes": {"cpl": "१२ वी PCM -> DGCA ग्राउंड परीक्षा + उड्डाण प्रशिक्षण."}
        },
        "bn": {
            "title": "বাণিজ্যিক বিমানচালক (পাইলট)",
            "description": "ডিজিসিএ নির্দেশিকা অনুসারে যাত্রীবাহী বিমান পরিচালনা করে।",
            "family_name": "বিমান চালনা ও ক্রু",
            "domain_name": "বিমান ও মহাকাশ",
            "search_terms": ["পাইলট", "বিমানচালক", "ডিজিসিএ"],
            "requirement_notes": {"statutory": "DGCA ক্লাস ১ মেডিক্যাল ও CPL লাইসেন্স।"},
            "pathway_notes": {"cpl": "দ্বাদশ পিসিএম -> ফ্লাইট ট্রেনিং ও পরীক্ষা।"}
        },
        "gu": {
            "title": "કોમર્શિયલ એરલાઇન પાઇલટ",
            "description": "ડીજીસીએ નિયમો હેઠળ વાણિજ્યિક વિમાનોનું સંચાલન કરે છે.",
            "family_name": "એવિએશન ઓપરેશન્સ",
            "domain_name": "એવિએશન અને એરોસ્પેસ",
            "search_terms": ["પાઇલટ", "વિમાનચાલક", "ડીજીસીએ"],
            "requirement_notes": {"statutory": "DGCA ક્લાસ ૧ મેડિકલ અને CPL લાયસન્સ."},
            "pathway_notes": {"cpl": "ધોરણ ૧૨ PCM -> ફ્લાઇટ તાલીમ."}
        },
        "pa": {
            "title": "ਵਪਾਰਕ ਏਅਰਲਾਈਨ ਪਾਇਲਟ",
            "description": "ਡੀਜੀਸੀਏ ਨਿਯਮਾਂ ਅਧੀਨ ਵਪਾਰਕ ਜਹਾਜ਼ ਚਲਾਉਂਦਾ ਹੈ।",
            "family_name": "ਹਵਾਬਾਜ਼ੀ ਕਾਰਜ",
            "domain_name": "ਹਵਾਬਾਜ਼ੀ ਅਤੇ ਏਰੋਸਪੇਸ",
            "search_terms": ["ਪਾਇਲਟ", "ਜਹਾਜ਼ ਚਾਲਕ", "ਡੀਜੀਸੀਏ"],
            "requirement_notes": {"statutory": "DGCA ਕਲਾਸ 1 ਮੈਡੀਕਲ ਅਤੇ CPL ਲਾਇਸੈਂਸ।"},
            "pathway_notes": {"cpl": "12ਵੀਂ PCM -> ਫਲਾਇੰਗ ਸਿਖਲਾਈ।"}
        },
        "or": {
            "title": "ବ୍ୟବସାୟିକ ବିମାନ ଚାଳକ (ପାଇଲଟ୍)",
            "description": "ଡିଜିସିଏ ନିୟମ ଅନୁସାରେ ବିମାନ ପରିଚାଳନା କରନ୍ତି।",
            "family_name": "ବିମାନ ଚଳାଚଳ",
            "domain_name": "ବିମାନ ଏବଂ ଏରୋସ୍ପେସ୍",
            "search_terms": ["ପାଇଲଟ୍", "ବିମାନ ଚାଳକ", "ଡିଜିସିଏ"],
            "requirement_notes": {"statutory": "DGCA କ୍ଲାସ୍ ୧ ମେଡିକାଲ୍ ଏବଂ CPL ଲାଇସେନ୍ସ।"},
            "pathway_notes": {"cpl": "ଯୁକ୍ତ ୨ PCM -> ବିମାନ ଚାଳନା ତାଲିମ।"}
        },
        "ur": {
            "title": "کمرشل ایئرلائن پائلٹ",
            "description": "ڈی جی سی اے قوانین کے مطابق مسافر یا مال بردار طیارے اڑاتا ہے۔",
            "family_name": "ایوی ایشن آپریشنز",
            "domain_name": "ایوی ایشن اور ایرو اسپیس",
            "search_terms": ["پائلٹ", "طیارہ ساز", "ہواباز", "ڈی جی سی اے"],
            "requirement_notes": {"statutory": "ڈی جی سی اے کلاس 1 میڈیکل اور سی پی ایل لائسنس۔"},
            "pathway_notes": {"cpl": "انٹرمیڈیٹ فزکس و ریاضی -> فلائٹ ٹریننگ۔"}
        }
    },
    "graphic-designer": {
        "en": {
            "title": "Graphic Designer",
            "description": "Creates compelling visual communication, brand identities, and multimedia digital assets.",
            "family_name": "Design & Visual Communication",
            "domain_name": "Creative Arts & Design",
            "search_terms": ["Design", "Graphic", "Illustrator", "Photoshop", "Branding", "Visual", "Logo"],
            "requirement_notes": {"skills": "Typography, Color Theory, Adobe Illustrator, Photoshop, Figma, Portfolio."},
            "pathway_notes": {"degree": "B.Des / BFA in Graphic Design or proven industry portfolio."}
        },
        "hi": {
            "title": "ग्राफिक डिज़ाइनर",
            "description": "ब्रांड पहचान, विज़ुअल मीडिया और आकर्षक डिजिटल डिज़ाइन का निर्माण करता है।",
            "family_name": "डिज़ाइन और दृश्य संचार",
            "domain_name": "रचनात्मक कला और डिज़ाइन",
            "search_terms": ["ग्राफिक डिज़ाइनर", "डिज़ाइन", "फोटोशॉप", "इलस्ट्रेटर", "लोगो डिज़ाइन"],
            "requirement_notes": {"skills": "Typography, Adobe Illustrator, Photoshop और पोर्टफोलियो।"},
            "pathway_notes": {"degree": "बी.डेस/बीएफए या उत्कृष्ट पोर्टफोलियो मार्ग।"}
        },
        "ta": {
            "title": "கிராஃபிக் வடிவமைப்பாளர்",
            "description": "பிராண்ட் அடையாளங்கள், விளம்பரங்கள் மற்றும் ஈர்க்கக்கூடிய காட்சி ஊடகங்களை உருவாக்குகிறார்.",
            "family_name": "வடிவமைப்பு & காட்சித் தொடர்பாடல்",
            "domain_name": "கலை & வடிவமைப்பு",
            "search_terms": ["கிராஃபிக் டிசைனர்", "வடிவமைப்பாளர்", "போட்டோஷாப்", "போர்ட்ஃபோலியோ"],
            "requirement_notes": {"skills": "Adobe Illustrator, Photoshop, Figma மற்றும் நேரடி Portfolio."},
            "pathway_notes": {"degree": "வடிவமைப்புப் பட்டம் (B.Des/BFA) அல்லது போர்ட்ஃபோலியோ வழித்தடம்."}
        },
        "te": {
            "title": "గ్రాఫిక్ డిజైనర్",
            "description": "బ్రాండ్ ఐడెంటిటీలు మరియు ఆకర్షణీయమైన విజువల్స్ రూపొందిస్తారు.",
            "family_name": "డిజైన్ & విజువల్ కమ్యూనికేషన్",
            "domain_name": "క్రియేటివ్ ఆర్ట్స్ & డిజైన్",
            "search_terms": ["గ్రాఫిక్ డిజైనర్", "డిజైన్", "ఫోటోషాప్"],
            "requirement_notes": {"skills": "Adobe Illustrator, Photoshop మరియు పోర్ట్‌ఫోలియో."},
            "pathway_notes": {"degree": "బి.డెస్ లేదా పోర్ట్‌ఫోలియో మార్గం."}
        },
        "kn": {
            "title": "ಗ್ರಾಫಿಕ್ ಡಿಸೈನರ್",
            "description": "ಬ್ರಾಂಡಿಂಗ್ ಮತ್ತು ದೃಶ್ಯ ಮಾಧ್ಯಮ ಕಲಾಕೃತಿಗಳನ್ನು ರಚಿಸುತ್ತಾರೆ.",
            "family_name": "ವಿನ್ಯಾಸ ಮತ್ತು ದೃಶ್ಯ ಸಂವಹನ",
            "domain_name": "ಸೃಜನಾತ್ಮಕ ಕಲೆ ಮತ್ತು ವಿನ್ಯಾಸ",
            "search_terms": ["ಗ್ರಾಫಿಕ್ ಡಿಸೈನರ್", "ವಿನ್ಯಾಸಗಾರ"],
            "requirement_notes": {"skills": "Illustrator, Photoshop ಮತ್ತು Portfolio."},
            "pathway_notes": {"degree": "ಬಿ.ಡೆಸ್ ಅಥವಾ ಪ್ರಾಯೋಗಿಕ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ."}
        },
        "ml": {
            "title": "ഗ്രാഫിക് ഡിസൈനർ",
            "description": "ബ്രാൻഡ് ഐഡന്റിറ്റികളും വിഷ്വൽ മീഡിയ ആസ്തികളും രൂപകൽപ്പന ചെയ്യുന്നു.",
            "family_name": "ഡിസൈൻ & വിഷ്വൽ കമ്മ്യൂണിക്കേഷൻ",
            "domain_name": "ക്രിയേറ്റീവ് ആർട്സ് & ഡിസൈൻ",
            "search_terms": ["ഗ്രാഫിക് ഡിസൈനർ", "ഡിസൈൻ"],
            "requirement_notes": {"skills": "Photoshop, Illustrator, പോർട്ട്ഫോളിയോ."},
            "pathway_notes": {"degree": "B.Des അല്ലെങ്കിൽ പോർട്ട്ഫോളിയോ വഴി."}
        },
        "mr": {
            "title": "ग्राफिक डिझायनर",
            "description": "ब्रँड ओळख आणि आकर्षक डिजिटल डिझाइन तयार करतो.",
            "family_name": "डिझाइन आणि दृश्य संप्रेषण",
            "domain_name": "सर्जनशील कला आणि डिझाइन",
            "search_terms": ["ग्राफिक डिझायनर", "कलाकार", "डिझाइन"],
            "requirement_notes": {"skills": "Typography, Photoshop, Illustrator आणि पोर्टफोलिओ."},
            "pathway_notes": {"degree": "बी.डेस किंवा स्वतंत्र पोर्टफोलिओ."}
        },
        "bn": {
            "title": "গ্রাফিক ডিজাইনার",
            "description": "ভিজ্যুয়াল কমিউনিকেশন, ব্র্যান্ড পরিচয় ও ডিজিটাল আর্ট তৈরি করে।",
            "family_name": "ডিজাইন ও ভিজ্যুয়াল কমিউনিকেশন",
            "domain_name": "সৃজনশীল শিল্প ও ডিজাইন",
            "search_terms": ["গ্রাফিক ডিজাইনার", "ডিজাইনার", "ফটোশপ"],
            "requirement_notes": {"skills": "Photoshop, Illustrator ও কাজের পোর্টফোলিও।"},
            "pathway_notes": {"degree": "বি.ডেস বা প্রজেক্ট পোর্টফোলিও রুট।"}
        },
        "gu": {
            "title": "ગ્રાફિક ડિઝાઇનર",
            "description": "બ્રાન્ડિંગ અને આકર્ષક વિઝ્યુઅલ આર્ટવર્ક બનાવે છે.",
            "family_name": "ડિઝાઇન અને વિઝ્યુઅલ કોમ્યુનિકેશન",
            "domain_name": "ક્રિએટિવ આર્ટ્સ અને ડિઝાઇન",
            "search_terms": ["ગ્રાફિક ડિઝાઇનર", "ડિઝાઇન"],
            "requirement_notes": {"skills": "Illustrator, Photoshop અને પોર્ટફોલિયો."},
            "pathway_notes": {"degree": "બી.ડેસ અથવા વ્યવહારુ પોર્ટફોલિયો."}
        },
        "pa": {
            "title": "ਗ੍ਰਾਫਿਕ ਡਿਜ਼ਾਈਨਰ",
            "description": "ਵਿਜ਼ੂਅਲ ਸੰਚਾਰ ਅਤੇ ਬ੍ਰਾਂਡ ਸਮੱਗਰੀ ਦਾ ਨਿਰਮਾਣ ਕਰਦਾ ਹੈ।",
            "family_name": "ਡਿਜ਼ਾਈਨ ਅਤੇ ਵਿਜ਼ੂਅਲ ਸੰਚਾਰ",
            "domain_name": "ਰਚਨਾਤਮਕ ਕਲਾ ਅਤੇ ਡਿਜ਼ਾਈਨ",
            "search_terms": ["ਗ੍ਰਾਫਿਕ ਡਿਜ਼ਾਈਨਰ", "ਡਿਜ਼ਾਈਨਰ"],
            "requirement_notes": {"skills": "Photoshop, Illustrator ਅਤੇ ਪੋਰਟਫੋਲੀਓ।"},
            "pathway_notes": {"degree": "ਬੀ.ਡੈੱਸ ਜਾਂ ਪੋਰਟਫੋਲੀਓ ਮਾਰਗ।"}
        },
        "or": {
            "title": "ଗ୍ରାଫିକ୍ ଡିଜାଇନର୍",
            "description": "ବ୍ରାଣ୍ଡ୍ ପରିଚୟ ଏବଂ ଆକର୍ଷଣୀୟ ଭିଜୁଆଲ୍ ଆସେଟ୍ ପ୍ରସ୍ତୁତ କରନ୍ତି।",
            "family_name": "ଡିଜାଇନ୍ ଏବଂ ଭିଜୁଆଲ୍ ଯୋଗାଯୋଗ",
            "domain_name": "ସୃଜନଶୀଳ କଳା ଏବଂ ଡିଜାଇନ୍",
            "search_terms": ["ଗ୍ରାଫିକ୍ ଡିଜାଇନର୍", "ଡିଜାଇନର୍"],
            "requirement_notes": {"skills": "Illustrator, Photoshop ଏବଂ Portfolio।"},
            "pathway_notes": {"degree": "ବି.ଡେସ୍ କିମ୍ବା ପୋର୍ଟଫୋଲିଓ ପଥ।"}
        },
        "ur": {
            "title": "گرافک ڈیزائنر",
            "description": "برانڈ شناخت اور بصری مواصلاتی ڈیزائن تخلیق کرتا ہے۔",
            "family_name": "ڈیزائن اور بصری مواصلات",
            "domain_name": "تخلیقی فنون اور ڈیزائن",
            "search_terms": ["گرافک ڈیزائنر", "ڈیزائنر", "فوٹوشاپ"],
            "requirement_notes": {"skills": "Photoshop، Illustrator اور پورٹ فولیو۔"},
            "pathway_notes": {"degree": "بی ڈیس یا پورٹ فولیو راستہ۔"}
        }
    }
}
