# jobs/api/ai_search.py
from groq import Groq
import json
from django.conf import settings

client = Groq(api_key=settings.GROQ_API_KEY)

def extract_filters_from_query(user_query: str) -> dict:
    """Extract structured filters from natural language query using Groq LLM"""
    
    prompt = f"""Extract job search filters from: "{user_query}"

Return ONLY valid JSON (no markdown, no explanation):
{{
    "search": "",
    "location": "",
    "roles": [],
    "skills": [],
    "markets": [],
    "level": "",
    "workType": "",
    "contract": "",
    "companySizes": [],
    "minSalary": null,
    "maxSalary": null,
    "currency": "",
    "timeframe": ""
}}

Rules:
- location: 2-letter ISO codes (Nigeria→NG, USA→US, UK→GB, Canada→CA)
- roles: ["Frontend", "Backend", "Fullstack", "Designer", "DevOps", "Mobile", "Data Scientist"]
- skills: ["Vue.js", "React", "TypeScript", "Python", "Django", "Node.js", "Tailwind CSS", "HTML/CSS", "REST APIs"]
- markets: ["saas", "fintech", "healthtech", "ecommerce", "education", "software", "marketplace", "ai_ml", "devtools", "gaming", "social_media", "cryptocurrency", "security", "climate_tech", "real_estate", "travel", "food_beverage"]
- level: "junior", "midweight", or "senior" (lowercase)
- workType: "remote", "hybrid", or "onsite" (lowercase)
- contract: "contract", "full-time", "part-time", or "internship" (lowercase)
- companySizes: ["1-10", "11-50", "51-200", "201-500", "500+"]
- currency: Use symbols like $, £, €, ₦
- timeframe: "hour", "day", "week", "month", or "year" (lowercase)

Use empty arrays [] and empty strings "" for unmentioned fields. Use null for unmentioned salaries."""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a JSON extraction assistant. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        
        # Parse and return
        text = response.choices[0].message.content.strip()
        
        # Clean markdown if present
        if text.startswith('```'):
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]
        
        return json.loads(text.strip())
    
    except Exception as e:
        print(f"AI extraction error: {e}")
        # Fallback
        return {
            "search": user_query,
            "location": "",
            "roles": [],
            "skills": [],
            "markets": [],
            "level": "",
            "workType": "",
            "contract": "",
            "companySizes": [],
            "minSalary": None,
            "maxSalary": None,
            "currency": "",
            "timeframe": ""
        }