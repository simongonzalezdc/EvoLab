# EvoLab - Development Roadmap

**Version:** 1.0  
**Last Updated:** November 15, 2025  
**Planning Horizon:** 18 months (MVP + 3 expansion phases)

---

## Vision & Strategy

**Product Vision:** 
Create the world's most accessible evolution simulator that serves as both an engaging game and a powerful educational tool. EvoLab will democratize understanding of evolutionary biology while building a passionate community of players, educators, and contributors.

**Strategic Goals:**
1. **Launch MVP within 16 weeks** - Deliver playable cell stage with core mechanics fully functional
2. **Achieve 1,000 players in first 3 months** - Build initial community through organic growth (Reddit, HN, YouTube)
3. **Secure 10 classroom adoptions in Year 1** - Partner with educators to validate educational value
4. **Establish sustainable open source project** - Active community, regular releases, healthy contributor base
5. **Generate $15K+ annual revenue by Month 18** - Via Pro tier and educational licenses (optional)

---

## Release Timeline

```
Q4 2025          Q1 2026          Q2 2026          Q3 2026
    |                |                |                |
    MVP v0.1         v0.5             v1.0             v1.5
  (Cell Stage)   (Polish + Data)  (Creature Stage)  (Community)
```

---

## Phase 1: MVP - Cell Stage (Weeks 1-16)

**Goal:** Launch playable cell stage evolution simulator with core mechanics, AI competition, and data visualization

**Target Release:** Week 16 (Early March 2026)

### Milestones

**Week 4: Foundation Complete**
- ✅ Project setup (Vite, TypeScript, PixiJS, tests)
- ✅ Basic cell rendering and WASD movement
- ✅ ATP energy system draining over time
- ✅ Resource collection (glucose particles)
- ✅ Simple procedural lake environment

**Week 8: Genetics System Working**
- ✅ Complete trait system (40+ traits with interconnections)
- ✅ Genome data structure
- ✅ Genetic algorithm (mutations, inheritance)
- ✅ Reproduction system with requirements
- ✅ Trait editor UI

**Week 12: AI & Competition**
- ✅ AI behavior system (herbivore, carnivore, omnivore)
- ✅ Multiple AI species competing
- ✅ Population dynamics
- ✅ Biome system (5-7 distinct zones)
- ✅ Day/night cycle

**Week 16: MVP Launch**
- ✅ Data visualization dashboard (5 core charts)
- ✅ Time controls (1x, 10x, 100x, 1000x)
- ✅ Save/load system
- ✅ Export creatures + evolution history
- ✅ Tutorial + polish
- ✅ Public launch on GitHub, Reddit, Hacker News

### Features (Detailed)

| Feature | Priority | Status | Estimate | Week |
|---------|----------|--------|----------|------|
| **Foundation** |
| Project setup + PixiJS canvas | P0 | Not Started | 2 days | 1 |
| WASD movement + input handling | P0 | Not Started | 2 days | 1 |
| ATP energy system | P0 | Not Started | 3 days | 1-2 |
| Resource collection (glucose, amino acids, phosphates) | P0 | Not Started | 3 days | 2 |
| Basic procedural lake | P0 | Not Started | 4 days | 2-3 |
| **Genetics** |
| Trait system (40+ traits) | P0 | Not Started | 5 days | 4-5 |
| Genome data structure | P0 | Not Started | 2 days | 5 |
| Mutation engine | P0 | Not Started | 3 days | 5-6 |
| Reproduction system | P0 | Not Started | 4 days | 6 |
| Genetic algorithm worker | P0 | Not Started | 3 days | 7 |
| Trait editor UI | P0 | Not Started | 4 days | 7-8 |
| **AI & Environment** |
| AI behavior system | P0 | Not Started | 4 days | 9 |
| Herbivore AI | P0 | Not Started | 2 days | 9 |
| Carnivore AI | P0 | Not Started | 2 days | 10 |
| Omnivore AI | P1 | Not Started | 2 days | 10 |
| Population manager | P0 | Not Started | 3 days | 10-11 |
| Biome generation (Perlin noise) | P0 | Not Started | 4 days | 11 |
| Day/night cycle | P1 | Not Started | 2 days | 12 |
| **Data Visualization** |
| Population chart (D3.js) | P1 | Not Started | 3 days | 13 |
| Evolution tree | P1 | Not Started | 3 days | 13 |
| Trait radar chart | P1 | Not Started | 2 days | 14 |
| Resource bars | P1 | Not Started | 1 day | 14 |
| Biome heatmap | P2 | Not Started | 2 days | 14 |
| **Polish & Systems** |
| Time controls (1x-1000x) | P0 | Not Started | 3 days | 15 |
| Save/load (IndexedDB) | P0 | Not Started | 3 days | 15 |
| Export creatures (JSON) | P1 | Not Started | 2 days | 15 |
| Export history (CSV) | P1 | Not Started | 1 day | 16 |
| Tutorial system | P1 | Not Started | 2 days | 16 |
| Settings panel | P2 | Not Started | 1 day | 16 |
| Performance optimization | P0 | Not Started | 2 days | 16 |

### Success Metrics (Week 16 Targets)

**Technical:**
- [ ] 60 FPS at 1x speed with 200 entities (Mac mini M4)
- [ ] 30 FPS at 100x speed with 200 entities
- [ ] < 3 second load time on 3G
- [ ] 80%+ test coverage on core systems
- [ ] Zero crashes in 1-hour continuous play

**Launch Day:**
- [ ] 100+ GitHub stars
- [ ] 500+ game sessions (analytics)
- [ ] 50+ upvotes on Hacker News "Show HN" post
- [ ] Featured on /r/proceduralgeneration or /r/gamedev

**Week 1 Post-Launch:**
- [ ] 250+ GitHub stars
- [ ] 2,000+ game sessions
- [ ] 10+ bug reports triaged and prioritized
- [ ] 5+ feature requests from community

**Month 1 Post-Launch:**
- [ ] 500+ GitHub stars
- [ ] 10,000+ game sessions
- [ ] 20+ community-shared creatures
- [ ] 3+ blog posts or YouTube videos about EvoLab

### Key Milestones

- **Week 1 (Nov 18-22):** Foundation sprint complete - cell moves, energy drains, resources spawn
- **Week 4 (Dec 9-13):** Playable alpha - can evolve through multiple generations
- **Week 8 (Jan 6-10):** Genetics feature-complete - all 40+ traits working
- **Week 12 (Feb 3-7):** AI competition working - multiple species evolving
- **Week 16 (Mar 3-7):** **MVP LAUNCH** 🚀 - Public release, marketing push

---

## Phase 2: Polish & Data Enhancements (Weeks 17-24)

**Goal:** Improve UX, add advanced data visualizations, optimize performance, gather user feedback

**Target Release:** Week 24 (Late April 2026) - Version 0.5

### Priorities

**User Experience:**
- Onboarding improvements (better tutorial, tooltips)
- UI/UX polish based on user feedback
- Accessibility enhancements (keyboard nav, screen reader support)
- Mobile-friendly UI (responsive design, touch controls)

**Data & Analytics:**
- Advanced visualizations (scatter plots, heat maps, time-lapse replays)
- Genetic drift analysis tools
- "Evolution replay" feature (watch entire lineage history)
- Data export improvements (more formats, custom date ranges)

**Performance:**
- Entity pooling to reduce garbage collection
- Spatial hashing optimization
- Web Worker improvements
- Bundle size reduction (code splitting, tree-shaking)

**Community Features:**
- Creature sharing platform (in-game browser, not just JSON exports)
- Featured creatures gallery
- Weekly evolution challenges
- Leaderboards (longest lineage, highest fitness, fastest evolution)

### Features

| Feature | Priority | Dependencies | Estimate |
|---------|----------|--------------|----------|
| Mobile-responsive UI | P1 | UI refactor | 1 week |
| Touch controls (mobile) | P1 | Mobile UI | 3 days |
| Evolution replay system | P1 | History storage | 5 days |
| Creature gallery (in-game) | P1 | Backend (optional) | 1 week |
| Advanced charts (scatter, etc.) | P2 | D3.js | 4 days |
| Accessibility audit + fixes | P1 | None | 1 week |
| Performance optimization | P0 | Profiling | 1 week |
| Weekly challenges | P2 | Community | 3 days |

### Technical Debt

**Address these issues from MVP rush:**
- Refactor EntityManager (too much responsibility)
- Improve type safety in Genome class (reduce `any` types)
- Add missing tests for edge cases
- Document complex genetic algorithm logic
- Optimize biome generation (cache instead of regenerating)
- Fix memory leak in D3.js charts (proper cleanup)

### Success Metrics (Week 24 Targets)

- [ ] 1,000+ GitHub stars
- [ ] 50,000+ total game sessions
- [ ] 100+ community-shared creatures
- [ ] 10+ active contributors (merged PRs)
- [ ] 5+ classroom adoptions (educators using in lessons)
- [ ] First paid Pro subscription (if monetization launched)

---

## Phase 3: Creature Stage (Weeks 25-40)

**Goal:** Implement creature stage with land environment, body editor, and advanced behaviors

**Target Release:** Week 40 (August 2026) - Version 1.0

### Major Features

**1. Cell → Creature Transition (Weeks 25-28)**
- Complexity threshold system
- Transition animation (cells cluster → creature forms)
- Genetic legacy mapping (cell traits → creature traits)
- Tutorial update for new stage

**2. Creature Body Editor (Weeks 28-32)**
- Modular body parts (head, limbs, tail, etc.)
- Part placement system (drag-and-drop)
- Stats preview (how body shape affects movement)
- Visual customization (colors, patterns)

**3. Land Environment (Weeks 32-36)**
- New biomes (forest, desert, grassland, swamp)
- Terrain generation (hills, valleys, water bodies)
- Flora and fauna (plants for food, decorative elements)
- Weather system (rain, wind affects creatures)

**4. Advanced Behaviors (Weeks 36-40)**
- Hunting mechanics (chase, catch, eat prey)
- Social behaviors (pack formation, territory)
- Tool use (simple puzzles, environmental interaction)
- Vocalizations (communication between creatures)

### Features (Detailed)

| Feature | Priority | Dependencies | Estimate |
|---------|----------|--------------|----------|
| Complexity threshold check | P0 | Cell stage complete | 2 days |
| Transition animation | P1 | PixiJS | 3 days |
| Creature class (base) | P0 | Entity system | 4 days |
| Body part system | P0 | None | 1 week |
| Body editor UI | P0 | React | 1 week |
| Part placement logic | P0 | Physics | 5 days |
| Stats calculation | P0 | Trait system | 3 days |
| Land biome generation | P0 | Perlin noise | 1 week |
| Creature movement (walking, running) | P0 | Matter.js | 5 days |
| Hunting AI | P1 | AI system | 1 week |
| Pack behavior | P2 | AI system | 5 days |
| Weather system | P2 | Environment | 3 days |

### Success Metrics (Week 40 Targets)

- [ ] 2,000+ GitHub stars
- [ ] 100,000+ total game sessions
- [ ] 50+ hours average total playtime per user
- [ ] 25+ classroom adoptions
- [ ] Featured in PC Gamer, Rock Paper Shotgun, or Kotaku
- [ ] $5K+ monthly revenue (Pro + Educational tiers)

---

## Phase 4: Community & Monetization (Weeks 41-52)

**Goal:** Build sustainable open source project with active community and revenue streams

**Target Release:** Week 52 (November 2026) - Version 1.5

### Community Features

**1. Mod Support**
- JSON-based mod system (custom biomes, traits, creatures)
- Mod browser (in-game, sortable by popularity)
- Mod creation guide (documentation)
- Example mods (starter templates)

**2. Multiplayer (Async)**
- Share world states (not just creatures)
- Compete with friends' species in same environment
- Time-lapse comparisons (who evolved better?)
- No real-time multiplayer (too complex for MVP)

**3. Educational Tools**
- Teacher dashboard (track student progress)
- Lesson plan templates (aligned with NGSS standards)
- Quiz integration (test understanding)
- Classroom leaderboards

### Monetization Implementation

**Free Tier (Open Source):**
- Full cell + creature stages
- All core features
- Local saves
- JSON export/import
- No limits

**Pro Tier ($4.99/month):**
- Cloud saves (cross-device sync)
- Advanced analytics (deeper data insights)
- Creature gallery unlimited uploads
- Priority feature requests
- Discord supporter role

**Educational Tier ($99/year per institution):**
- All Pro features
- Teacher dashboard
- Student progress tracking
- Classroom management
- Curriculum materials
- Priority support

### Features

| Feature | Priority | Dependencies | Estimate |
|---------|----------|--------------|----------|
| Mod system architecture | P1 | None | 1 week |
| Mod loader | P1 | JSON parsing | 5 days |
| Mod browser UI | P1 | React | 1 week |
| Example mods (3-5) | P1 | Mod system | 1 week |
| Async multiplayer (share world) | P2 | Backend | 2 weeks |
| Teacher dashboard | P1 | Backend | 3 weeks |
| Lesson plan templates | P1 | Educators | 2 weeks |
| Pro tier payment (Stripe) | P1 | Backend | 1 week |
| Cloud saves (backend) | P1 | AWS/Supabase | 2 weeks |

### Success Metrics (Week 52 Targets)

- [ ] 3,000+ GitHub stars
- [ ] 200,000+ total game sessions
- [ ] 100+ mods published
- [ ] 50+ classroom adoptions
- [ ] 500+ Pro subscribers
- [ ] 10+ Educational tier institutions
- [ ] $15K+ monthly revenue
- [ ] Featured at GDC, PAX, or similar conferences

---

## Future Considerations (Year 2+)

### Potential Features

**Advanced Gameplay:**
- Tribal/civilization stage (simple base-building)
- Technology tree (tools, fire, agriculture)
- Cultural evolution (traditions, art, language)
- Interspecies competition (wars, alliances)

**Educational Expansion:**
- VR mode (for science museums)
- AR mode (mobile, outdoor learning)
- Research mode (export data for papers)
- University partnerships (NSF grants)

**Community:**
- Modding contest (monthly prizes)
- Official mod store (curated, tested)
- Translation to 10+ languages
- Regional servers (EU, Asia, LatAm)

### Technical Improvements

**Performance:**
- WebGPU support (better than WebGL 2.0)
- SIMD optimizations
- Multi-threaded physics
- 10,000+ entities on screen

**Architecture:**
- Migrate to monorepo (creature stage, UI, mods)
- Plugin system (more extensible)
- Headless mode (CI testing, research)

### Scalability

**Infrastructure:**
- CDN for faster loads globally
- Backend API for cloud features
- Database for creature gallery
- Redis for leaderboards

**Business:**
- Enterprise tier (custom branding, white-label)
- Consulting services (custom mods for museums)
- Workshops and training (for educators)
- Conference sponsorships

---

## Dependencies & Risks

### External Dependencies

| Dependency | Impact | Owner | Status | Notes |
|------------|--------|-------|--------|-------|
| PixiJS v8 stability | High | PixiJS team | Stable | Used by major companies, low risk |
| Matter.js maintenance | Medium | brm.io | Active | Last updated recently, healthy project |
| Browser WebGL support | High | Browser vendors | Good | 95%+ support, graceful degradation |
| IndexedDB limits | Medium | Browser vendors | Varies | 50MB+ on most browsers, manageable |
| GitHub hosting | Low | GitHub | Excellent | Free for open source, reliable |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Genetic algorithm too slow** | Medium | High | Use Web Workers, optimize early, profile frequently |
| **Community doesn't grow** | Medium | High | Marketing plan (Reddit, HN, YouTube outreach), interesting content (dev logs, time-lapses) |
| **Scope creep (too many features)** | High | High | Strict MVP definition, defer Phase 2+ features, weekly scope review |
| **Competing project launches** | Low | Medium | Focus on unique strengths (education, data viz), be first to market |
| **Browser compatibility issues** | Medium | Medium | Test on Chrome/Firefox/Safari weekly, provide fallbacks |
| **Performance doesn't meet target** | High | High | Early profiling, entity pooling, spatial hashing, adaptive quality |
| **Open source contributors leave** | Medium | Medium | Build welcoming community, recognize contributors, good docs |
| **Monetization fails** | Low | Medium | Free tier is still valuable, grants/donations as backup |

---

## Resource Planning

### Team Composition

**MVP (Weeks 1-16):**
- Solo developer (you) - Full-stack dev + game design

**Phase 2 (Weeks 17-24):**
- Solo developer - Focus on UX/polish

**Phase 3 (Weeks 25-40):**
- Lead developer (you) - Architecture, core systems
- Part-time contributor (1-2 people) - UI, testing, documentation

**Phase 4 (Weeks 41-52):**
- Lead developer (you) - Monetization, backend
- Community contributors (5-10 people) - Mods, features, bug fixes
- Part-time designer (optional) - UI/UX improvements

### Budget

**Development (Year 1):**
- Developer time: Unpaid (hobby project) - $0
- Domain name (evolab.io or .com): $15/year
- Hosting (Vercel free tier): $0
- Total: **$15/year**

**Infrastructure (Year 1):**
- Vercel Pro (if free tier exceeded): $240/year (optional)
- Supabase (backend for cloud saves): $25/month = $300/year (optional)
- Total: **$0-540/year**

**Marketing (Year 1):**
- Reddit ads (optional): $100 (one-time)
- YouTube sponsorship (optional): $200 (one-time)
- Total: **$0-300**

**Third-party services (Year 1):**
- Umami analytics (self-hosted): $0
- Sentry error tracking (free tier): $0
- Stripe payment processing: 2.9% + $0.30 per transaction (pass-through)
- Total: **$0 upfront**

**Grand Total Year 1: $15-855** (depending on growth)

**Break-even estimate:** 50 Pro subscribers at $4.99/month = $250/month = $3K/year (covers all costs)

---

## Decision Log

### Decision 1: Vanilla TypeScript vs Game Engine

**Date:** November 15, 2025  
**Context:** Need to choose between Godot, Unity, or custom web stack  
**Decision:** Use vanilla TypeScript + PixiJS (no game engine)  
**Rationale:** 
- User wants to code in Cursor, not a game engine IDE
- Web-based = zero install, maximum accessibility
- Full control over code, no vendor lock-in
- PixiJS provides excellent 2D rendering without engine overhead  

**Consequences:**
- ✅ More flexibility, better for open source contributions
- ✅ Easier to integrate web technologies (D3.js, React)
- ❌ More boilerplate code (game loop, physics integration)
- ❌ Slower initial development vs engine

---

### Decision 2: Cell Stage First, Creature Stage Later

**Date:** November 15, 2025  
**Context:** Spore has multiple stages; which to prioritize?  
**Decision:** MVP = Cell Stage only, Creature Stage in Phase 3  
**Rationale:**
- Cell stage is simplest (2D, fewer systems)
- Can validate core mechanics (genetics, evolution, data viz) faster
- Easier to achieve 16-week MVP timeline
- Educators can use cell stage for lessons on natural selection

**Consequences:**
- ✅ Faster MVP, earlier feedback
- ✅ Lower risk (less complexity)
- ❌ Less "Spore-like" initially (no land creatures)
- ❌ Might disappoint users expecting full Spore experience

---

### Decision 3: Open Source from Day 1

**Date:** November 15, 2025  
**Context:** Should we keep code private initially or open source immediately?  
**Decision:** MIT license, GitHub from Day 1  
**Rationale:**
- Educational mission benefits from openness
- Community contributions = faster development
- Trust and transparency attract educators
- Easier to monetize via SaaS (Pro tier) than closed source

**Consequences:**
- ✅ Faster growth, more contributors
- ✅ Better reputation in education sector
- ❌ Risk of forks (competitors copying code)
- ❌ Can't retroactively close source

---

### Decision 4: No Backend for MVP

**Date:** November 15, 2025  
**Context:** Should we build a backend for cloud saves, creature sharing?  
**Decision:** No backend in MVP; IndexedDB only (local storage)  
**Rationale:**
- Reduces MVP scope by 2-4 weeks
- IndexedDB is sufficient for local saves
- JSON export/import enables sharing without server
- Backend added in Phase 2 for Pro tier

**Consequences:**
- ✅ Faster MVP, simpler architecture
- ✅ Works offline, more private
- ❌ No cross-device sync initially
- ❌ Creature sharing is manual (download/upload JSON)

---

### Decision 5: Fast Simulation Speed (1000x) Required

**Date:** November 15, 2025  
**Context:** User wants to observe "hundreds of generations per minute"  
**Decision:** Implement 1x, 10x, 100x, 1000x speed controls  
**Rationale:**
- Critical for educators (show evolution in 1 class period)
- Enables experimentation (try different strategies quickly)
- Differentiates from slow, real-time simulators

**Consequences:**
- ✅ Unique feature, great for education
- ✅ Enables long-term evolution experiments
- ❌ Performance challenge (need Web Workers, spatial hashing)
- ❌ Need adaptive quality scaling (reduce graphics at high speeds)

---

## Appendices

### Backlog (Ideas Parking Lot)

**Low Priority, Future Consideration:**
- Seasonal events (winter, summer biomes)
- Predator-prey sound effects (roars, chirps)
- Multiplayer PvP (real-time battles)
- Blockchain integration (NFT creatures) - **REJECTED**
- Mobile app (native iOS/Android) - **MAYBE Phase 5**
- Steam release (desktop version) - **MAYBE Year 2**
- VR mode (science museums) - **MAYBE Year 2+**

### Ideas Parking Lot

**Community suggestions (not committed):**
- Parasitic behavior tree (steal ATP from hosts)
- Symbiosis system (two species help each other)
- Migration patterns (seasonal movement)
- Disease/pandemic events (random challenges)
- Asteroid impacts (mass extinction events)
- Sexual dimorphism (male/female trait differences)
- Genetic engineering tools (direct gene editing)
- Evolution time-lapse video export

---

**Notes:**
This roadmap is a living document. Priorities may shift based on user feedback, technical challenges, and community contributions. The core commitment is: **MVP (Cell Stage) in 16 weeks, Creature Stage by Month 10, sustainable open source project by Year 1.**

**Last Updated:** November 15, 2025
