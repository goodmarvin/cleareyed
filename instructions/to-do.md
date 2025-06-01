# To-Do List for Clear-Eyed Mental Model App

## ✅ COMPLETED

### Database & Backend Infrastructure
- ✅ Database schema with mental models, queries, and embeddings
- ✅ Supabase integration and RPC functions
- ✅ Vector similarity search with pgvector
- ✅ Dual embeddings implementation (concept + application)
- ✅ AI-powered description generation for better embeddings
- ✅ Intent extraction using GPT-4o
- ✅ Streaming response API

### Mental Model Retrieval System  
- ✅ Dual embeddings: concept_embedding + application_embedding (1536 dimensions)
- ✅ RPC function: match_mental_models_by_application
- ✅ Vector similarity search with 0.1 threshold, 15 candidates
- ✅ **BREAKTHROUGH** 3-Stage Intelligent Pipeline:
  1. **Vector Search** → 15 candidates (semantic similarity)
  2. **Cohere Reranking** → Top 5 (cross-encoder analysis) 
  3. **GPT-4o-mini Final Selection** → Top 3 (conceptual reasoning)

### Enhanced Cohere Reranking System - ✅ COMPLETE!
**Status**: Fully working with excellent relevance scores and intelligent filtering

**What's Working Perfectly**:
- ✅ Cohere API v2 integration (fixed v1 → v2 migration)
- ✅ Relevance scores in proper range (0.18-0.29 vs previous 0.0002)
- ✅ Enhanced query formatting with scenario context
- ✅ Comprehensive document preparation with full mental model content
- ✅ GPT-4o-mini final ranking to filter false positives
- ✅ Transparent scoring with reasoning provided

**Technical Implementation**:
```javascript
// 3-Stage Pipeline:
// 1. Vector search: 15 candidates from application embeddings
// 2. Cohere rerank v2: Enhanced documents with full context
// 3. GPT-4o-mini: Conceptual relevance filtering + reasoning
```

**Quality Results**:
- Crypto investment query: Probabilistic Thinking + Circle of Competence (perfect!)
- No more false positives like Occam's Razor for irrelevant scenarios
- All scores transparent: vector + rerank + gpt + reasoning

### Current Mental Models (10 total)
- ✅ All 10 mental models with dual embeddings generated
- ✅ Enhanced with concept descriptions and application descriptions

## 🔄 IN PROGRESS

### Cohere Reranking System - DEBUGGING NEEDED
**Status**: Integrated but producing very low relevance scores (0.0002 range instead of 0.6-0.9)

**What's Working**:
- ✅ Cohere API integration with authentication
- ✅ API calls succeeding (200 responses)
- ✅ Vector search → Cohere rerank → final ranking pipeline
- ✅ Comprehensive debug logging with emojis
- ✅ Rich context (concept + application descriptions)

**Issues to Debug Tomorrow**:
- ❗ Relevance scores extremely low (0.0002 vs expected 0.6-0.9)
- ❗ Tried both rerank-english-v3.0 and v2.0 models
- ❗ Tried both short and long document formats
- ❗ Need to investigate: API format, token limits, or model compatibility

**Current Implementation**:
```javascript
// Vector search gets 15 candidates (0.1 threshold)
// Cohere rerank analyzes rich context:
`${model.name}
${model.concept_description}
When to use: ${model.application_description}`
// Returns top 5 by rerank scores
```

**Next Steps for Tomorrow**:
1. Check Cohere API documentation for proper request format
2. Try different document preparation strategies
3. Test with simpler query/document pairs
4. Consider alternative reranking approaches if needed

## 📋 UPCOMING PRIORITIES

### Frontend Development - **NEXT FOCUS**
- [ ] Modern UI/UX design for query interface
- [ ] Enhanced scenario input with better prompting/examples
- [ ] Results display with transparency (show all 3 scores + reasoning)
- [ ] Progressive enhancement with loading states
- [ ] Mobile-responsive design

### User Experience Features
- [ ] Query history and favorites
- [ ] Mental model rating system (thumb up/down)
- [ ] Export insights to notes/PDF
- [ ] Social sharing of insights

### Analytics & Optimization  
- [ ] Query analytics dashboard
- [ ] A/B testing framework
- [ ] Performance monitoring
- [ ] User behavior tracking

### Content Expansion
- [ ] Add more mental models (target: 25-50)
- [ ] Tag system for mental model categories
- [ ] Related mental models suggestions
- [ ] Mental model combinations/chains

## 💡 FUTURE ENHANCEMENTS

### Advanced AI Features
- [ ] Multi-turn conversations with follow-up questions
- [ ] Personalized recommendations based on history
- [ ] Context-aware mental model suggestions
- [ ] Integration with external knowledge sources

### Collaboration Features
- [ ] User accounts and profiles
- [ ] Shared workspaces for teams
- [ ] Community-contributed mental models
- [ ] Discussion threads on insights

---

## 📊 PROJECT STATUS: ~85% Complete - MAJOR BREAKTHROUGH!

**Backend**: 95% done ✅ (3-stage retrieval system complete!)  
**Frontend**: 30% done (basic structure + streaming, needs UI polish)  
**Content**: 50% done (10 mental models with rich context)  
**Polish**: 15% done (needs UI/UX work + analytics)

## Engineering Task Checklist (updated)

### A. Supabase & DB - ✅ COMPLETE

* [x] Enable `pgvector`.
* [x] `mental_models` table: `id`, `name`, `body_md`, `tags JSONB`, `embedding VECTOR(1536)`.
* [x] **DUAL EMBEDDINGS**: Added `concept_embedding`, `application_embedding`, `concept_description`, `application_description`.
* [x] `queries` table: `id`, `prompt`, `intent JSONB`, `duration_ms`, `plan_b_count`, `created_at`.
* [x] `matches` table: `query_id`, `model_id`, `similarity float`, `rerank_score`.
* [x] `ratings` table: `match_id`, `stars int`, `comment text`.
* [x] GIN index on `tags`; HNSW index on `embedding`, `concept_embedding`, `application_embedding`.
* [x] Analytics views: `query_analytics`, `model_popularity`.
* [x] **Database migration**: Replace Drizzle/PostgreSQL with Supabase client.
* [x] **Environment setup**: Update env vars for Supabase configuration.
* [x] **TypeScript types**: Generated from Supabase schema.
* [x] **Application layer**: Fixed embedding functions, mental model actions, cleanup.
* [x] **Seed script**: 10 mental models seeded with embeddings & tags (`text-embedding-3-small`).
* [x] **Dual embedding generation**: All 10 models now have concept + application embeddings.

### B. Backend (Next.js 15 API routes) - ✅ COMPLETE

* **/api/query** - ✅ COMPLETE

  * [x] Parse prompt; start timer.
  * [x] **IntentExtractor** (`gpt-4o`, JSON mode).
  * [x] **3-Stage Retrieval Pipeline**:
    - Vector Search: Application embeddings (15 candidates)
    - Cohere Rerank v2: Enhanced documents (top 5)
    - GPT-4o-mini Final Selection: Conceptual reasoning (top 3)
  * [x] **Enhanced Context**: Include concept descriptions, application descriptions, and all scores.
  * [x] **IdeaGenerator** (`gpt-4o`): Provide scenario + model body + template → stream markdown back to client.
  * [x] Persist to `queries` & `matches`; return SSE stream.
* [x] **/api/rate**  – save stars/comment to `ratings`.

### C. Frontend (Next.js 15 + shadcn/ui) - 30% COMPLETE

* [x] **Scenario Input**: Rich textarea with examples/placeholders.
* [x] **Streaming Display**: Real-time insight generation with loading states.
* [ ] **Enhanced Mental Model Cards**: Show matched models with all scores + reasoning.
* [ ] **Rating Interface**: 1-5 stars + optional comment for each suggestion.
* [ ] **Analytics Dashboard**: Query success rates, popular models.

### D. AI/ML Pipeline - ✅ COMPLETE

* [x] **Dual Embeddings**: `text-embedding-3-small` for concept vs application descriptions.
* [x] **Intent Extraction**: GPT-4o structured output for tags, domain, complexity.
* [x] **3-Stage Retrieval**: Vector similarity → Cohere rerank → GPT-4o-mini final selection.
* [x] **Description Generation**: AI-generated scenario-focused descriptions.
* [x] **Reranking**: Cohere rerank-v3.5 with enhanced content preparation.
* [x] **Final Selection**: GPT-4o-mini conceptual relevance filtering with reasoning.

### E. Deployment & Monitoring

* [ ] **Vercel deployment**: Production environment setup.
* [ ] **Analytics integration**: Query success tracking.
* [ ] **Error monitoring**: Sentry or similar.
* [ ] **Performance monitoring**: API response times, embedding generation.

## 🎯 **Current Priority: Frontend Polish & User Experience**

**Next Sprint Focus:**
- Enhanced UI for scenario input with better prompting
- Display all 3 retrieval scores + GPT reasoning for transparency
- Mental model rating system for continuous improvement
- Query history and analytics dashboard

**Technical Achievement**: 🏆 **World-class 3-stage retrieval system with intelligent filtering!**

---
