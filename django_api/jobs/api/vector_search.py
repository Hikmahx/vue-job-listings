import sqlite3
import numpy as np
from pathlib import Path
from django.conf import settings
from sentence_transformers import SentenceTransformer
import sqlite_vec

# Load model once (global)
_model = SentenceTransformer('all-MiniLM-L6-v2')

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

def index_job(job):
    """Index a single job (called automatically on save)"""
    # Build searchable text
    text = f"{job.position} {job.company} {job.role} {job.level}"
    if job.skills:
        text += " " + " ".join(job.skills)
    if hasattr(job, 'details') and job.details and job.details.description:
        text += " " + job.details.description[:300]
    
    # Generate embedding
    vector = _model.encode(text).astype(np.float32).tobytes()
    
    # Store
    conn = get_vector_db()
    conn.execute("INSERT OR REPLACE INTO job_vectors VALUES (?, ?)", (str(job.id), vector))
    conn.commit()
    conn.close()

def search_similar_jobs(query, limit=20):
    """Find similar jobs by semantic meaning"""
    query_vector = _model.encode(query).astype(np.float32).tobytes()
    
    conn = get_vector_db()
    results = conn.execute(
        "SELECT job_id, distance FROM job_vectors WHERE vector MATCH ? LIMIT ?",
        (query_vector, limit)
    ).fetchall()
    conn.close()
    
    # Return job IDs sorted by similarity
    return [job_id for job_id, _ in results]