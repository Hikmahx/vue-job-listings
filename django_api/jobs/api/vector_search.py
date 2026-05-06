import sqlite3
import numpy as np
from pathlib import Path
from datetime import date
from django.conf import settings
from sentence_transformers import SentenceTransformer
import sqlite_vec

# Load model once (global)
_model = SentenceTransformer('all-MiniLM-L6-v2')

# Map company team_size integer to band string for semantic search
def _team_size_band(size):
    if size is None:
        return ""
    if size <= 10:
        return "1-10 employees small"
    if size <= 50:
        return "11-50 employees"
    if size <= 200:
        return "51-200 employees"
    if size <= 500:
        return "201-500 employees"
    return "500+ employees large"


def get_vector_db():
    """Get database connection with vec extension"""
    db_path = Path(settings.BASE_DIR) / 'vector.db'
    conn = sqlite3.connect(str(db_path))
    conn.enable_load_extension(True)
    sqlite_vec.load(conn)
    conn.enable_load_extension(False)
    
    # Create table if not exists
    conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS job_vectors USING vec0(
            job_id TEXT PRIMARY KEY,
            vector FLOAT[384]
        )
    """)
    conn.commit()
    return conn

    
def _build_job_index_text(job):
    """Build rich searchable text for a job including company and team context (for RAG)."""
    parts = [job.position, job.role, job.level]
    if job.skills:
        parts.extend(job.skills)
    # Job location
    parts.append(job.location or "")
    # Company: name, market, size, founded year
    company = getattr(job, "company", None)
    if company:
        parts.append(getattr(company, "name", "") or "")
        parts.append(getattr(company, "market", "") or "")
        if getattr(company, "team_size", None) is not None:
            parts.append(_team_size_band(company.team_size))
        if getattr(company, "founded_year", None) is not None:
            parts.append(f"founded {company.founded_year} established")
        # Founder/CEO and employee context (gender, experience, age) for semantic match
        try:
            from companies.models import CompanyMember
            founders = list(
                CompanyMember.objects.filter(company=company, role="founder")
                .select_related("user")
            )
            for m in founders:
                u = getattr(m, "user", None)
                if u and getattr(u, "gender", None):
                    parts.append(f"founder ceo {u.gender}")
            employees = list(
                CompanyMember.objects.filter(company=company, role="employee")
                .select_related("user")
            )
            for m in employees:
                u = getattr(m, "user", None)
                if u:
                    exp = getattr(u, "experience_years", None)
                    if exp is not None and exp > 0:
                        parts.append(f"employee experience {exp} years")
                    dob = getattr(u, "date_of_birth", None)
                    if dob:
                        age = (date.today() - dob).days // 365
                        parts.append(f"employee age {age} years")
        except Exception:
            pass
    # Description snippet
    if hasattr(job, "details") and job.details and getattr(job.details, "description", None):
        parts.append(job.details.description[:400])
    return " ".join(str(p) for p in parts if p)


def index_job(job):
    """Index a single job (called automatically on save). Uses company + accounts context for RAG."""
    from jobs.models import Job as JobModel
    # Re-fetch with select_related so company is always available
    try:
        job = JobModel.objects.select_related("company").get(pk=job.pk)
    except JobModel.DoesNotExist:
        return
    text = _build_job_index_text(job)
    vector = _model.encode(text).astype(np.float32).tobytes()
    conn = get_vector_db()
    conn.execute("INSERT OR REPLACE INTO job_vectors VALUES (?, ?)", (str(job.id), vector))
    conn.commit()
    conn.close()

def search_similar_jobs(query, limit=20):
    """Find similar jobs by semantic meaning (sorted by ascending distance = most similar first)."""
    query_vector = _model.encode(query).astype(np.float32).tobytes()

    conn = get_vector_db()
    # sqlite-vec requires k= in the WHERE clause to control candidate count,
    # and ORDER BY distance to get closest results first.
    results = conn.execute(
        """
        SELECT job_id, distance
        FROM job_vectors
        WHERE vector MATCH ?
          AND k = ?
        ORDER BY distance
        """,
        (query_vector, limit),
    ).fetchall()
    conn.close()

    # Return job IDs sorted by similarity (lowest distance = most similar)
    return [job_id for job_id, _ in results]


def bulk_index_all_jobs():
    """
    Re-index ALL jobs into the vector store.
    Equivalent to the MERN ingestData() function — run this after DB seed or schema changes.

    Usage (from Django shell or management command):
        from jobs.api.vector_search import bulk_index_all_jobs
        bulk_index_all_jobs()
    """
    from jobs.models import Job as JobModel
    jobs = JobModel.objects.select_related("company").all()
    conn = get_vector_db()
    # Clear existing index
    conn.execute("DELETE FROM job_vectors")
    conn.commit()
    count = 0
    for job in jobs:
        try:
            text = _build_job_index_text(job)
            vector = _model.encode(text).astype(np.float32).tobytes()
            conn.execute("INSERT OR REPLACE INTO job_vectors VALUES (?, ?)", (str(job.id), vector))
            count += 1
        except Exception as e:
            print(f"[INGEST] Failed to index job {job.id}: {e}")
    conn.commit()
    conn.close()
    print(f"[INGEST] ✓ Indexed {count} jobs into vector store")
    return count


def remove_job_from_index(job_id: str) -> None:
    """Remove a single job from the vector store (called on delete)."""
    conn = get_vector_db()
    conn.execute("DELETE FROM job_vectors WHERE job_id = ?", (str(job_id),))
    conn.commit()
    conn.close()
    print(f"[INGEST] ✓ Removed job {job_id} from vector store")
