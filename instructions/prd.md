PRD v2 — Clear-Eyed (simplified MVP)
Section	Details
Purpose	Help knowledge workers surface the most relevant mental model for a described challenge and immediately suggest practical ways to apply it.
Success metrics	① Avg. rating ≥ 4.0 ② “No match” rate ≤ 15 % ③ Median latency ≤ 6 s
Top user story	“As a product manager, I paste my dilemma and within seconds see a fitting mental model plus 2–3 concrete ideas on how to use it.”
Functional scope	1. Scenario input (textarea)
2. Intent extraction (LLM → JSON)
3. Hybrid retrieval (symbolic tag filter + vector search) – return best match by similarity score
4. Idea Generator (LLM prompt: ‘Explain why this model applies and give 2-3 action ideas.’)
5. Rating widget (1–5 stars)
6. Admin CRUD for models & tags
Non-functional	Latency ≤ 6 s (p50) • Uptime 99 % • Cost ≤ $0.01/answer
Tech stack	Next.js 15 on Vercel • Supabase (Postgres + pgvector) • OpenAI embeddings + GPT-4o for intent & idea generation
KPI instrumentation	Tables: queries, matches, ratings; Logflare for front-end events
Major risks	1) Similarity-only ranking may surface generic models → Mitigate with richer tag filters; 2) Latency spikes from GPT-4o → Cache embeddings & use streaming

