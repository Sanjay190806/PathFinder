# Privacy and Integrations

Sanju Career OS v1.5 uses privacy-first integrations.

## Integrations Hub

- LeetCode, LinkedIn, GitHub, YouTube, and Portfolio support link-based or paste-based setup first.
- No user passwords are requested or stored.
- No LinkedIn scraping or authenticated page scraping is performed.
- OAuth secrets must remain backend-only when real API integrations are added.
- Manual sync endpoints report user-provided fields only; they do not pretend to fetch private data.

## Resume Uploads

- Resume upload parsing is designed for temporary processing.
- Uploaded files are not stored permanently by default.
- The backend validates file name, size, extension, and MIME type before parsing.
- Maximum file size is 5MB.
- Allowed formats are PDF, DOCX, TXT, PNG, JPG, JPEG, and WEBP.
- Image OCR is experimental; users can paste extracted text manually if OCR is unavailable.
- Local file paths are never returned to the frontend.

## ATS Analyzer

- The ATS score is an estimated resume-readiness score, not an official ATS score.
- The analyzer checks contact links, education, skills, projects, achievements, formatting, role match, and clarity.
- Suggestions must stay truthful. Do not invent experience, certifications, or metrics.

## Shayla AI Review

- Resume text is sent to Shayla only after the user confirms.
- The AI review request sends extracted text, selected target role/company, ATS score, and keyword gaps.
- API keys and provider credentials are backend-only.
- Shayla must use placeholders when metrics are missing instead of fabricating numbers.
