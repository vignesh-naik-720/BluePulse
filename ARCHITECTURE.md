# BluePulse Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                    http://localhost:5173                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      REACT FRONTEND                             │
│                    (Vite Dev Server)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                        App.tsx                             │ │
│  │  - Manages global state                                    │ │
│  │  - Fetches articles on mount                               │ │
│  │  - Orchestrates data flow                                  │ │
│  └──────────┬──────────────────────────────┬──────────────────┘ │
│             │                              │                     │
│  ┌──────────▼──────────┐      ┌───────────▼──────────┐          │
│  │  DailyDigest.tsx    │      │  TipOfTheDay.tsx     │          │
│  │  - Shows AI summary │      │  - Shows daily tip   │          │
│  │  - Loading state    │      │  - Highlight style   │          │
│  └─────────────────────┘      └──────────────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ArticlesList.tsx                            │   │
│  │  - Displays 5-7 headlines                                │   │
│  │  - External links                                        │   │
│  │  - Date formatting                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              QnABox.tsx                                  │   │
│  │  - Floating chat UI                                      │   │
│  │  - Sends questions to backend                            │   │
│  │  - Displays AI answers                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────┬───────────────────────┬─────────────────────┘
                     │                       │
                     │ fetch()              │ fetch()
                     │ GET                  │ POST
                     │                      │
┌────────────────────▼──────────────────────▼─────────────────────┐
│                    EXPRESS BACKEND                              │
│                 http://localhost:3001                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │       GET /api/fetch-feeds                              │   │
│  │  1. Fetches RSS from UNEP, NOAA, Guardian              │   │
│  │  2. Parses XML with rss-parser                          │   │
│  │  3. Filters for ocean-related content                   │   │
│  │  4. Returns top 5-7 articles                            │   │
│  └───────────────────────┬─────────────────────────────────┘   │
│                          │                                      │
│  ┌───────────────────────▼─────────────────────────────────┐   │
│  │       POST /api/summarize                               │   │
│  │  1. Receives articles + optional question               │   │
│  │  2. Builds prompt for Cerebras AI                       │   │
│  │  3. Calls Cerebras API (Llama 3.3-70B)                  │   │
│  │  4. Returns digest + tip OR answer                      │   │
│  └───────────────────────┬─────────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           │ HTTPS
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  UNEP RSS    │  │  NOAA RSS    │  │ Guardian RSS │
│  Feed        │  │  Feed        │  │  Feed        │
└──────────────┘  └──────────────┘  └──────────────┘
                           │
                           │ HTTPS
                           ▼
                  ┌──────────────────┐
                  │  CEREBRAS API    │
                  │  Llama 3.3-70B   │
                  └──────────────────┘
```

## Data Flow

### 1. Initial Page Load

```
User opens app
    ↓
App.tsx useEffect() triggers
    ↓
fetchArticles() calls GET /api/fetch-feeds
    ↓
Backend fetches RSS from 3 sources
    ↓
Backend parses and filters articles
    ↓
Returns array of 5-7 articles to frontend
    ↓
App.tsx calls fetchSummary(articles)
    ↓
POST /api/summarize with articles
    ↓
Backend sends articles to Cerebras AI
    ↓
AI returns JSON with digest + tipOfTheDay
    ↓
Frontend updates state and displays results
```

### 2. Q&A Interaction

```
User clicks chat icon
    ↓
QnABox component opens
    ↓
User types question and clicks Send
    ↓
POST /api/summarize with articles + question
    ↓
Backend sends question + articles to Cerebras AI
    ↓
AI returns answer based on articles
    ↓
QnABox displays answer in chat interface
```

## Component Hierarchy

```
App (src/App.tsx)
│
├── Header
│   ├── Logo (Waves icon)
│   └── Title + Subtitle
│
├── Main Content
│   ├── DailyDigest (src/components/DailyDigest.tsx)
│   │   ├── Icon (Newspaper)
│   │   ├── Title
│   │   └── Summary Text (3 sentences)
│   │
│   ├── TipOfTheDay (src/components/TipOfTheDay.tsx)
│   │   ├── Icon (Lightbulb)
│   │   ├── Title
│   │   └── Tip Text (1 sentence)
│   │
│   └── ArticlesList (src/components/ArticlesList.tsx)
│       ├── Title
│       └── Article Cards (5-7 items)
│           ├── Title (clickable)
│           ├── Content Preview
│           ├── Date
│           └── External Link Icon
│
├── QnABox (src/components/QnABox.tsx)
│   ├── Floating Button (when closed)
│   └── Chat Panel (when open)
│       ├── Header with Close button
│       ├── Answer Display
│       ├── Input Field
│       └── Send Button
│
└── Footer
    └── Credits
```

## API Request/Response Formats

### Fetch Feeds Endpoint

**Request:**
```http
GET /api/fetch-feeds HTTP/1.1
Host: localhost:3001
```

**Response:**
```json
{
  "articles": [
    {
      "title": "Plastic Pollution Threatens Marine Life",
      "url": "https://www.unep.org/news/plastic-pollution",
      "content": "Recent studies show that plastic pollution...",
      "date": "2025-10-02T10:30:00.000Z"
    },
    ...
  ]
}
```

### Summarize Endpoint (Digest Mode)

**Request:**
```http
POST /api/summarize HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "articles": [
    { "title": "...", "content": "...", ... }
  ]
}
```

**Response:**
```json
{
  "digest": "Recent reports highlight escalating ocean pollution from plastic waste. Scientists warn that marine ecosystems face unprecedented threats from microplastics. Coastal communities are implementing new conservation measures to protect marine life.",
  "tipOfTheDay": "Bring a reusable water bottle and coffee cup to reduce single-use plastic waste."
}
```

### Summarize Endpoint (Q&A Mode)

**Request:**
```http
POST /api/summarize HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "articles": [ ... ],
  "question": "What are the main sources of ocean pollution?"
}
```

**Response:**
```json
{
  "answer": "According to the articles, the main sources of ocean pollution include plastic waste from consumer products, industrial runoff, and coastal development. Microplastics from broken-down bottles and bags are particularly concerning."
}
```

## State Management

### App.tsx State

```typescript
const [articles, setArticles] = useState<Article[]>([])
// Stores fetched RSS articles

const [summary, setSummary] = useState<SummaryData>({
  digest: '',
  tipOfTheDay: ''
})
// Stores AI-generated summary and tip

const [loadingArticles, setLoadingArticles] = useState(true)
// Loading state for RSS fetch

const [loadingSummary, setLoadingSummary] = useState(false)
// Loading state for AI summarization
```

### QnABox State

```typescript
const [isOpen, setIsOpen] = useState(false)
// Chat panel open/closed state

const [question, setQuestion] = useState('')
// User's input question

const [answer, setAnswer] = useState('')
// AI's response

const [loading, setLoading] = useState(false)
// Loading state for question processing
```

## Error Handling

### Frontend Error States

1. **Network Error**: Shows fallback message
2. **Empty Articles**: Displays "No articles found"
3. **API Key Missing**: Shows configuration error
4. **Timeout**: Generic error message

### Backend Error Handling

1. **RSS Parse Failure**: Logs error, continues with other feeds
2. **Cerebras API Error**: Returns fallback response
3. **Invalid Request**: Returns 400 status
4. **Server Error**: Returns 500 with error message

## Performance Optimizations

1. **Parallel RSS Fetching**: All 3 feeds fetched simultaneously
2. **Content Filtering**: Only relevant articles processed
3. **Limited Results**: Max 7 articles to reduce payload
4. **Vite Code Splitting**: Optimized bundle size
5. **React Memo**: Could be added to prevent unnecessary re-renders

## Security Considerations

1. **API Key Protection**: Stored in .env, never exposed to client
2. **CORS Configuration**: Properly configured for cross-origin requests
3. **Input Sanitization**: HTML stripped from RSS content
4. **HTTPS**: Recommended for production
5. **Rate Limiting**: Should be implemented for production

## Scalability

### Current Limitations
- No caching (fetches RSS every time)
- No database (data not persisted)
- Synchronous API calls
- No rate limiting

### Scaling Strategies
1. **Add Redis**: Cache RSS results for 15 minutes
2. **Database**: Store articles for faster retrieval
3. **Queue System**: Process AI requests asynchronously
4. **CDN**: Serve static assets from CDN
5. **Load Balancer**: Distribute traffic across multiple servers

## Technology Choices

### Why React?
- Component reusability
- Strong TypeScript support
- Large ecosystem
- Excellent developer experience

### Why Vite?
- Extremely fast HMR
- Modern build tool
- Simple configuration
- Optimized production builds

### Why Express?
- Minimal and flexible
- Easy RSS parsing integration
- Simple API creation
- Wide npm ecosystem

### Why Cerebras?
- Fast inference times
- Powerful Llama models
- Simple API
- Cost-effective

### Why TailwindCSS?
- Rapid UI development
- Consistent design system
- Small production bundle
- Easy responsive design

## Deployment Architecture

### Production Setup

```
┌──────────────┐
│   Vercel     │  ← Frontend (React + Vite)
│  (Frontend)  │     Static site hosting
└──────┬───────┘
       │
       │ API Calls
       │
       ▼
┌──────────────┐
│   Railway    │  ← Backend (Express.js)
│  (Backend)   │     Container hosting
└──────┬───────┘
       │
       │ HTTPS
       │
       ▼
┌──────────────┐
│  Cerebras AI │  ← AI Processing
│     API      │     Managed service
└──────────────┘
```

## Monitoring and Logging

### Frontend Logs
- `console.error()` for errors
- Could add: Sentry, LogRocket

### Backend Logs
- `console.log()` for info
- `console.error()` for errors
- Could add: Winston, Pino

### Metrics to Track
- API response times
- Error rates
- RSS fetch failures
- Cerebras API usage
- User engagement

---

This architecture provides a solid foundation for a production-ready application while remaining simple enough for easy maintenance and enhancement.
