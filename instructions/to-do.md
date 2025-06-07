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

### Structured Outputs Migration - ✅ COMPLETE!
**Status**: Fully migrated from text streaming to structured data outputs

**What's Working Perfectly**:
- ✅ Zod schema definition for complete insight structure (`InsightResponseSchema`)
- ✅ Backend `streamObject` implementation with GPT-4o
- ✅ Frontend `useObject` integration for structured streaming
- ✅ Rich visual display with color-coded sections
- ✅ Real-time partial object updates during streaming
- ✅ Type safety from API to UI with TypeScript
- ✅ Comprehensive error handling and user feedback

**Technical Implementation**:
```typescript
// Comprehensive structured response with 6 main sections:
interface InsightResponse {
  analysis: { domain, complexity, key_concepts, mental_models_applied };
  mental_models: Array<{ name, scores, reasoning }>;
  insights: { key_perspectives, blind_spots, reframes };
  action_items: Array<{ title, description, priority }>;
  context: { confidence_level, follow_up_questions, related_concepts };
  metadata: { processing_time_ms, models_considered, models_selected };
}
```

**Quality Results**:
- **Visual Organization**: Color-coded sections (blue analysis, purple models, green insights, orange actions)
- **Transparency**: All retrieval scores (vector + rerank + GPT + reasoning) visible
- **Actionable Output**: Structured action items with priority levels (high/medium/low)
- **Enhanced UX**: Real-time streaming with progress indicators and stop functionality

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

### Enhanced Mental Model Cards - ✅ COMPLETE!
**Status**: Beautiful new card layout with scenario-specific content

**What's Working Perfectly**:
- ✅ Modern card design with emoji icons for each mental model
- ✅ Framework Title with name + tiny brain emoji
- ✅ Core Idea section with 1-sentence essence 
- ✅ Scenario Tie-In with personalized "In your situation..." paragraph
- ✅ Do/Avoid section in two columns with green ✅ and red ❌ emojis
- ✅ One Big Question for reflection with thoughtful scenario-specific prompts
- ✅ Enhanced schema with new fields: scenario_tie_in, do_items, avoid_items, reflection_question
- ✅ Fallback content for graceful degradation
- ✅ Debug transparency section with all retrieval scores

**Technical Implementation**:
```typescript
// Enhanced MentalModelSchema with card-specific fields:
{
  scenario_tie_in: string;     // "In your situation..." paragraph
  do_items: string[];          // 2 concrete actions
  avoid_items: string[];       // 2 pitfalls to avoid  
  reflection_question: string; // Single powerful question
}
```

**Visual Design**:
- Clean white/dark cards with subtle shadows
- Emoji-based iconography for quick recognition
- Two-column Do/Avoid layout with color coding
- Highlighted reflection question in distinct section
- Responsive grid layout for mobile/desktop

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

### User Experience Enhancement - **CURRENT FOCUS**
- [ ] **User Testing**: Test structured output format with real decision scenarios
- [ ] **Mobile Optimization**: Ensure color-coded sections work well on mobile devices
- [ ] **Export Features**: Allow users to save/share structured insights (PDF, notes)
- [ ] **Query History**: Save and revisit previous analyses
- [ ] **Mental Model Rating**: Thumb up/down feedback on individual models

### Content Expansion
- [ ] **More Mental Models**: Add 15-40 additional models (target: 25-50 total)
- [ ] **Mental Model Categories**: Organize by domain (business, personal, cognitive biases)
- [ ] **Related Models**: Suggest complementary mental models
- [ ] **Mental Model Chains**: Apply multiple models in sequence

### Analytics & Insights
- [ ] **Usage Analytics**: Track which models are most useful for different scenarios
- [ ] **Success Metrics**: Measure user satisfaction with structured insights
- [ ] **A/B Testing**: Test different structured output formats
- [ ] **Performance Monitoring**: Track API response times and streaming quality

### Advanced Features
- [ ] **Multi-turn Conversations**: Follow-up questions based on insights
- [ ] **Personalization**: Learn user preferences for mental model selection
- [ ] **Collaborative Features**: Share insights with teams
- [ ] **Integration**: Export to popular productivity tools (Notion, Obsidian, etc.)

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

## 📊 PROJECT STATUS: ~90% Complete - STRUCTURED OUTPUTS BREAKTHROUGH!

**Backend**: 100% done ✅ (3-stage retrieval + structured outputs complete!)  
**Frontend**: 95% done ✅ (structured display + streaming + visual organization)  
**Content**: 80% done (10 mental models with rich context, need more models)  
**Polish**: 85% done (structured UI complete, need mobile optimization + export)

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
  * [x] **Structured Output Generation**: `streamObject` with comprehensive Zod schema.
  * [x] Persist to `queries` & `matches`; return streaming structured response.
* [x] **/api/rate**  – save stars/comment to `ratings`.

### C. Frontend (Next.js 15 + shadcn/ui) - 95% COMPLETE

* [x] **Structured Input**: Rich textarea with scenario examples/placeholders.
* [x] **Structured Streaming Display**: Real-time structured insight generation with `useObject`.
* [x] **Rich Mental Model Cards**: Display matched models with all scores + reasoning.
* [x] **Color-Coded Sections**: Visual organization (blue analysis, purple models, green insights, orange actions).
* [x] **Real-time Partial Updates**: Smooth streaming of structured data during generation.
* [x] **Error Handling**: Comprehensive error states with user-friendly messages.
* [ ] **Rating Interface**: 1-5 stars + optional comment for each suggestion.
* [ ] **Analytics Dashboard**: Query success rates, popular models.

### D. AI/ML Pipeline - ✅ COMPLETE

* [x] **Dual Embeddings**: `text-embedding-3-small` for concept vs application descriptions.
* [x] **Intent Extraction**: GPT-4o structured output for tags, domain, complexity.
* [x] **3-Stage Retrieval**: Vector similarity → Cohere rerank → GPT-4o-mini final selection.
* [x] **Description Generation**: AI-generated scenario-focused descriptions.
* [x] **Reranking**: Cohere rerank-v3.5 with enhanced content preparation.
* [x] **Final Selection**: GPT-4o-mini conceptual relevance filtering with reasoning.
* [x] **Structured Output**: GPT-4o generation with comprehensive Zod schema validation.

### E. Deployment & Monitoring

* [ ] **Vercel deployment**: Production environment setup.
* [ ] **Analytics integration**: Query success tracking for structured insights.
* [ ] **Error monitoring**: Sentry integration for structured output errors.
* [ ] **Performance monitoring**: API response times, streaming quality, structured data validation.

## 🎯 **Current Priority: Content Expansion & User Experience Polish**

**Next Sprint Focus:**
- Add 15+ additional mental models with dual embeddings
- Mobile optimization for structured display sections
- Export functionality for structured insights
- User testing with real decision scenarios

**Technical Achievement**: 🏆 **Production-ready structured insights platform with enterprise-grade 3-stage retrieval!**

---
