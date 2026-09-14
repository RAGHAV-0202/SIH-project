# Agentic Tourism Platform — Product and Architecture Brief

## 0. Product Definition

**Product:** A goal-driven, AI-agent tourism platform for India that converts a natural-language travel intent into a constraint-aware, bookable, explainable, and continuously adaptive journey.

**Primary promise:** The traveller states the outcome they want; the platform plans, coordinates, monitors, and proposes or executes the next best action while preserving traveller control at every financially or socially consequential step.

**Core distinction:** This is not a chatbot that returns recommendations. It is a stateful travel operating system with:

1. A persistent traveller model and trip state.
2. A planner that decomposes goals into verifiable subtasks.
3. Specialist agents that use bounded tools and return typed results.
4. An optimizer that resolves time, budget, preference, safety, and availability conflicts.
5. An execution layer for holds, bookings, payments, notifications, and provider coordination.
6. A monitoring loop that detects disruptions and evaluates whether replanning is required.
7. Human approval gates for purchases, cancellations, material itinerary changes, and ambiguous decisions.
8. Versioned plans, provenance, audit logs, and post-trip feedback that improve future plans.

**Repo alignment:** The current codebase already contains intent, transport, stay, activity, booking, optimizer, and replanning agents; a planner/orchestrator; itinerary and booking models; SSE planning progress; and screens for Home, Planning, Itinerary, Confirmation, and Disruption. The brief below turns those demo-oriented seams into a production-shaped product contract.

---

## 1. Product Principles

| Principle | Product rule | Architectural consequence |
|---|---|---|
| Goal over prompt | Capture the traveller's desired outcome, not only the literal request | Store structured constraints, priorities, and unresolved questions |
| Autonomy with consent | Agents may research, compare, monitor, and draft automatically; purchases and destructive changes require explicit approval unless the traveller configured a policy | Capability scopes, approval policies, idempotency, audit events |
| Explainable adaptation | Every material recommendation or change states what changed, why, cost/time impact, and confidence | Evidence/provenance fields on plan items and agent decisions |
| Constraint integrity | Never silently violate budget, dates, traveller count, accessibility, safety, or visa/permit constraints | Constraint validator runs after every plan or mutation |
| Local value creation | Prefer verified local stays, guides, food, crafts, and transport where they fit the traveller's goals and safety requirements | Provider profiles, local-impact metadata, transparent ranking |
| Progressive disclosure | Show the shortest useful answer first; expose reasoning, alternatives, and raw details on demand | Summary-first UI, inspectable decision panels |
| Recovery is a feature | The platform must behave better when conditions change than when they do not | Event ingestion, risk monitoring, plan diff, rebooking workflow |
| Multi-modal access | Support mobile-first interaction, low bandwidth, multilingual copy, voice-ready inputs, and accessible map alternatives | Semantic UI, text fallback, localization, cached trip pack |

---

## 2. Target Users and Jobs to Be Done

### 2.1 Primary traveller segments

| Segment | Job | Failure to avoid |
|---|---|---|
| Explorer / student group | Find a memorable, affordable trip with minimal research | Budget leakage, fragmented bookings, unsafe assumptions |
| Family traveller | Coordinate dates, comfort, food, accessibility, and contingency | Overpacked itinerary, unsuitable transit, poor disruption handling |
| Couple / small group | Balance atmosphere, privacy, local experiences, and spontaneity | Generic recommendations, hidden fees, excessive planning effort |
| International or inter-state visitor | Understand local logistics, language, permits, and payment expectations | Confusing local norms, inability to recover in real time |
| Local provider | Receive qualified demand, manage availability, and represent authentic inventory | Low-quality leads, opaque ranking, no-shows, high platform dependency |

### 2.2 Core JTBD

> When I have a travel goal but not the time or local knowledge to coordinate it, help me reach a trustworthy plan within my constraints, keep it current as reality changes, and let me approve only the decisions that matter.

### 2.3 Non-goals for the first release

- Full online travel agency parity across every airline, rail operator, hotel, and activity provider.
- Unsupervised payment, cancellation, or rebooking without a user-configured authorization policy.
- Medical, legal, immigration, or emergency advice represented as authoritative professional advice.
- A general-purpose social network or open-ended travel content feed.

---

## 3. What Makes the Product Truly Agentic

### 3.1 Standard chatbot versus agentic system

| Capability | Standard chatbot | Agentic tourism platform |
|---|---|---|
| State | Conversation history | Persistent traveller profile, trip state, constraints, plan versions, approvals, bookings, and feedback |
| Objective | Answer the latest message | Optimize a declared travel goal over time |
| Planning | One response generation | Goal decomposition, parallel specialist tasks, validation, ranking, and replanning |
| Tools | Optional search/link output | Typed inventory, maps, weather, transport, provider, payment, notification, and calendar tools |
| Execution | User manually copies results | Agent prepares and, within policy, executes holds/bookings/notifications |
| Monitoring | Stops after response | Watches time-sensitive events and evaluates impact on the active plan |
| Adaptation | User asks what to do | Proactively detects and surfaces relevant changes with alternatives |
| Memory | Short context window | Consent-aware long-term preferences plus trip-specific working memory |
| Accountability | Opaque answer | Decision trace, source/provenance, confidence, policy checks, and audit log |

### 3.2 Agent loop

```text
Goal / event
  -> read traveller + trip state
  -> identify constraints and missing information
  -> decompose into tasks
  -> call bounded tools / specialist agents
  -> normalize and validate evidence
  -> optimize candidate plans
  -> run policy, safety, budget, and availability checks
  -> present plan, request approval, or execute allowed action
  -> observe result / external events
  -> update state, plan version, and memory
  -> repeat until goal is complete or blocked
```

### 3.3 Agent roster

| Agent | Responsibility | Inputs | Outputs | Must not do |
|---|---|---|---|---|
| Intent Agent | Parse natural language into typed travel goals and constraints | Prompt, locale, profile | `TripIntent` with confidence and missing fields | Invent availability or prices |
| Conversation / Clarifier Agent | Ask the smallest set of high-value questions | Intent, uncertainty, profile | Clarifying question or accepted defaults | Ask for information already known |
| Destination Agent | Resolve destination entities and identify seasonality, access, permits, and local context | Destination text, dates, origin | Canonical places, risks, metadata | Treat generated text as verified fact |
| Transport Agent | Search and normalize flight, rail, bus, taxi, and multimodal options | Route, dates, time/budget constraints | Offers with provider, fare rules, inventory timestamp | Promise a booking before confirmation |
| Stay Agent | Match lodging / homestays to comfort, accessibility, location, budget, and local preference | Destination, dates, people, preferences | Stay offers with policies and evidence | Hide taxes, deposits, or cancellation terms |
| Activity Agent | Find experiences, food, culture, nature, and indoor fallback options | Place, time windows, preferences, weather | Activity offers with duration, cost, hours, location, risk | Recommend closed or unverified experiences |
| Safety / Compliance Agent | Evaluate hazards, permits, accessibility, document requirements, and unsupported claims | Candidate plan, context, traveller needs | Warnings, blocks, verification tasks | Make emergency or legal determinations without sources |
| Optimizer Agent | Select a plan across competing objectives | Normalized offers, constraints, policy | Ranked candidate plans and trade-off explanation | Override hard constraints silently |
| Booking Agent | Coordinate holds, confirmations, payments, tickets, and provider acknowledgements | Approved plan, capabilities, payment state | Booking intents, reservations, receipts, failures | Charge without approval/policy |
| Monitoring Agent | Watch disruptions, weather, availability, delays, and deadlines | Active bookings and event feeds | Relevant alerts and impact assessments | Notify on every low-value signal |
| Replanning Agent | Generate minimal-change and best-alternative plans | Active plan, disruption, policies | Plan diff, costs, approvals required | Auto-cancel or rebook outside policy |
| Notification Agent | Deliver concise, localized alerts and trip actions | Events, preferences, urgency | Push/email/SMS/in-app messages | Leak sensitive itinerary data |
| Feedback / Learning Agent | Convert feedback and observed behaviour into consented preference updates | Ratings, skips, edits, trip outcomes | Feedback aggregates and proposed memory updates | Change long-term profile without user control |

### 3.4 Agent contract

Every agent invocation must produce a typed envelope:

```json
{
  "runId": "ar_01J...",
  "agent": "transport",
  "goal": "find_outbound_options",
  "status": "completed",
  "inputRefs": ["trip_01J...", "intent_v3"],
  "toolCalls": [
    {
      "tool": "transport.search",
      "requestId": "req_01J...",
      "provider": "provider_key",
      "startedAt": "2026-09-10T10:00:00Z",
      "completedAt": "2026-09-10T10:00:01Z"
    }
  ],
  "result": {},
  "confidence": 0.91,
  "warnings": [],
  "requiresApproval": false,
  "nextActions": [],
  "traceRef": "trace_01J..."
}
```

### 3.5 Autonomy levels

| Level | Agent may do | User control |
|---|---|---|
| L0: Assist | Explain and suggest | User initiates every action |
| L1: Prepare | Search, compare, draft itinerary, prepare booking basket | User approves each consequential action |
| L2: Coordinate | Parallelize providers, place reversible holds, monitor trip | User approves commit; policy controls hold limits |
| L3: Guardrailed execute | Auto-execute low-risk changes within budget/time policy | User configures policy and receives receipts |
| L4: Recover | Proactively detect disruption, generate alternatives, temporarily reserve if authorized | User approves material route/cost changes |

**Recommended SIH demo:** Demonstrate L1 + L2 during planning and L4 during disruption recovery. Keep real-money execution simulated or sandboxed unless provider integrations and consent controls are production-ready.

### 3.6 Contextual memory

Separate memory by scope and retention:

- **Session memory:** Current conversation and unresolved questions; expires after the session.
- **Trip working memory:** Dates, travellers, constraints, selected options, rejected options, approvals, and plan versions; retained for the trip lifecycle.
- **Profile memory:** Stable preferences such as vegetarian food, no early starts, preferred comfort, language, accessibility, and budget style; user can inspect, edit, or delete.
- **Provider memory:** Reliability, response time, cancellation patterns, and traveller feedback; aggregate and privacy-safe.
- **Derived memory:** Inferences such as “prefers slow travel”; never store as fact without confidence and user correction.

Memory writes require a reason, confidence, source, timestamp, and retention policy. The UI must expose “Why am I seeing this?” and “Forget this preference.”

### 3.7 Proactive behaviour rules

The Monitoring Agent may notify or act only when all conditions hold:

1. The event affects an active trip, deadline, safety condition, or explicit watch.
2. Impact exceeds the traveller's configured threshold.
3. The event is corroborated or marked as unverified.
4. A concrete next action or decision is available.
5. The notification is deduplicated and respects quiet hours.

Example: “Your 07:20 bus is delayed by 90 minutes. This compresses the Day 1 fort visit below your 90-minute minimum. I found a later transfer and moved the visit to Day 3. ₹0 change. Approve?”

---

## 4. Ideal End-to-End User Journey

### 4.1 Journey state machine

```text
DISCOVER
  -> CAPTURE_INTENT
  -> CLARIFY
  -> PLAN_DRAFT
  -> COMPARE_AND_EDIT
  -> APPROVAL_READY
  -> HOLDING
  -> BOOKED
  -> PRE_TRIP
  -> IN_TRIP
  -> RECOVERING (optional loop)
  -> COMPLETED
  -> FEEDBACK
  -> MEMORY_UPDATE (consented)
```

### 4.2 Step-by-step flow

| Step | User experience | Agent/system behaviour | Exit criteria |
|---|---|---|---|
| 1. Landing | Hero asks “Where do you want to go, and what should the trip feel like?” with one prompt field, voice affordance, examples, and a visible “Explore without account” path | Create anonymous session; detect locale; preload safe destination suggestions; do not require sign-up | Valid prompt or guided browse intent |
| 2. Intent capture | User enters free text or chips: origin, destination, dates/duration, group, budget, travel mood, hard constraints | Intent Agent extracts fields, normalizes entities, assigns confidence, identifies missing high-impact fields | `TripIntent` created |
| 3. Clarify | Conversational cards ask at most 3 questions per turn; show assumed defaults inline: “I’ll assume 2 adults and ₹30,000 unless changed.” | Clarifier Agent prioritizes questions by expected impact on plan quality; remembers answers | Hard constraints resolved or explicit defaults accepted |
| 4. Traveller setup | Optional lightweight profile: language, dietary, accessibility, comfort, pace, emergency contact, notification preference | Write only consented profile fields; attach preferences to trip snapshot | Profile usable or skipped |
| 5. Planning workspace opens | Split view: conversation/agent activity on left, live route/map and candidate itinerary on right; progress is meaningful, not decorative | Orchestrator fans out transport, stay, activity, safety, and destination tasks; emits SSE events | Candidate data normalized |
| 6. Candidate plans | Show 2–3 distinct strategies: “Local + slow,” “Balanced,” “Time-saving”; each has total, confidence, key trade-offs, and hard-constraint status | Optimizer scores candidates; Safety Agent blocks invalid ones; provenance attached to each material claim | One candidate selected or edited |
| 7. Inspect and edit | User can change a single item inline without restarting the plan: transit, stay, day, pace, budget, activity | Recompute only affected subgraph; preserve accepted choices; create a new plan version and diff | `PlanVersion` is internally consistent |
| 8. Approval review | Review screen groups decisions into “Included,” “Needs your choice,” “Assumptions,” “Risks,” “Cancellation rules,” and “Total” | Booking Agent validates prices/availability freshness; policy engine computes required approvals | All financial and policy gates resolved |
| 9. Hold / booking | User clicks “Hold for 10 minutes” or “Book selected plan”; payment and cancellation terms are explicit | Create idempotent booking intent; execute parallel provider calls; reconcile partial failures; never report success before provider confirmation | Confirmed reservations or clear recovery state |
| 10. Confirmation | Confirmation has a trip card, reference ID, receipts, calendar export, shareable emergency-safe trip pack, and “Let the agent monitor this trip” toggle | Persist booking refs, plan snapshot, provider policies, notification schedule, and monitoring subscriptions | Active trip created |
| 11. Pre-trip | Timeline shows tasks: documents, packing/weather, check-in, permits, local etiquette, last free cancellation deadlines | Monitoring Agent schedules reminders and rechecks stale inventory; only sends actionable updates | Traveller is trip-ready or tasks acknowledged |
| 12. In-trip mode | “Today” view prioritizes next action, navigation, contact/help, local context, spend, and fallback plan; map has list alternative | Event ingestion evaluates delays/weather/closures; Replanning Agent drafts minimal-change and best-experience alternatives | Current day remains feasible or recovery state opens |
| 13. Disruption recovery | Alert states impact in plain language; compare before/after; show cost/time/experience delta; user can accept, reject, or ask for another option | Create a plan version; reserve alternatives if authorized; request approval for material changes; log all changes | New plan accepted, rejected, or escalated |
| 14. Trip completion | After expected return, ask one-tap sentiment, then targeted questions about specific items; allow photo/story sharing optionally | Match feedback to itinerary items/providers; detect service issues; propose profile updates separately from trip feedback | Feedback submitted or dismissed |
| 15. Post-trip loop | Show “What your agent learned” with toggles: save preference / keep trip-only / delete | Update only approved memory; aggregate provider quality; offer next-trip shortcut based on explicit preferences | Feedback and memory states resolved |

### 4.3 Critical interaction rules

- Never make the user reconstruct the whole prompt after an edit.
- Every agent action has an observable status: queued, running, blocked, completed, stale, or failed.
- Every plan mutation produces a human-readable diff.
- Every price has currency, per-person/total basis, tax/fee status, and freshness timestamp.
- “Book” is never visually equivalent to “Explore.”
- If a provider fails, preserve the rest of the plan and explain the partial state.
- If confidence is low, ask or label uncertainty; do not fill gaps with plausible prose.
- The user can always choose “show me the options” instead of accepting an agent decision.

---

## 5. Information Architecture and Screen Model

### 5.1 Primary navigation

1. Explore
2. My trips
3. Saved preferences
4. Local providers / experiences
5. Help and safety

### 5.2 Core screens

| Screen | Purpose | Required modules |
|---|---|---|
| Explore / landing | Capture intent quickly | Prompt composer, example intents, destination browse, trust signals, guest mode |
| Intent review | Make parsed assumptions editable | Field chips, missing-info prompts, constraints summary, profile toggle |
| Planning workspace | Make the agent work legible | Agent run rail, map, candidate cards, live constraints, cancel/pause |
| Plan comparison | Choose strategy, not a single opaque result | 2–3 plan cards, trade-off matrix, confidence, evidence, “why this?” |
| Itinerary editor | Fine-grained control | Day rail, map/list sync, inline item editing, budget meter, versions/undo |
| Approval and checkout | Confirm consequential actions | Booking basket, terms, price freshness, policy, payment sandbox/real flow |
| Trip command centre | Operate the journey | Today timeline, map, tickets, contacts, spend, checklists, agent status |
| Disruption centre | Recover with minimal cognitive load | Impact banner, before/after diff, alternatives, approval, escalation |
| Post-trip review | Close the learning loop | Item-level feedback, provider rating, memory controls, issue report |
| Provider console | Manage local supply | Availability, booking requests, response SLA, payout/status, content verification |

### 5.3 Recommended information hierarchy

```text
Primary decision: What should I do now?
  Supporting decision: Which option best fits my constraints?
    Evidence: Why is this recommended?
      Details: What are the exact terms, source, and alternatives?
```

---

## 6. UI/UX Best Practices for Agentic Tourism

### 6.1 Conversational interface patterns

- Use a **structured prompt composer**, not an empty chat screen: free text plus destination, date, budget, traveller, pace, and interests chips.
- Let the user correct extracted intent inline: “You mean 5 nights?” with one-tap correction.
- Use progressive questioning: ask only what changes ranking, feasibility, safety, or price.
- Present agent messages as decisions and actions, not internal monologue.
- Use short action-oriented response blocks: “Found 14 stays. 3 fit your budget. 1 is a verified local homestay.”
- Keep the conversation and plan synchronized; editing a card should update the natural-language summary.
- Provide “Ask why,” “Show alternatives,” “Use my usual preference,” and “Do not remember this” affordances.
- Show uncertainty as a label with a reason: “Low confidence — provider has not confirmed availability.”

### 6.2 Bento grids: where they help

Use bento layouts for high-level scanability, not as decoration:

- Trip snapshot: dates, destination, travellers, budget, weather, plan health.
- Candidate strategies: local, balanced, comfort/time.
- Quick actions: change stay, add food preference, share trip, open map, ask agent.
- Safety and logistics: permits, accessibility, check-in, transfer risk.

Avoid bento grids for long itinerary sequences, comparison-heavy content, or emergency states. Those need clear vertical ordering and strong action hierarchy.

### 6.3 Interactive map patterns

- Map and itinerary list must be linked: selecting a day highlights the route; selecting a pin reveals the corresponding item.
- Use route segments and travel-time budgets, not only destination pins.
- Show uncertainty and stale data on the map; do not render estimated paths as confirmed bookings.
- Support list/table fallback for screen readers, low bandwidth, and precise comparison.
- Cluster dense points and preserve a clear “current location / next action” mode during the trip.
- Use map overlays selectively: weather, closure, congestion, opening hours, accessibility, and local provider footprint.
- Avoid making the map the only place where key information exists.

### 6.4 Plan comparison patterns

Use strategy cards with a stable schema:

```text
Strategy name
One-line travel character
Total / per-person cost
Travel time and number of transfers
Local value signal
Top 3 inclusions
Top 2 trade-offs
Constraint status
Confidence + freshness
Select / inspect / compare
```

Do not rank only by price. Use a visible weighted score breakdown such as:

```text
fit = 0.30 preference_match
    + 0.20 budget_headroom
    + 0.15 travel_comfort
    + 0.15 reliability
    + 0.10 local_value
    + 0.10 flexibility
```

Weights must be user-editable or at least explainable. Hard constraints are gates, not weighted preferences.

### 6.5 Disruption UX

The disruption screen must answer in this order:

1. What happened?
2. Does it affect me?
3. What will the agent do if I accept?
4. What changes in time, cost, comfort, and experience?
5. What alternatives exist?
6. What is the deadline to decide?

Use a before/after diff, not a full regenerated itinerary with no explanation. Highlight changed nodes and preserve unchanged items visually. Add a “keep original and handle myself” option.

### 6.6 Trust and safety patterns

- Show provider identity, verification state, source, last refreshed time, and cancellation terms.
- Separate generated copy from sourced facts.
- Add a visible “agent activity” log with tool/provider names at an appropriate level of detail.
- Use confirmation dialogs only for consequential actions; do not modal-block routine edits.
- Explain permissions for location, notifications, calendar, and payment.
- Use recovery language that is calm and specific; never claim certainty when the provider is unconfirmed.

### 6.7 Mobile and India-specific UX requirements

- Mobile-first layout; bottom-sheet details and sticky primary action.
- Support English first, then Hindi and additional regional languages through message catalogs, not hard-coded strings.
- Use INR formatting, per-person and group totals, and UPI-ready payment abstraction.
- Make low-data mode explicit: cached itinerary, tickets, addresses, contacts, and emergency instructions.
- Avoid relying on colour alone for status; use labels, icons, and text.
- Support voice input and transliterated place names; normalize aliases server-side.
- Provide local transport, cash/UPI notes, food preferences, and accessibility context without stereotyping.

### 6.8 Tailwind implementation guidance

- Define semantic tokens (`surface`, `text`, `muted`, `accent`, `danger`, `success`, `warning`) instead of scattering raw colours.
- Define component variants for `status`, `density`, `interactive`, and `disabled` states.
- Keep motion purposeful: agent progress, map transitions, and state changes; respect `prefers-reduced-motion`.
- Build accessible primitives first: focus rings, keyboard navigation, semantic headings, live regions for agent updates, and touch targets.
- Reuse a small component vocabulary: `PromptComposer`, `ConstraintChip`, `AgentRunRail`, `PlanCard`, `ItineraryDay`, `OfferRow`, `ImpactBanner`, `ApprovalSheet`, `EvidenceDrawer`, `FeedbackPrompt`.

---

## 7. Product Logic and Decision Policies

### 7.1 Constraint taxonomy

```js
{
  hard: {
    dates: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' },
    travellers: { adults: 2, children: 0 },
    budget: { amount: 30000, currency: 'INR', basis: 'group_total' },
    accessibility: ['step_free_stay'],
    safety: ['avoid_high_altitude'],
    documents: ['domestic_id_only']
  },
  soft: {
    pace: 'slow',
    preferences: ['culture', 'local_food'],
    comfort: 'standard',
    max_transfers: 2,
    earliest_start: '08:00'
  },
  policy: {
    auto_hold: true,
    auto_rebook_under_inr: 1000,
    max_auto_change_minutes: 60,
    notify_channels: ['in_app', 'push']
  }
}
```

### 7.2 Ranking and optimization rules

1. Reject candidates that violate hard constraints.
2. Reject stale, unverified, or unavailable inventory for booking actions; allow it only as clearly labelled inspiration.
3. Normalize all costs to group total and per-person views.
4. Include transfer buffers, opening hours, check-in/out windows, and realistic local travel time.
5. Prefer a feasible plan with headroom over a nominally cheaper plan that is brittle.
6. Penalize excessive context switching, backtracking, and early starts that contradict the profile.
7. Preserve accepted items unless the disruption makes them infeasible.
8. Generate at least one fallback for every high-risk or time-critical segment.
9. Return a reason code for every selected and rejected candidate.
10. Re-run validation after any manual edit, provider update, or disruption event.

### 7.3 Approval policy matrix

| Action | Default | Configurable? | Approval evidence |
|---|---|---|---|
| Search inventory | Auto | No | Search timestamp |
| Save draft itinerary | Auto | No | Plan version |
| Send a reminder | Auto if enabled | Yes | Notification event |
| Place reversible hold | Ask once per trip | Yes | Hold expiry and policy |
| Book free cancellation item | Ask | Yes | Terms and total |
| Charge payment method | Always ask in MVP | Yes in future | Amount, merchant, consent |
| Cancel reservation | Always ask | No in MVP | Refund/fee disclosure |
| Rebook under configured delta | Ask or auto per policy | Yes | Before/after diff |
| Share itinerary | Always ask | No | Recipient/channel |
| Store new long-term preference | Ask | No | Memory proposal |

### 7.4 Plan versioning

Every plan is immutable after publication. Edits create a new version:

```text
Plan v1 draft
  -> v2 after user selects stay
  -> v3 after booking confirmation
  -> v4 after weather recovery
```

Store `parentVersionId`, `changeSet`, `createdBy` (`user`, `agent`, `provider`, `system`), `reason`, and `approvalRefs`. The active trip points to one accepted version.

---

## 8. High-Level Data Flow

### 8.1 Request-time planning flow

```text
React PromptComposer
  -> POST /api/v1/trips/intents
  -> TripIntent document created
  -> AgentRun started
  -> Orchestrator publishes task commands
      -> intent/clarifier
      -> destination + safety
      -> transport + stay + activity (parallel)
  -> OfferNormalizer writes short-lived offers/cache
  -> Optimizer creates PlanVersion candidates
  -> Validator checks hard constraints + stale data + policy
  -> SSE/WebSocket emits progress and final plan
  -> React renders candidate strategies and map/list
```

### 8.2 Booking flow

```text
User selects plan
  -> POST /api/v1/trips/:tripId/approvals
  -> Approval record + idempotency key
  -> POST /api/v1/bookings/prepare
  -> revalidate offers and terms
  -> optional provider holds in parallel
  -> return approval sheet with final total
  -> POST /api/v1/bookings/commit
  -> provider adapters execute with idempotency keys
  -> reconciliation worker handles partial success/failure
  -> Booking records + ReservationItems + PlanVersion published
  -> notification + trip monitoring subscription
```

### 8.3 Disruption flow

```text
Provider/webhook/weather/event feed
  -> POST /api/v1/events or message broker
  -> Event normalized and deduplicated
  -> Monitoring Agent finds impacted active trips
  -> Impact evaluator calculates severity and affected graph nodes
  -> Replanning Agent generates minimal-change + alternative plans
  -> policy engine determines auto/approval/escalation
  -> notify with diff and deadline
  -> user accepts/rejects/asks for alternatives
  -> booking reconciliation + PlanVersion update
  -> audit + feedback signal
```

### 8.4 Feedback flow

```text
Trip completion trigger
  -> item-level feedback prompts
  -> Feedback documents linked to plan items/providers
  -> aggregate quality signals
  -> propose memory updates
  -> user approves profile changes
  -> update ranking features / provider quality with privacy controls
```

---

## 9. MongoDB Domain Model

### 9.1 Collections

| Collection | Purpose | Key fields |
|---|---|---|
| `users` | Authentication and account metadata | `_id`, email, locale, roles, consentRefs |
| `traveller_profiles` | Stable, user-controlled preferences | userId, dietary, accessibility, pace, comfort, languages, memory entries |
| `trips` | Trip aggregate and current state | userId, status, intentId, activePlanVersionId, policy, monitoringStatus |
| `trip_intents` | Raw prompt plus structured interpretation | rawText, parsed, confidence, assumptions, unresolvedFields |
| `plan_versions` | Immutable candidate/accepted itineraries | tripId, version, parentId, items, totals, score, evidence, changeSet |
| `itinerary_items` | Optional separate collection for large/independently updated plans | planVersionId, day, type, timing, location, offerRef, status |
| `offers` | Short-lived normalized transport/stay/activity inventory | providerId, type, route/place, price, rules, availability, expiresAt |
| `providers` | Supplier identity and trust metadata | type, name, verification, serviceArea, capabilities, contacts |
| `provider_inventory` | Availability and rate snapshots | providerId, slot/date, capacity, price, version, sourceTimestamp |
| `booking_intents` | Pre-commit orchestration | tripId, planVersionId, status, approvalRef, idempotencyKey |
| `reservations` | Confirmed provider-level reservations | bookingId, provider, externalRef, terms, status, amount |
| `bookings` | User-facing trip booking aggregate | bookingId, tripId, status, reservationRefs, paymentRefs |
| `disruptions` | Detected events and resolution lifecycle | type, source, severity, affectedRefs, status, planDiffRefs |
| `agent_runs` | Agent execution trace | tripId, agent, goal, status, tools, confidence, error, traceRef |
| `approvals` | Explicit consent and decisions | actor, action, summary, amount, policy, status, timestamps |
| `notifications` | Delivery and deduplication | userId, tripId, eventKey, channel, status, readAt |
| `feedback` | Trip and item ratings/issues | tripId, itemRef, providerId, rating, tags, text, consent |
| `audit_events` | Append-only accountability log | actor, action, entityRef, payloadHash, timestamp |

### 9.2 Embedding versus references

- Embed small, immutable snapshots that must remain historically accurate: selected offer at booking time, cancellation terms, plan item snapshot, disruption before/after diff.
- Reference high-churn or independently queried objects: providers, live inventory, agent runs, notifications, feedback.
- Do not embed unbounded conversation or agent logs in `trips`; store them separately with retention controls.
- Do not rely on live provider data to render a past receipt or accepted itinerary.

### 9.3 Required indexes and TTLs

```text
users: unique(email)
trips: { userId: 1, updatedAt: -1 }
trips: { status: 1, 'monitoring.nextCheckAt': 1 }
trip_intents: { userId: 1, createdAt: -1 }
plan_versions: { tripId: 1, createdAt: -1 }
offers: { 'queryHash': 1, 'expiresAt': 1 }
offers: TTL on expiresAt for transient inventory
reservations: unique({ providerId: 1, externalRef: 1 })
disruptions: { tripId: 1, status: 1, createdAt: -1 }
agent_runs: { tripId: 1, createdAt: -1 }
notifications: unique({ userId: 1, eventKey: 1 })
feedback: { providerId: 1, createdAt: -1 }
audit_events: { entityType: 1, entityId: 1, createdAt: -1 }
```

### 9.4 Example `Trip` aggregate

```js
{
  _id,
  userId,
  status: 'planning', // planning | approval_required | booked | active | completed | cancelled
  locale: 'en-IN',
  intentId,
  hardConstraints: {},
  softPreferences: {},
  autonomyPolicy: {},
  activePlanVersionId,
  bookingId: null,
  monitoring: {
    enabled: true,
    channels: ['in_app', 'push'],
    nextCheckAt: Date
  },
  createdAt,
  updatedAt
}
```

### 9.5 Example `PlanVersion` item

```js
{
  planVersionId,
  tripId,
  version: 4,
  status: 'accepted',
  items: [
    {
      itemId: 'item_01J',
      day: 2,
      type: 'activity',
      title: 'Local plantation walk',
      startAt,
      endAt,
      location: { placeId, lat, lng, label },
      offerRef,
      cost: { amount: 800, currency: 'INR', basis: 'group_total' },
      status: 'confirmed',
      evidence: [{ source: 'provider', capturedAt, ref }],
      risk: { level: 'low', reasons: [] }
    }
  ],
  totals: { amount: 28400, currency: 'INR', perPerson: 14200 },
  score: { total: 0.87, factors: {} },
  assumptions: [],
  changeSet: [],
  createdBy: { type: 'agent', runId },
  createdAt
}
```

---

## 10. Express / Node API Structure

### 10.1 Route groups

```text
/api/v1/auth
/api/v1/users/me
/api/v1/preferences
/api/v1/trips
/api/v1/trips/:tripId/intent
/api/v1/trips/:tripId/plan
/api/v1/trips/:tripId/plan/stream
/api/v1/trips/:tripId/plan/versions
/api/v1/trips/:tripId/approvals
/api/v1/trips/:tripId/monitoring
/api/v1/trips/:tripId/feedback
/api/v1/offers/search
/api/v1/bookings/prepare
/api/v1/bookings/commit
/api/v1/bookings/:bookingId
/api/v1/bookings/:bookingId/cancel
/api/v1/disruptions/:disruptionId
/api/v1/disruptions/:disruptionId/options
/api/v1/disruptions/:disruptionId/accept
/api/v1/providers
/api/v1/providers/:providerId/inventory
/api/v1/webhooks/:provider
/api/v1/events
/api/v1/health
```

### 10.2 Controller/service separation

```text
routes/                 HTTP shape, auth, validation binding
controllers/            Request/response orchestration only
services/
  tripService.js        Trip lifecycle and state transitions
  planningService.js    Start/resume/cancel planning runs
  bookingService.js     Prepare/commit/reconcile reservations
  disruptionService.js  Impact evaluation and recovery lifecycle
  feedbackService.js    Feedback + memory proposals
agents/                 Bounded agent logic, typed contracts
orchestrator/           Task graph, retries, timeouts, fan-out/fan-in
tools/                  Provider/map/weather/payment adapters
policies/               Approval, safety, consent, budget rules
repositories/           Mongo access and transactions
events/                 Event schemas, publisher, consumer handlers
schemas/                Zod/OpenAPI request and response schemas
workers/                Monitoring, notifications, reconciliation
```

### 10.3 API contract rules

- Prefix all public APIs with `/api/v1`.
- Validate every request and agent result with Zod or equivalent.
- Use a consistent envelope: `{ success, data, error, meta, requestId }`.
- Require `Idempotency-Key` for booking, cancel, accept-plan, and payment-adjacent mutations.
- Propagate `requestId`, `tripId`, `agentRunId`, and `traceId` through logs and provider calls.
- Return `202 Accepted` for long-running planning/recovery commands with a run/status URL.
- Use SSE for simple browser progress; use a queue/event broker for durable work and multiple workers.
- Use optimistic concurrency on trip/plan writes: reject stale `expectedVersion` mutations with a diff.
- Redact passwords, tokens, payment data, sensitive profile fields, and raw provider credentials from logs.

### 10.4 Representative endpoints

#### Create intent

```http
POST /api/v1/trips/intents
Idempotency-Key: client-generated-key
Content-Type: application/json

{
  "prompt": "5 days in Coorg for two people under ₹30,000, slow pace, local food",
  "locale": "en-IN"
}
```

```json
{
  "success": true,
  "data": {
    "tripId": "trip_01J...",
    "intent": {
      "destination": "Coorg",
      "days": 5,
      "travellers": { "adults": 2 },
      "budget": { "amount": 30000, "currency": "INR", "basis": "group_total" },
      "preferences": ["slow", "local_food"],
      "assumptions": [],
      "missing": ["origin", "dates"]
    }
  },
  "meta": { "requestId": "req_01J..." }
}
```

#### Start plan

```http
POST /api/v1/trips/:tripId/plan
{
  "answers": {
    "origin": "Bengaluru",
    "dates": { "start": "2026-10-10", "end": "2026-10-15" }
  },
  "strategyCount": 3
}
```

Return `202` with `agentRunId`, then subscribe:

```http
GET /api/v1/trips/:tripId/plan/stream?runId=ar_01J...
Accept: text/event-stream
```

#### Accept recovery plan

```http
POST /api/v1/disruptions/:disruptionId/accept
Idempotency-Key: accept-key
{
  "optionId": "recovery_option_02",
  "expectedPlanVersion": 4,
  "approval": {
    "costDeltaInr": 0,
    "approved": true
  }
}
```

### 10.5 Error taxonomy

```text
VALIDATION_ERROR        400
UNAUTHENTICATED         401
FORBIDDEN               403
NOT_FOUND               404
STALE_PLAN              409
PROVIDER_UNAVAILABLE    424
APPROVAL_REQUIRED       428
RATE_LIMITED            429
AGENT_TIMEOUT           504
INTERNAL_ERROR          500
```

Errors must include a safe user message, a machine code, a request ID, retryability, and next action. Never expose provider secrets, stack traces, or raw model output.

---

## 11. Orchestration and Reliability

### 11.1 Planning graph

```text
parse_intent
  -> resolve_entities
  -> clarify_if_required
  -> parallel[
       search_transport,
       search_stays,
       search_activities,
       fetch_destination_context,
       evaluate_safety
     ]
  -> normalize_offers
  -> generate_candidates
  -> validate_candidates
  -> rank_candidates
  -> publish_plan
```

### 11.2 Execution requirements

- Timeouts per tool and per agent; never let one provider block the whole plan.
- Retry only idempotent reads automatically; use bounded exponential backoff.
- Circuit-break unreliable providers.
- Cache normalized read results with freshness metadata; never cache confirmed booking state as if live.
- Use Mongo transactions where multiple documents must change together; use outbox events for cross-system publication.
- Reconcile provider state asynchronously after timeout; show “confirmation pending,” not “failed,” until resolved.
- Keep a dead-letter queue for events that cannot be processed safely.
- Support cancellation of a planning run from the UI.
- Persist partial progress so the user can resume after refresh or network loss.

### 11.3 Agent guardrails

- Tool allowlist per agent; no arbitrary HTTP or database access from model-generated code.
- Structured tool arguments only; validate before execution.
- Maximum recursion / step budget per run.
- No model-generated provider IDs, prices, confirmation numbers, or policy text without source data.
- Deterministic post-processing for money, date/time, duration, and constraint checks.
- Prompt and output injection defence for provider content and user-supplied text.
- Human escalation when confidence is below threshold, data conflicts, or policy is ambiguous.

---

## 12. Current Repo Gap Analysis and Refactor Direction

### 12.1 Existing strengths to preserve

- `server/orchestrator/planner.js` already models a sequential agent pipeline and progress events.
- `intentAgent.js` uses a typed Zod schema and retry behaviour.
- `optimizer.js` separates deterministic allocation from LLM logic.
- `replanningAgent.js` demonstrates disruption-specific recovery and before/after state.
- `Booking.js` stores disruption snapshots; this is the seed of plan versioning and auditability.
- `tripRoutes.js` already exposes planning, streaming, booking, and retrieval flows.
- `Disruption.jsx` demonstrates the key SIH differentiator: visible recovery rather than a static itinerary.

### 12.2 High-priority gaps

| Gap | Risk | Refactor |
|---|---|---|
| `User` has only email/password/name | No durable travel memory or consent model | Add profile, preference, consent, notification, and autonomy policy subdomains |
| Itinerary embeds mixed provider data | Hard to version, reconcile, and explain | Introduce immutable `PlanVersion` plus referenced offers/reservations |
| Booking creates a booking directly from client itinerary | Client can submit stale or altered totals | Server-side prepare/revalidate/commit flow with idempotency |
| Planner is sequential | Slow and brittle as integrations grow | Fan-out/fan-in task graph with durable agent runs |
| `/plan-stream` exists but `/plan` is the main client path | User cannot observe or resume work reliably | Make async run/status/stream the canonical planning API |
| Disruption route is demo injection only | No real event ingestion or monitoring lifecycle | Add event normalization, impact evaluator, monitoring subscriptions |
| Disruption snapshots live inside booking | Unbounded growth and weak queryability | Separate `Disruption` and `PlanVersion` collections; retain snapshot refs |
| No explicit approval model | Unsafe autonomous actions | Add `Approval` records and policy engine |
| No evidence/freshness fields | Low trust and stale recommendations | Add provenance to every offer, plan item, and agent decision |
| Client `TripContext` is transient | Refresh loses trip state | Persist server-side trip aggregate and hydrate by trip ID |
| Hard-coded destination data | Limited coverage and no source freshness | Introduce provider adapters and normalized source records |
| Auth is not consistently applied to trip routes | Data ownership and privacy risk | Add auth middleware, user-scoped queries, and access tests |
| No feedback lifecycle | No learning loop | Add completion trigger, item feedback, provider ratings, memory proposals |

### 12.3 Suggested migration sequence

1. Add `/api/v1`, request IDs, auth middleware, Zod schemas, and consistent errors.
2. Introduce `Trip`, `TripIntent`, `PlanVersion`, `AgentRun`, and `Approval` models without removing existing models.
3. Change planning to create a trip and durable agent run; keep current optimizer as a deterministic tool.
4. Move client from transient itinerary-only state to trip hydration by ID.
5. Add plan version diffs and inline edit mutations.
6. Split booking into prepare, approval, commit, and reconciliation.
7. Move disruption injection behind the same event/impact/recovery pipeline used by future webhooks.
8. Add monitoring subscriptions and pre-trip notifications.
9. Add post-trip feedback and consented memory updates.
10. Replace local JSON inventory incrementally with adapter-backed normalized offers.

---

## 13. SIH Demo Narrative and Acceptance Criteria

### 13.1 Five-minute demonstration

1. Enter: “Plan 5 days in Coorg for two under ₹30,000, slow pace, local food, no early mornings.”
2. Show parsed constraints and one clarification: origin.
3. Show parallel agent progress with meaningful labels: transport, local stays, experiences, safety, optimizer.
4. Present three strategies with cost, pace, local value, confidence, and trade-offs.
5. Edit one day or select a different stay; show plan version diff and budget recalculation.
6. Approve simulated booking; show confirmed trip pack.
7. Inject transport cancellation or weather alert through the same event pathway.
8. Show impact summary, two recovery options, changed nodes, cost delta, and user approval.
9. Accept recovery plan; show updated booking/itinerary and audit event.
10. Submit post-trip feedback; show “save this preference?” rather than silently changing memory.

### 13.2 Definition of done for the core slice

- [ ] A natural-language request becomes a validated `TripIntent`.
- [ ] Hard constraints and assumptions are visible and editable.
- [ ] At least three specialist agents run with typed contracts.
- [ ] Agent progress is streamed and resumable.
- [ ] Two or more candidate strategies are comparable.
- [ ] Every selected item has freshness/provenance and a reason code.
- [ ] A plan edit creates a new version and human-readable diff.
- [ ] Booking requires server-side revalidation and explicit approval.
- [ ] A disruption triggers impact evaluation and recovery options.
- [ ] Recovery preserves unaffected items.
- [ ] User can accept, reject, or request another recovery plan.
- [ ] Trip state survives refresh and multi-device re-entry.
- [ ] All consequential actions are idempotent and audited.
- [ ] Accessibility: keyboard path, focus management, reduced motion, semantic status announcements, map list fallback.
- [ ] Security: authenticated ownership checks, secrets redaction, rate limits, input validation, provider webhook verification.
- [ ] Feedback is linked to itinerary items/providers and memory changes are consented.

---

## 14. Measurement Framework

### 14.1 North-star metric

**Constraint-satisfied trip completion rate:** percentage of trips that reach completion with no unresolved hard-constraint violation and with the traveller rating the plan/recovery as acceptable.

### 14.2 Funnel metrics

- Intent completion rate.
- Clarification completion rate.
- Time to first viable plan.
- Plan selection rate.
- Plan edit rate and edit success rate.
- Approval-to-booking conversion.
- Booking reconciliation success rate.
- Disruption detection-to-notification latency.
- Recovery acceptance rate.
- Recovery completion rate without support escalation.
- Post-trip feedback completion.
- Consented preference update rate.

### 14.3 Quality and trust metrics

- Hard-constraint violation rate: target zero.
- Price mismatch rate between displayed approval and provider confirmation.
- Stale-offer exposure rate.
- Unsupported factual claim rate from sampled traces.
- Agent run timeout/error rate.
- Provider confirmation latency.
- Notification false-positive rate.
- User “why this?” helpfulness score.
- Percentage of recommendations with visible evidence and freshness.
- Accessibility task completion rate.

### 14.4 Experimentation rules

- Do not optimize for booking conversion at the expense of constraint satisfaction or transparent terms.
- Separate user preference from model confidence in analytics.
- Log plan candidates and rejected alternatives for offline evaluation without retaining unnecessary personal data.
- Evaluate disruptions using replayable event fixtures and deterministic expected outcomes.

---

## 15. Security, Privacy, and Responsible AI Requirements

- Hash passwords with a modern adaptive algorithm; never log or return credentials.
- Encrypt sensitive data in transit and at rest where supported by the deployment environment.
- Scope every trip, booking, feedback, and provider record by authenticated owner or authorized role.
- Store only the minimum profile and emergency data needed for the feature; provide deletion/export controls.
- Treat location, identity documents, emergency contacts, payment details, and itinerary sharing as sensitive.
- Use explicit consent for location, notifications, calendar, payment, sharing, long-term memory, and provider data reuse.
- Verify provider webhooks with signatures and replay protection.
- Keep generated advice separate from official provider, government, or safety information.
- Add an escalation path for safety alerts, accessibility failures, booking disputes, and vulnerable travellers.
- Provide model trace IDs and safe summaries for support without exposing chain-of-thought or secrets.
- Establish retention schedules for prompts, agent traces, offers, trip history, and feedback.
- Document model limitations, fallback behaviour, and human ownership of booking decisions.

---

## 16. Recommended Technical Baseline

```text
Frontend: React + Vite + Tailwind CSS + accessible component primitives
API: Express.js, versioned REST, SSE for run progress
Validation: Zod shared schemas or generated OpenAPI contracts
Database: MongoDB with immutable plan versions and scoped aggregates
Cache: Redis-compatible cache for short-lived offers and dedupe keys
Async work: BullMQ/Redis initially; broker-compatible event contracts for scale
LLM layer: provider abstraction, structured outputs, tool allowlists, trace IDs
Maps/geo: provider adapter with geocoding, routing, places, and static fallback
Observability: structured logs, metrics, traces, agent-run dashboards
Testing: unit tests for optimizer/policies, contract tests for providers, event replay tests, E2E journey tests
Deployment: separate web/API/worker processes; secrets via environment/secret manager; health/readiness endpoints
```

### 16.1 Minimal shared types

```ts
type AgentStatus = 'queued' | 'running' | 'completed' | 'blocked' | 'failed' | 'cancelled';
type PlanStatus = 'draft' | 'candidate' | 'approval_required' | 'accepted' | 'superseded';
type ReservationStatus = 'pending' | 'held' | 'confirmed' | 'failed' | 'cancelled' | 'reconciling';
type EvidenceSource = 'provider' | 'government' | 'map' | 'weather' | 'user' | 'system';

interface Money {
  amount: number;
  currency: 'INR';
  basis: 'per_person' | 'group_total' | 'per_night' | 'per_item';
}

interface Evidence {
  source: EvidenceSource;
  sourceRef?: string;
  capturedAt: string;
  expiresAt?: string;
  verified: boolean;
}

interface PlanChange {
  itemId: string;
  field: string;
  before: unknown;
  after: unknown;
  reasonCode: string;
  reasonText: string;
  costDelta?: Money;
}
```

---

## 17. Sources and Reference Standards

The following references are design and implementation anchors; they should be checked against the versions used in deployment.

1. Current SIH repository: `server/orchestrator/planner.js`, `server/agents/*.js`, `server/models/*.js`, `server/routes/*.js`, `client/src/pages/*.jsx`, and `client/src/context/TripContext.jsx`.
2. W3C, [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/).
3. MongoDB, [Data Modeling](https://www.mongodb.com/docs/manual/data-modeling/).
4. Express.js, [Routing](https://expressjs.com/en/guide/routing.html).
5. OpenAPI Initiative, [OpenAPI Specification](https://spec.openapis.org/oas/latest.html).
6. OWASP, [Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/).
7. NIST, [AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework).
8. OpenTelemetry, [Documentation](https://opentelemetry.io/docs/).
9. National Payments Corporation of India, [UPI product overview](https://www.npci.org.in/what-we-do/upi/product-overview).
10. Government of India tourism portal, [Incredible India](https://www.incredibleindia.gov.in/).

---

## 18. Architectural Summary

The winning product is not “ChatGPT for itineraries.” It is a trustworthy travel control plane:

```text
Natural-language goal
  -> structured intent + consent
  -> parallel specialist research
  -> deterministic constraint validation and optimization
  -> transparent candidate plans
  -> user approval / policy-controlled execution
  -> monitored reservations and trip state
  -> event-driven disruption recovery
  -> versioned plan + audit trail
  -> post-trip feedback + consented memory
```

The SIH differentiator should be demonstrated through one coherent loop: the agent understands a goal, coordinates multiple domains, makes its reasoning inspectable, executes only within explicit authority, and recovers from real-world disruption while preserving the traveller's intent.
