# jobs/api/ai_search.py
from groq import Groq
import json
from django.conf import settings

client = Groq(api_key=settings.GROQ_API_KEY)

# Keys that match FilterModal.vue exactly (for pre-filling the filter modal)
FILTER_MODAL_KEYS = [
    "search", "location", "roles", "skills", "markets", "level",
    "workType", "contract", "companySizes", "minSalary", "maxSalary",
    "currency", "timeframe",
]

# Default FilterModal-shaped object (contract and roles are arrays)
DEFAULT_EXTRACTED_FILTERS = {
    "search": "",
    "location": "",
    "roles": [],
    "skills": [],
    "markets": [],
    "level": "",
    "workType": "",
    "contract": [],
    "companySizes": [],
    "minSalary": None,
    "maxSalary": None,
    "currency": "",
    "timeframe": "",
}

# AI-only criteria (applied in backend, optional display when in aiMode)
DEFAULT_AI_ONLY = {
    "founderCeoGender": "",
    "companyFoundedAfter": None,
    "companyFoundedBefore": None,
    "employeeMinAge": None,
    "employeeMinExperienceYears": None,
    "targetApplicantGender": "",
}


def _build_ai_applied_criteria(ai_only: dict) -> list:
    """Build human-readable list for display when in aiMode."""
    out = []
    if ai_only.get("founderCeoGender"):
        out.append(f"Founder/CEO: {ai_only['founderCeoGender']}")
    if ai_only.get("companyFoundedAfter") is not None:
        out.append(f"Company founded after {ai_only['companyFoundedAfter']}")
    if ai_only.get("companyFoundedBefore") is not None:
        out.append(f"Company founded before {ai_only['companyFoundedBefore']}")
    if ai_only.get("employeeMinAge") is not None:
        out.append(f"Employee at least {ai_only['employeeMinAge']} years old")
    if ai_only.get("employeeMinExperienceYears") is not None:
        out.append(f"Employee with {ai_only['employeeMinExperienceYears']}+ years experience")
    if ai_only.get("targetApplicantGender"):
        out.append(f"Target applicants: {ai_only['targetApplicantGender']}")
    return out


def _build_rag_context(user_query: str) -> str:
    """
    Retrieve semantically similar jobs and format them as context for the LLM.
    Mirrors the MERN generate-responses.ts retrieveDocuments + buildContextString pattern.
    Falls back to empty string if vector search is unavailable.
    """
    try:
        from jobs.api.vector_search import search_similar_jobs
        from jobs.models import Job
        semantic_ids = search_similar_jobs(user_query, limit=5)
        if not semantic_ids:
            return ""
        jobs = Job.objects.select_related("company").filter(id__in=semantic_ids)
        lines = ["RELEVANT JOB DATA FROM DATABASE:\n"]
        for i, job in enumerate(jobs, 1):
            company = getattr(job, "company", None)
            lines.append(
                f"[{i}] {job.position} at {getattr(company, 'name', 'Unknown')} "
                f"| Level: {job.level} | Location: {job.location} "
                f"| Market: {getattr(company, 'market', '')} "
                f"| Founded: {getattr(company, 'founded_year', 'unknown')} "
                f"| Team size: {getattr(company, 'team_size', 'unknown')}"
            )
        return "\n".join(lines)
    except Exception as e:
        print(f"RAG context retrieval failed (non-fatal): {e}")
        return ""


def extract_filters_from_query(user_query: str) -> dict:
    """
    RAG-powered filter extraction from natural language using Groq LLM.

    Pipeline:
      1. Retrieve semantically similar jobs from sqlite-vec (RAG context)
      2. Build extraction prompt with that context so the LLM sees real examples
      3. LLM extracts structured filters from query + context
      4. Separate into FilterModal filters vs AI-only criteria

    Returns:
        - extracted_filters: only FilterModal keys (search, location, roles, skills, etc.)
          so the client can pre-fill the filter modal and stay in sync.
        - ai_only: founder/CEO gender, company founded year, employee age/experience,
          target applicant gender; applied only in backend; shown when aiMode.
        - ai_applied_criteria: list of human-readable strings for display in aiMode.
    """
    rag_context = _build_rag_context(user_query)
    context_section = f"\nRELEVANT JOB DATA FROM DATABASE:\n{rag_context}" if rag_context else ""

    prompt = f"""Extract job search filters from this natural language query: "{user_query}"
{context_section}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{{
    "search": "",
    "location": "",
    "roles": [],
    "skills": [],
    "markets": [],
    "level": "",
    "workType": "",
    "contract": [],
    "companySizes": [],
    "minSalary": null,
    "maxSalary": null,
    "currency": "",
    "timeframe": "",
    "founderCeoGender": "",
    "companyFoundedAfter": null,
    "companyFoundedBefore": null,
    "employeeMinAge": null,
    "employeeMinExperienceYears": null,
    "targetApplicantGender": ""
}}

Rules (FilterModal fields — use these exact values when possible):
- location: 2-letter ISO country code (e.g. Nigeria→NG, USA→US, UK→GB, Canada→CA)
- roles: from ["Backend", "Frontend", "Full-Stack", "Mobile", "DevOps", "Data"] (match phrasing: frontend developer→Frontend, fullstack→Full-Stack)
- skills: e.g. ["Vue.js", "React", "TypeScript", "Python", "Django", "Node.js", "Tailwind CSS", "HTML/CSS", "REST API"]
- markets: lowercase keys from ["saas", "fintech", "healthtech", "ecommerce", "education", "software", "marketplace", "ai_ml", "devtools", "gaming", "social_media", "cryptocurrency", "security", "climate_tech", "real_estate", "travel", "food_beverage", "others"] (SaaS industry→saas, gaming→gaming)
- level: "junior", "midweight", or "senior" (lowercase)
- workType: "remote", "hybrid", or "onsite" (lowercase)
- contract: array of "contract", "full-time", "part-time", "internship" (lowercase)
- companySizes: array from ["1-10", "11-50", "51-200", "201-500", "500+"] (e.g. "20+ employees"→include "11-50", "51-200" as appropriate; "company size 20+"→["11-50","51-200","201-500","500+"])
- currency: symbol or code ($, £, €, ₦, USD, GBP, etc.)
- timeframe: "hour", "day", "week", "month", or "year" (lowercase)

Rules (AI-only criteria — extract when user mentions them):
- founderCeoGender: "male", "female", or "other" when user says founder/CEO should be man/male or woman/female
- companyFoundedAfter: integer year when user says "established after 2020", "founded after 2019", "recent company"
- companyFoundedBefore: integer year when user says "established before 2020"
- employeeMinAge: integer when user says "at least 25 years old", "employee 25+"
- employeeMinExperienceYears: integer when user says "5+ years experience", "over 5 years experience"
- targetApplicantGender: "male", "female", or "other" when user says "for women/females specifically", "for men/males", "targeting female applicants"

Use empty string "" and empty arrays [] for unmentioned fields. Use null for unmentioned numbers and salaries."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a JSON extraction assistant. Return ONLY valid JSON with the exact keys given."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=600,
            response_format={"type": "json_object"}
        )
        text = response.choices[0].message.content.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        raw = json.loads(text.strip())

        # Normalize contract to list (FilterModal uses array)
        contract = raw.get("contract")
        if isinstance(contract, str) and contract:
            contract = [contract]
        elif not isinstance(contract, list):
            contract = []

        # Build FilterModal-only object (match FilterModal.vue)
        extracted_filters = {k: raw.get(k, DEFAULT_EXTRACTED_FILTERS.get(k)) for k in FILTER_MODAL_KEYS}
        extracted_filters["contract"] = contract
        if extracted_filters.get("roles") is None:
            extracted_filters["roles"] = []
        if extracted_filters.get("skills") is None:
            extracted_filters["skills"] = []
        if extracted_filters.get("markets") is None:
            extracted_filters["markets"] = []
        if extracted_filters.get("companySizes") is None:
            extracted_filters["companySizes"] = []

        # AI-only criteria (applied in backend; optional display in aiMode)
        ai_only = {
            "founderCeoGender": (raw.get("founderCeoGender") or "").strip().lower() or None,
            "companyFoundedAfter": raw.get("companyFoundedAfter"),
            "companyFoundedBefore": raw.get("companyFoundedBefore"),
            "employeeMinAge": raw.get("employeeMinAge"),
            "employeeMinExperienceYears": raw.get("employeeMinExperienceYears"),
            "targetApplicantGender": (raw.get("targetApplicantGender") or "").strip().lower() or None,
        }
        if ai_only["founderCeoGender"] not in ("male", "female", "other"):
            ai_only["founderCeoGender"] = None
        if ai_only["targetApplicantGender"] not in ("male", "female", "other"):
            ai_only["targetApplicantGender"] = None

        return {
            "extracted_filters": extracted_filters,
            "ai_only": ai_only,
            "ai_applied_criteria": _build_ai_applied_criteria(ai_only),
        }
    except Exception as e:
        print(f"AI extraction error: {e}")
        return {
            "extracted_filters": {**DEFAULT_EXTRACTED_FILTERS, "search": user_query},
            "ai_only": dict(DEFAULT_AI_ONLY),
            "ai_applied_criteria": [],
        }