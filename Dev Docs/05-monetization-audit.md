# EvoLab - Monetization Audit

**Version:** 1.0  
**Last Updated:** November 15, 2025  
**Model:** Open Core + Hosted SaaS (Freemium)  
**License:** MIT

---

## Executive Summary

EvoLab uses an **open core model** where the entire game remains free and open source (MIT license), with optional paid tiers for cloud features, advanced analytics, and educational tools. This approach maximizes accessibility for students while creating sustainable revenue from power users, educators, and institutions.

**Key Insight:** Free tier drives adoption and community growth → Community drives organic marketing → Pro tier captures 2-5% of engaged users → Educational tier targets institutions with budget.

**Revenue Targets:**
- **Year 1:** $5K-15K (50-250 Pro subscribers + GitHub Sponsors)
- **Year 2:** $25K-50K (500+ Pro subscribers + 10+ educational licenses)
- **Year 3+:** $75K-150K (grants, partnerships, workshops, consulting)

---

## Revenue Streams

### 1. Pro Tier (SaaS Subscription)

**Price:** $4.99/month or $49/year (save 18%)

**Target Audience:**
- Evolution enthusiasts who want cloud sync across devices
- Content creators who need advanced analytics for videos
- Data scientists experimenting with genetic algorithms
- Casual players who value convenience

**Features:**
- ☁️ **Cloud Saves** - Sync progress across desktop, laptop, tablet
- 📊 **Advanced Analytics** - Download CSV/JSON exports with full evolution history
- 🎨 **Creature Gallery Access** - Browse + import 10,000+ community creatures
- 🚀 **Early Access** - New features 2-4 weeks before free tier
- 💬 **Priority Support** - Discord support channel with faster response
- 🎯 **Custom Challenges** - Create and share evolution scenarios
- 📈 **Performance Mode** - Higher entity limits (500 vs 200 free tier)

**Conversion Strategy:**
- Free tier shows "Upgrade to Pro" prompt after 10+ hours of play
- Gentle reminders when using export features ("Pro users get one-click cloud backup")
- Feature comparison table in settings menu
- 7-day free trial for Pro (credit card required)

**Projected Revenue:**
- Month 1-3: 10-20 subscribers = $50-100/month
- Month 4-6: 30-50 subscribers = $150-250/month
- Month 7-12: 50-100 subscribers = $250-500/month
- Year 1 Total: **$3K-6K**

**Conversion Rate Assumptions:**
- 1,000 active users → 20-50 Pro subscribers (2-5% conversion)
- 10,000 active users → 200-500 Pro subscribers (2-5% conversion)
- Industry benchmark for freemium games: 2-10% (we target conservative 2-5%)

---

### 2. Educational Tier (Institutional License)

**Price:** $99/year per institution (unlimited students)

**Target Audience:**
- High school biology teachers (grades 9-12)
- College/university instructors (intro biology, genetics, comp bio)
- Science museums with interactive exhibits
- Homeschool co-ops and learning centers

**Features:**
- 👥 **Classroom Management** - Teacher dashboard to monitor student progress
- 📚 **Curriculum Materials** - Lesson plans, worksheets, assessment rubrics
- 📊 **Student Analytics** - Track which concepts students struggle with
- 🎓 **Certification System** - Badges for completing evolution challenges
- 🔒 **COPPA/FERPA Compliance** - Privacy-safe student accounts
- 🎮 **Customizable Scenarios** - Teachers create challenges aligned with standards
- 💾 **Offline Mode** - Works without internet (for schools with limited WiFi)

**Sales Strategy:**
- Target biology teachers on Twitter, Reddit r/ScienceTeachers
- Free 90-day pilot program for first 20 schools
- Require testimonials + case studies from pilot schools
- Partner with curriculum platforms (Teachers Pay Teachers, Khan Academy)
- Present at education conferences (NSTA, ISTE)

**Projected Revenue:**
- Year 1: 10-20 schools = $1K-2K
- Year 2: 30-50 schools = $3K-5K
- Year 3: 100+ schools = $10K+

**Customer Acquisition Cost:**
- Pilot program costs: $0 (just support time)
- Conference booth: $500-1,000
- Curriculum materials development: $2K (one-time)
- Expected CAC: $50-100 per school (low due to word-of-mouth)

---

### 3. GitHub Sponsors / Donations

**Platform:** GitHub Sponsors (preferred) + Patreon (optional)

**Tiers:**
- **$5/month (Supporter)** - Name in credits, Discord supporter role
- **$25/month (Sponsor)** - All above + early access to roadmap, monthly dev updates
- **$100/month (Partner)** - All above + quarterly 1-on-1 call with creator, feature prioritization input

**Target Audience:**
- Open source enthusiasts who believe in the mission
- Educators who can't pay but want to support
- Developers learning from the codebase

**Projected Revenue:**
- Year 1: 5-15 sponsors = $500-1,500/year
- Year 2: 20-40 sponsors = $2K-5K/year

**Marketing:**
- GitHub Sponsors banner in README
- Acknowledge sponsors in release notes
- Monthly "thank you" posts on social media

---

### 4. Grants & Partnerships

**Target Organizations:**
- **Mozilla Foundation** - Open source education tools grants ($25K-100K)
- **Chan Zuckerberg Initiative** - Science education grants ($50K-250K)
- **National Science Foundation (NSF)** - STEM education grants ($100K-500K)
- **Google for Education** - Chromebook-friendly tools partnerships
- **Museums** - Science museum partnerships for interactive exhibits

**Application Strategy:**
- Apply for 2-3 grants per year (Year 2+)
- Requires: proven user adoption, educational outcomes data, technical roadmap
- Timeline: 6-12 month application process

**Projected Revenue:**
- Year 2: $0-25K (first grant applications)
- Year 3+: $25K-100K/year (if grant successful)

---

### 5. Workshops & Consulting

**Services:**
- **Workshop:** "Building Evolution Simulators with TypeScript + PixiJS" ($1K-2K per event)
- **Consulting:** Custom mods for museums or educational institutions ($5K-15K per project)
- **Training:** Teacher professional development workshops ($500-1K per session)

**Timeline:**
- Year 2+ (after MVP is established and proven)

**Projected Revenue:**
- Year 2: $2K-5K (2-3 workshops)
- Year 3+: $10K-25K (5-10 workshops + 1-2 consulting projects)

---

## Cost Structure

### Fixed Costs (Annual)

| Item | Year 1 | Year 2 | Year 3+ | Notes |
|------|--------|--------|---------|-------|
| **Domain Name** | $15 | $15 | $15 | evolab.io or .com |
| **Vercel Hosting** | $0-240 | $240 | $240 | Free tier → Pro when traffic grows |
| **Supabase (Backend)** | $0 | $300 | $300 | Free tier → Pro for cloud saves |
| **Sentry (Error Tracking)** | $0 | $0 | $0 | Free tier sufficient |
| **Umami Analytics** | $0 | $0 | $0 | Self-hosted |
| **Stripe (Payment)** | 2.9% + $0.30/txn | 2.9% + $0.30/txn | 2.9% + $0.30/txn | Pass-through cost |
| **Marketing** | $100-300 | $500 | $1,000 | Reddit ads, YouTube sponsorships |
| **Conference Fees** | $0 | $500-1,000 | $1,000-2,000 | Education conferences (optional) |
| **Legal (Incorporation)** | $0 | $0-500 | $0 | Optional LLC setup |
| **TOTAL** | **$115-555** | **$1,555-2,055** | **$2,555-3,555** |

### Variable Costs

- **Developer Time:** $0 (hobby project, solo developer)
- **Contributors:** $0 (open source volunteers)
- **Support:** $0 (community Discord, asynchronous)

**Note:** Labor costs excluded because this is a passion project. If hiring developers in Year 2+, budget $50K-100K/year.

---

## Break-Even Analysis

### Year 1 Scenario

**Costs:** $555 (conservative estimate)  
**Revenue Needed:** $555 to break even  
**Required Subscribers:** 10-12 Pro users at $4.99/month OR 6 educational licenses at $99/year

**Conservative Projection:**
- Pro: 50 subscribers × $4.99 = $250/month = $3,000/year
- Educational: 10 schools × $99 = $990/year
- Sponsors: $500/year
- **Total:** $4,490/year

**Result:** Break even in Month 3-4, profitable by Month 6

### Year 2 Scenario

**Costs:** $2,055 (with Vercel Pro, Supabase, marketing)  
**Revenue Needed:** $2,055 to break even  
**Required Subscribers:** 35-40 Pro users OR 21 educational licenses

**Target Projection:**
- Pro: 200 subscribers × $4.99 = $998/month = $11,976/year
- Educational: 30 schools × $99 = $2,970/year
- Sponsors: $2,000/year
- Workshops: $3,000/year
- **Total:** $19,946/year

**Profit Margin:** $17,891 (90% margin)

---

## Competitive Analysis

### Direct Competitors

**Thrive (Open Source Evolution Game):**
- Pricing: 100% free (no monetization)
- Strengths: Active community, 3D graphics, deep simulation
- Weaknesses: Steep learning curve, slow performance, no education features
- **Lesson:** We can win on accessibility (browser-based, faster), education focus, and monetization

**Species: ALRE (PC Game on Steam):**
- Pricing: $19.99 one-time purchase
- Strengths: Polished UI, deep genetics system
- Weaknesses: Closed source, no education tools, desktop-only
- **Lesson:** We compete on openness, accessibility (browser), and free tier

**Spore (EA Game):**
- Pricing: $19.99-39.99 (legacy game)
- Strengths: AAA production quality, creature editor, well-known IP
- Weaknesses: Proprietary, no evolution depth, no data export, abandoned
- **Lesson:** We compete on modern web tech, education focus, data transparency

### Indirect Competitors (Education Tools)

**PhET Simulations (University of Colorado):**
- Pricing: 100% free (grant-funded)
- Strengths: Research-backed, trusted by educators
- Weaknesses: Simple graphics, limited interactivity
- **Lesson:** We can partner (not compete) by providing engaging gameplay they lack

**Gizmos (ExploreLearning):**
- Pricing: $150-300/year per teacher
- Strengths: Curriculum-aligned, assessment tools
- Weaknesses: Expensive, limited student access
- **Lesson:** We undercut on price ($99/year unlimited students) and offer free tier

---

## Pricing Justification

### Why $4.99/month for Pro?

**Competitive Benchmarking:**
- Notion: $10/month
- Figma: $12/month
- Todoist: $5/month
- **Gaming SaaS:** Typically $5-10/month for premium features

**Value Proposition:**
- Cloud sync alone worth $3-5/month (saves time, prevents data loss)
- Advanced analytics for content creators worth $5-10/month
- Early access to features worth $2-3/month
- **Total Perceived Value:** $10-18/month

**Psychological Pricing:**
- $4.99 feels "cheap enough to impulse buy"
- $9.99 requires more consideration
- $2.99 feels "too cheap" (signals low quality)

**Conversion Optimization:**
- $4.99 × 2% conversion = $100/month from 1,000 users
- $9.99 × 1% conversion = $100/month from 1,000 users (same revenue, fewer customers)
- **Conclusion:** $4.99 optimizes for volume and customer satisfaction

### Why $99/year for Educational?

**Competitive Benchmarking:**
- PhET: Free (grant-funded, not sustainable for indie dev)
- Gizmos: $150-300/year (expensive, limits adoption)
- Khan Academy: Free (massive funding, not comparable)

**Value Proposition:**
- Unlimited students at $99/year = $0.10/student for 1,000-student school
- Curriculum materials save teachers 10+ hours of prep time (worth $200-500)
- Student analytics improve learning outcomes (priceless)
- **ROI:** $99 is a "no-brainer" for school budgets ($100-1,000 typical budget per tool)

**Strategic Pricing:**
- Low enough to approve without district approval ($100-500 teacher discretionary budget)
- High enough to signal quality (not "cheap free tool")
- Room to upsell ($199/year for premium tier in future)

---

## Revenue Optimization Strategies

### 1. Upsell Paths

**Free → Pro:**
- Trigger: After 10 hours of play, show "You're an evolution expert! Upgrade to Pro?"
- Hook: "Your creatures deserve cloud backup!"
- Discount: First month free with annual plan ($49 instead of $60)

**Pro → Educational:**
- Trigger: Pro user creates custom scenarios 3+ times
- Hook: "Are you a teacher? Educational tier includes student tracking!"
- Discount: 20% off first year for Pro subscribers switching to Educational

**Educational → Consulting:**
- Trigger: School uses EvoLab for 6+ months
- Hook: "Want a custom mod for your science museum exhibit?"
- Offer: Free consultation call (sales opportunity)

### 2. Referral Programs

**Pro User Referrals:**
- Give 1 month free for each friend who subscribes to Pro
- Friend gets 1 month free too (win-win)
- Goal: Viral growth, reduce CAC

**Teacher Referrals:**
- Give $25 Amazon gift card for each school referral
- Goal: Word-of-mouth growth in education sector

### 3. Seasonal Promotions

**Back to School (August-September):**
- Educational tier: 25% off ($74/year instead of $99)
- Pro tier: 2 months free with annual plan

**Black Friday / Cyber Monday:**
- Pro annual plan: 50% off ($25 instead of $49)
- Goal: Lock in subscribers for full year

**Darwin's Birthday (February 12):**
- Limited-time "Darwin Pack" with exclusive creatures + Pro trial
- Generates PR buzz, social media engagement

### 4. Freemium Feature Mix

**Always Free (Drive Adoption):**
- Full cell stage + creature stage gameplay
- Local saves (IndexedDB)
- Basic export (JSON/CSV)
- Community creature sharing (manual import)
- Basic analytics (last 7 days)

**Pro Only (Drive Revenue):**
- Cloud saves (automatic sync)
- Advanced analytics (all-time history, heatmaps)
- Creature gallery (browse + one-click import)
- Early access features (2-4 weeks early)
- Higher entity limits (500 vs 200)
- Custom challenges (create scenarios)

**Educational Only:**
- Classroom management
- Student analytics
- Curriculum materials
- Certification system
- Offline mode

**Strategy:** Free tier is "complete game" (no artificial limits), Pro tier is "convenience + power", Educational tier is "classroom tools"

---

## Risks & Mitigation

### Risk 1: Low Conversion Rate (<1%)

**Scenario:** 10,000 users but only 50 Pro subscribers (0.5% conversion)

**Impact:** $250/month revenue instead of $500/month target

**Mitigation:**
- A/B test upgrade prompts (timing, wording, visuals)
- Add more Pro-only features (priority feature requests)
- Offer annual discount to increase LTV (lifetime value)
- Survey users: "Why haven't you upgraded?" to find friction points

### Risk 2: Educational Tier Doesn't Sell

**Scenario:** Teachers love free version but won't pay $99/year

**Impact:** $0-1K revenue instead of $3K-5K target

**Mitigation:**
- Offer free pilot to 20 schools, collect testimonials
- Reduce price to $49/year if no traction by Month 6
- Partner with Teachers Pay Teachers or other platforms
- Apply for education grants to subsidize educational licenses

### Risk 3: Competing Free Alternatives

**Scenario:** A well-funded competitor launches a superior free version

**Impact:** User exodus, revenue decline

**Mitigation:**
- Focus on unique strengths (education, data viz, open source)
- Build strong community (contributors = moat)
- Continuously innovate (fast-follow competitor features)
- Niche down: "Best evolution simulator for educators" (defensible position)

### Risk 4: Hosting Costs Explode

**Scenario:** 100,000 users overwhelm free tier hosting

**Impact:** $2,000-5,000/month hosting costs

**Mitigation:**
- Use CDN + static hosting (Vercel, Cloudflare) for low cost
- Implement usage limits for free tier (e.g., 100 cloud saves max)
- Pro tier subsidizes free tier (Pro users cover hosting costs)
- If costs grow, increase Pro price to $6.99/month

### Risk 5: Payment Fraud / Chargebacks

**Scenario:** 10% of Pro subscriptions are fraudulent

**Impact:** $300-500/year in lost revenue + Stripe fees

**Mitigation:**
- Use Stripe Radar (built-in fraud detection)
- Require email verification before Pro access
- Monitor for suspicious patterns (VPN usage, rapid signups)
- Refund policy: 30-day money-back guarantee (builds trust)

---

## Long-Term Vision (Years 3-5)

### Enterprise Tier (Museums, Corporate Training)

**Pricing:** $1,000-5,000/year

**Target Customers:**
- Science museums (interactive exhibits)
- Corporate training programs (team-building, problem-solving workshops)
- Research institutions (genetic algorithm R&D)

**Features:**
- White-label branding (remove EvoLab logo, add museum branding)
- Custom mods (e.g., dinosaur evolution for natural history museum)
- API access (integrate with museum exhibits)
- Dedicated support (SLA guarantees)

**Projected Revenue:** $10K-50K/year by Year 4

### Certification Program

**Pricing:** $29-49 per certificate

**Target Audience:**
- Students completing evolution curriculum
- Educators completing professional development

**Features:**
- Digital badge (blockchain-verified, LinkedIn-shareable)
- Leaderboard ranking (top 100 evolution strategists)
- Resume credential ("Certified in Evolutionary Biology Simulation")

**Projected Revenue:** $5K-15K/year by Year 4

### Marketplace (User-Generated Content)

**Model:** Revenue share (70% creator, 30% platform)

**Target Creators:**
- Mod developers (custom creatures, scenarios, biomes)
- Curriculum designers (lesson plans, worksheets)

**Features:**
- In-game marketplace (browse + purchase mods)
- Creator dashboard (analytics, earnings)

**Projected Revenue:** $10K-30K/year by Year 5 (dependent on creator ecosystem)

---

## Summary & Recommendations

### Recommended Strategy

**Phase 1 (Year 1):** Focus on **organic growth** via free tier + GitHub Sponsors. Launch Pro tier in Month 6 after 1,000+ active users. Target 50-100 Pro subscribers by EOY.

**Phase 2 (Year 2):** Launch **Educational tier** and apply for first grant. Target 30-50 schools + 200-500 Pro subscribers.

**Phase 3 (Year 3+):** Expand into **Enterprise tier**, **certification**, and **workshops**. Build sustainable business with $75K-150K annual revenue.

### Key Success Metrics

**Year 1:**
- [ ] 1,000+ monthly active users (MAU)
- [ ] 50-100 Pro subscribers
- [ ] 10-20 educational licenses
- [ ] $5K-15K revenue
- [ ] Break even (costs covered)

**Year 2:**
- [ ] 10,000+ MAU
- [ ] 200-500 Pro subscribers
- [ ] 30-50 educational licenses
- [ ] $25K-50K revenue
- [ ] First grant ($25K-50K)

**Year 3+:**
- [ ] 50,000+ MAU
- [ ] 1,000+ Pro subscribers
- [ ] 100+ educational licenses
- [ ] $75K-150K revenue
- [ ] Sustainable full-time income (optional)

### Action Items (Week 1)

- [ ] Set up Stripe account (payment processing)
- [ ] Configure Supabase for cloud saves (optional, can defer)
- [ ] Create GitHub Sponsors profile + README banner
- [ ] Design Pro feature comparison table for landing page
- [ ] Draft Educational tier sales page (ready for Year 1 launch)

---

**Last Updated:** November 15, 2025  
**Next Review:** After MVP launch (Month 4)
