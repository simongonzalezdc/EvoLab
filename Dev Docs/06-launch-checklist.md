# EvoLab - Launch Checklist

**Version:** 1.0  
**Last Updated:** November 15, 2025  
**Target Launch Date:** Week 16 (Early March 2026)  
**Type:** Open Source Game Launch

---

## Launch Strategy Overview

**Goal:** Achieve 100+ GitHub stars and 500+ game sessions on Launch Day via coordinated marketing push across Reddit, Hacker News, YouTube, and educator communities.

**Timeline:**
- **Weeks 1-14:** Development (heads-down building)
- **Week 15:** Pre-launch preparation (this checklist)
- **Week 16:** Launch week (public release + marketing)
- **Weeks 17-20:** Post-launch engagement (community building)

**Target Audience (Priority Order):**
1. **Evolution enthusiasts** (Reddit: r/proceduralgeneration, r/gamedev, r/evolution)
2. **Educators** (Twitter, r/ScienceTeachers, biology teacher groups)
3. **Tech community** (Hacker News, Twitter tech)
4. **Game developers** (IndieDB, itch.io, game dev Discord servers)

---

## Pre-Launch Checklist (Week 15)

### 1. Product Readiness

**Technical Polish:**
- [ ] All P0 features complete and tested
- [ ] Performance targets met (60 FPS at 200 entities)
- [ ] No critical bugs (crash bugs, data loss, game-breaking issues)
- [ ] Save/load system working reliably
- [ ] Export/import creatures tested on 10+ different files
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile-friendly UI (responsive design, touch controls work)
- [ ] Accessibility check (keyboard navigation, ARIA labels)

**Tutorial & Onboarding:**
- [ ] 5-minute tutorial complete (WASD movement → collect resources → reproduce → evolve)
- [ ] Tooltips for all UI elements
- [ ] "Getting Started" guide in-game
- [ ] Sample creatures included (3-5 pre-designed species)
- [ ] First-time user experience polished (no confusion)

**Data & Export:**
- [ ] Population graph showing last 100 generations
- [ ] Evolution tree rendering correctly
- [ ] Trait radar chart displaying top 10 traits
- [ ] CSV export with all evolution history
- [ ] JSON export/import working for creatures

**Performance Optimization:**
- [ ] Spatial hashing implemented (collision detection)
- [ ] Entity pooling (reduce garbage collection)
- [ ] Web Worker for genetic algorithm (doesn't block UI)
- [ ] Adaptive quality scaling at 100x/1000x speed
- [ ] Bundle size < 1 MB (tree-shaking, code splitting)

---

### 2. Documentation & Assets

**GitHub Repository:**
- [ ] README.md with hero image, demo GIF, quick start guide
- [ ] CONTRIBUTING.md with code style, PR process
- [ ] CODE_OF_CONDUCT.md (Contributor Covenant)
- [ ] LICENSE.txt (MIT)
- [ ] CHANGELOG.md (version history)
- [ ] ASSETS.md (attribution for all assets)
- [ ] Issue templates (bug report, feature request)
- [ ] Pull request template
- [ ] GitHub Actions for CI/CD (lint, test, build)

**Website Landing Page:**
- [ ] Domain registered (evolab.io or .com)
- [ ] Hero section: "Play Evolution in Your Browser" + screenshot
- [ ] Features section (40+ traits, fast-forward time, data viz)
- [ ] Live demo link (prominently displayed)
- [ ] Call-to-action: "Play Now (Free)" + "Star on GitHub"
- [ ] Educator section: "Perfect for biology classrooms"
- [ ] Tech stack showcase (TypeScript, PixiJS, open source)
- [ ] Footer: GitHub, Twitter, Discord links

**Marketing Assets:**
- [ ] Demo video (2-3 minutes): Gameplay walkthrough showing evolution in action
- [ ] Screenshots (10+ high-quality): Cell stage, creature stage, charts, trait editor
- [ ] GIF/MP4 loops (3-5 short clips): "Watch evolution happen in real-time"
- [ ] Logo (SVG + PNG): EvoLab branding
- [ ] Social media banner (Twitter header, Discord banner)
- [ ] Press kit (PDF): Product overview, screenshots, contact info

**Demo Content:**
- [ ] 5-7 pre-designed creatures (herbivore, carnivore, omnivore, specialist)
- [ ] 3 evolution scenarios (survive harsh winter, outlast predators, fastest evolution)
- [ ] Time-lapse video: 1,000 generations in 60 seconds
- [ ] "Best of" creature gallery: Community-created creatures (if beta tested)

---

### 3. Marketing Copy

**GitHub README (First Impression):**

```markdown
# 🧬 EvoLab - Open Source Evolution Simulator

**Play evolution in your browser.** Design species, watch them evolve through natural selection, and explore the science of life with detailed data visualizations.

[▶️ Play Now](https://evolab.io) | [📖 Docs](https://github.com/your-username/evolab/wiki) | [💬 Discord](https://discord.gg/evolab)

![EvoLab Gameplay](docs/images/hero.gif)

## Features
- 🧬 **40+ Genetic Traits** - Speed, armor, metabolism, intelligence, senses, and more
- ⚡ **Fast-Forward Time** - Watch 100+ generations evolve in minutes (1x, 10x, 100x, 1000x speed)
- 📊 **Data Visualization** - Population graphs, evolution trees, trait radar charts
- 🏞️ **Procedural Biomes** - Explore lakes with 5-7 distinct zones (shallow warm, deep cold, toxic)
- 🤖 **AI Competition** - Compete against 0-5 AI species evolving alongside you
- 🎓 **Built for Education** - Perfect for biology classrooms (ages 12+)

## Quick Start
\`\`\`bash
pnpm install
pnpm dev
\`\`\`

Open http://localhost:5173 and start evolving!

## Inspiration
Spore meets Thrive meets educational biology. Open source, browser-based, and scientifically accurate.

## Tech Stack
TypeScript • PixiJS (WebGL) • D3.js • Matter.js • Zustand • IndexedDB

## License
MIT - Free for educational and commercial use.
```

**Show HN Post (Hacker News):**

```
Show HN: EvoLab – Open source evolution simulator with 1000x fast-forward

Hi HN! I built EvoLab, a browser-based evolution simulator where you design species and watch them evolve through natural selection. Think Spore meets Thrive, but open source and optimized for educators.

Key features:
• 40+ genetic traits (speed, armor, metabolism, intelligence, senses)
• Fast-forward time up to 1000x speed (watch 100+ generations in minutes)
• Real-time data viz (population graphs, evolution trees, trait radar charts)
• Procedurally generated biomes (lakes with 5-7 distinct zones)
• AI competition (0-5 AI species evolving alongside you)

Built with TypeScript, PixiJS (WebGL), D3.js, and Matter.js. Runs entirely in the browser (no install, no backend).

I'm a solo developer passionate about making evolutionary biology accessible and fun. This project is MIT-licensed and built for classrooms, hobbyists, and anyone curious about natural selection.

Live demo: https://evolab.io
GitHub: https://github.com/your-username/evolab

Would love feedback on performance, UX, or which features to prioritize next!
```

**Reddit Post (r/proceduralgeneration, r/gamedev):**

```
🧬 I built an open source evolution simulator with procedural biomes and genetic algorithms [TypeScript + PixiJS]

After 4 months of work, I'm excited to share EvoLab – a browser-based evolution simulator where you design species and watch them evolve through natural selection.

Features:
• 40+ genetic traits affecting survival (speed, armor, metabolism, intelligence)
• Fast-forward time (1x to 1000x speed) to see 100+ generations in minutes
• Procedurally generated lake biomes (Perlin noise for depth/temp/nutrients)
• Genetic algorithm with mutations, inheritance, and natural selection
• Real-time data viz with D3.js (population graphs, evolution trees)
• Competing AI species (herbivores, carnivores, omnivores)

Tech stack:
• TypeScript 5.7 + Vite (type-safe, fast HMR)
• PixiJS v8 (WebGL rendering, 60 FPS with 200+ entities)
• Matter.js (2D physics)
• D3.js (data visualization)

This is 100% open source (MIT license), built for educators and evolution enthusiasts. No install needed – runs in your browser.

👉 Play now: https://evolab.io
👉 GitHub: https://github.com/your-username/evolab

Would love your feedback! What features would make this more useful for classrooms or game dev learning?

[Attach 2-3 screenshots or GIFs showing gameplay]
```

**Twitter/X Launch Thread:**

```
🧬 Launching EvoLab today – an open source evolution simulator built with TypeScript + PixiJS!

Design species, watch them evolve through natural selection, and explore the science of life with detailed data visualizations.

🎮 Play: https://evolab.io
💻 GitHub: https://github.com/your-username/evolab

🧵 Thread 👇

1/ Key features:
• 40+ genetic traits (speed, armor, metabolism, intelligence, senses)
• Fast-forward time up to 1000x speed (watch 100+ generations in minutes)
• Real-time data viz (population graphs, evolution trees, trait radar charts)
• Procedural biomes (lakes with 5-7 distinct zones)

2/ Why I built this:
Spore was amazing but proprietary. Thrive is great but steep learning curve. I wanted to create something that's:
✅ Browser-based (no install)
✅ Open source (MIT license)
✅ Educator-friendly (perfect for biology classrooms)

3/ Tech stack:
• TypeScript 5.7 (type-safe, modern)
• PixiJS v8 (WebGL, 60 FPS with 200+ entities)
• D3.js (data visualization)
• Matter.js (2D physics)
• Zustand (state management)

4/ What makes it unique:
⚡ Fast-forward time (1000x speed!) to see evolution happen in minutes
📊 Detailed data exports (CSV/JSON) for science projects
🎓 Built for classrooms (ages 12+, NGSS-aligned)

5/ This is a passion project, built over 4 months as a solo developer. It's 100% free and open source.

If you're a teacher, student, or evolution enthusiast, I'd love your feedback!

🎮 Play: https://evolab.io
💻 GitHub: https://github.com/your-username/evolab
💬 Discord: https://discord.gg/evolab

❤️ Star on GitHub if you enjoy it!
```

---

### 4. Community Setup

**Discord Server:**
- [ ] Create Discord server (invite link in README)
- [ ] Channels: #announcements, #general, #dev-discussion, #feature-requests, #bug-reports, #showcase
- [ ] Roles: Creator, Contributor, Educator, Player
- [ ] Welcome message with rules + quick start guide
- [ ] Pinned message: "Share your creatures in #showcase!"

**GitHub Discussions:**
- [ ] Enable Discussions in GitHub repo
- [ ] Categories: Announcements, Q&A, Ideas, Show and Tell
- [ ] Pin welcome post: "Welcome to EvoLab! Introduce yourself"
- [ ] Pin roadmap post: "What features do you want next?"

**Social Media:**
- [ ] Twitter account (@EvoLabGame or similar)
- [ ] YouTube channel (for dev logs, tutorials, time-lapses)
- [ ] Reddit account (u/evolab or similar)
- [ ] Bluesky account (optional, growing platform)

**Mailing List:**
- [ ] Mailchimp or ConvertKit for email updates (optional)
- [ ] Signup form on website
- [ ] Welcome email with quick start guide

---

### 5. Analytics & Monitoring

**Analytics Setup:**
- [ ] Umami or Plausible (privacy-friendly analytics)
- [ ] Track: Page views, game sessions, time played, export usage
- [ ] Dashboard: Daily active users (DAU), weekly active users (WAU), monthly active users (MAU)

**Error Tracking:**
- [ ] Sentry (free tier for open source)
- [ ] Monitor: JavaScript errors, crash reports, performance issues
- [ ] Alerts: Email notification for critical errors

**Performance Monitoring:**
- [ ] Web Vitals tracking (LCP, FID, CLS)
- [ ] PixiJS FPS counter (in-game, dev mode only)
- [ ] Bundle size monitoring (track over time)

**User Feedback:**
- [ ] In-game feedback button ("Report Bug" or "Request Feature")
- [ ] Google Form or Typeform for structured feedback
- [ ] Post-play survey: "How was your experience? (1-5 stars)"

---

## Launch Day Checklist (Week 16)

### Morning (6-9 AM PST)

**Pre-Launch Final Checks:**
- [ ] Test live site on 3+ browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Verify all links work (GitHub, Discord, Twitter)
- [ ] Verify analytics tracking (Umami, Sentry)
- [ ] Verify error monitoring (no errors in console)

**Deploy:**
- [ ] Merge final PR to `main` branch
- [ ] Tag release v1.0.0 in GitHub
- [ ] Push to production (Vercel/Netlify auto-deploy)
- [ ] Verify deployment at evolab.io
- [ ] Test game session (5-minute playthrough)

---

### Launch Hour (9-10 AM PST)

**1. Hacker News (Highest Priority):**
- [ ] Post "Show HN: EvoLab" to Hacker News
- [ ] Respond to comments within 30 minutes
- [ ] Be humble, open to feedback, engage authentically

**2. Reddit (High Priority):**
- [ ] Post to r/proceduralgeneration (procedural generation community)
- [ ] Post to r/gamedev (game development community)
- [ ] Post to r/evolution (evolution enthusiasts)
- [ ] Post to r/InternetIsBeautiful (cool web projects)
- [ ] Cross-post to r/WebGames (browser games)

**3. Twitter/X (Medium Priority):**
- [ ] Post launch thread (7-10 tweets)
- [ ] Tag relevant accounts (@ThriveDev, @PixiJS, @vite_js)
- [ ] Reply to mentions and questions

**4. Discord & GitHub (Low Priority):**
- [ ] Post announcement in Discord #announcements
- [ ] Post in GitHub Discussions "Announcements"
- [ ] Update README badge: "Status: Launched! 🚀"

---

### Day 1 (10 AM - 11 PM PST)

**Engagement:**
- [ ] Respond to all Hacker News comments (within 1 hour)
- [ ] Respond to all Reddit comments (within 2 hours)
- [ ] Respond to all Twitter mentions (within 2 hours)
- [ ] Monitor Discord for questions (reply within 1 hour)
- [ ] Thank everyone for feedback and stars

**Bug Triage:**
- [ ] Create GitHub issues for all reported bugs
- [ ] Label issues: P0 (critical), P1 (high), P2 (medium), P3 (low)
- [ ] Fix P0 bugs immediately (hotfix deployment)
- [ ] Acknowledge P1 bugs with ETA (fix within 24-48 hours)

**Metrics Monitoring:**
- [ ] Track GitHub stars (goal: 100+ by EOD)
- [ ] Track game sessions (goal: 500+ by EOD)
- [ ] Track upvotes on Hacker News (goal: 50+ by EOD)
- [ ] Track Reddit upvotes (goal: 100+ combined by EOD)

**Content Creation:**
- [ ] Screenshot top comments and share on Twitter
- [ ] Record gameplay video of player-created creatures
- [ ] Post "Thank you" update at end of day

---

### Week 1 (Days 2-7)

**Daily Tasks:**
- [ ] Respond to all comments, questions, feedback (1-2 hours/day)
- [ ] Monitor analytics (DAU, WAU, error rate)
- [ ] Fix P1 bugs (deploy hotfixes as needed)
- [ ] Post daily update on Twitter (showcasing community creations)

**Community Building:**
- [ ] Feature community-created creatures in Discord #showcase
- [ ] Create "Creature of the Week" showcase (highlight best designs)
- [ ] Invite top contributors to Discord as moderators
- [ ] Respond to feature requests (add to roadmap)

**Outreach:**
- [ ] Email 10-20 biology teachers (personalized pitches)
- [ ] Reach out to 5-10 YouTubers (game dev, biology, science education channels)
- [ ] Submit to IndieDB, itch.io, Product Hunt (Day 3-4)
- [ ] Submit to web game directories (Kongregate, Armor Games, etc.)

**Content Marketing:**
- [ ] Publish blog post: "Building EvoLab: Lessons Learned" (on dev.to, Medium)
- [ ] Publish dev log video: "How I Built an Evolution Simulator" (YouTube)
- [ ] Cross-post to r/gamedevscreens (behind-the-scenes content)

**Metrics Target (End of Week 1):**
- [ ] 250+ GitHub stars
- [ ] 2,000+ game sessions
- [ ] 10+ bug reports triaged
- [ ] 5+ feature requests added to roadmap

---

### Month 1 (Weeks 2-4)

**Weekly Tasks:**
- [ ] Post dev log (Twitter thread + blog post)
- [ ] Fix 3-5 high-priority bugs
- [ ] Implement 1-2 community-requested features
- [ ] Feature 3-5 community creatures in showcase

**Community Growth:**
- [ ] Host weekly evolution challenge (e.g., "Design the fastest herbivore")
- [ ] Create leaderboard for longest lineage, highest fitness, fastest evolution
- [ ] Interview 2-3 top community members (Twitter Spaces or Discord AMA)

**Educator Outreach:**
- [ ] Email 50+ biology teachers (via Teachers Pay Teachers, Twitter)
- [ ] Offer free pilot program to 10-20 schools (90-day trial)
- [ ] Create lesson plan PDF (downloadable from website)
- [ ] Post in r/ScienceTeachers (ask for feedback)

**Partnerships:**
- [ ] Reach out to PhET Simulations, Khan Academy (potential collaboration)
- [ ] Reach out to biology YouTubers (CrashCourse, Kurzgesagt, Amoeba Sisters)
- [ ] Submit to Mozilla Festival, FOSDEM, or other open source events (speaker proposal)

**Metrics Target (End of Month 1):**
- [ ] 500+ GitHub stars
- [ ] 10,000+ game sessions
- [ ] 20+ community-shared creatures
- [ ] 3+ blog posts or YouTube videos about EvoLab
- [ ] 5+ classroom pilot signups

---

## Launch Channels (Detailed)

### 1. Hacker News

**Timing:** 9 AM PST (best time for front page)

**Title:** "Show HN: EvoLab – Open source evolution simulator with 1000x fast-forward"

**Strategy:**
- Be humble and open to feedback
- Respond to ALL comments within 30 minutes
- Engage authentically (no marketing speak)
- Highlight unique technical challenges (genetic algorithm, WebGL performance)

**Expected Outcome:** 50-100 upvotes, front page for 4-8 hours, 500-1,000 visits

---

### 2. Reddit

**Subreddits (Priority Order):**
1. **r/proceduralgeneration** (63K members) - Procedural generation enthusiasts
2. **r/gamedev** (1.2M members) - Game developers
3. **r/evolution** (100K members) - Evolution enthusiasts
4. **r/InternetIsBeautiful** (17M members) - Cool web projects
5. **r/WebGames** (820K members) - Browser games
6. **r/ScienceTeachers** (97K members) - Educators (follow-up post)

**Timing:** Stagger posts (1-2 hours apart to avoid spam filters)

**Strategy:**
- Follow subreddit rules (some require mod approval)
- Include screenshots or GIFs
- Be descriptive and technical (Reddit appreciates depth)
- Engage in comments, answer questions

**Expected Outcome:** 100-500 upvotes combined, 1,000-3,000 visits

---

### 3. Twitter/X

**Strategy:**
- Post launch thread (7-10 tweets with screenshots/GIFs)
- Tag relevant accounts (@ThriveDev, @PixiJS, @TypeScript, @vite_js)
- Use hashtags: #gamedev, #TypeScript, #OpenSource, #evolution, #proceduralgeneration
- Engage with replies (reply to every mention)

**Follow-up Posts:**
- Daily updates: "Day 2: Added 3 new features based on community feedback!"
- Weekly dev logs: "Week 1 recap: 250 stars, 2K sessions, 10 bug fixes"
- Creature showcases: "Check out this amazing carnivore designed by @username"

**Expected Outcome:** 10-50 retweets, 100-500 visits

---

### 4. Product Hunt (Optional, Day 3-4)

**Timing:** 12:01 AM PST (to maximize votes throughout the day)

**Title:** "EvoLab – Open source evolution simulator with real-time genetic algorithms"

**Tagline:** "Design species, watch them evolve through natural selection, and explore the science of life with detailed data visualizations."

**Strategy:**
- Prepare 5-7 high-quality screenshots
- Prepare 60-second demo video
- Engage with hunters (respond to comments)
- Share on Twitter: "We're live on Product Hunt!"

**Expected Outcome:** Top 10 product of the day, 500-2,000 visits

---

### 5. YouTube

**Launch Video Ideas:**
- "I Built an Open Source Evolution Simulator (4-Month Dev Log)"
- "Watch 1,000 Generations of Evolution in 60 Seconds"
- "How I Optimized a Web Game to 60 FPS with 200+ Entities"

**Target Channels (Outreach):**
- Sebastian Lague (procedural generation)
- Code Bullet (AI/simulation)
- Kurzgesagt (science education)
- CrashCourse Biology (educators)
- The Coding Train (creative coding)

**Expected Outcome:** 1-2 YouTubers cover EvoLab within 1-3 months

---

### 6. Educator Communities

**Platforms:**
- Teachers Pay Teachers (post free lesson plan)
- Biology Teachers Facebook groups
- r/ScienceTeachers subreddit
- Twitter (use #bioedchat, #stemchat hashtags)

**Strategy:**
- Offer free pilot program (90-day trial)
- Create downloadable lesson plan PDF
- Emphasize NGSS alignment (Next Generation Science Standards)
- Collect testimonials from pilot teachers

**Expected Outcome:** 5-10 classroom pilots, 1-2 testimonials

---

## Post-Launch Success Metrics

### Launch Day (Day 1)

**Must-Hit Targets:**
- [ ] 100+ GitHub stars
- [ ] 500+ game sessions
- [ ] 50+ upvotes on Hacker News
- [ ] No critical bugs reported

**Stretch Goals:**
- [ ] Front page of Hacker News for 4+ hours
- [ ] Featured on r/proceduralgeneration or r/gamedev top post
- [ ] 1,000+ game sessions

---

### Week 1 Post-Launch

**Must-Hit Targets:**
- [ ] 250+ GitHub stars
- [ ] 2,000+ game sessions
- [ ] 10+ bug reports triaged and prioritized
- [ ] 5+ feature requests from community

**Stretch Goals:**
- [ ] 500+ GitHub stars
- [ ] 5,000+ game sessions
- [ ] 1+ blog post or YouTube video about EvoLab

---

### Month 1 Post-Launch

**Must-Hit Targets:**
- [ ] 500+ GitHub stars
- [ ] 10,000+ game sessions
- [ ] 20+ community-shared creatures
- [ ] 3+ blog posts or YouTube videos about EvoLab

**Stretch Goals:**
- [ ] 1,000+ GitHub stars
- [ ] 25,000+ game sessions
- [ ] 5+ classroom pilot signups
- [ ] First paying customer (Pro tier, if launched)

---

## Crisis Management

### Scenario 1: Critical Bug Found on Launch Day

**Symptoms:** Game crashes for 10%+ of users, data loss, or major gameplay blocker

**Response:**
1. Post immediate update: "We're aware of the bug and working on a fix. ETA: 2 hours."
2. Roll back deployment to previous stable version (if needed)
3. Fix bug in isolated branch, test thoroughly
4. Deploy hotfix within 2 hours
5. Post update: "Bug fixed! Please refresh your browser."

**Communication Channels:** Twitter, Discord #announcements, GitHub issue

---

### Scenario 2: No Traction (< 50 Stars by Day 3)

**Symptoms:** Low engagement, few comments, Hacker News post not gaining traction

**Response:**
1. Re-post to additional subreddits (r/webdev, r/opensource, r/programming)
2. Reach out to 10-20 influencers directly (email, Twitter DM)
3. Post on Product Hunt (Day 3-4)
4. Create compelling demo video + repost on Twitter
5. Review marketing copy (is messaging clear? screenshots compelling?)

---

### Scenario 3: Negative Feedback on Core Mechanic

**Symptoms:** Users complain "evolution is too slow" or "genetic algorithm feels random"

**Response:**
1. Acknowledge feedback: "Great point, we're looking into this."
2. Collect data: How many users experiencing this? What's the specific complaint?
3. A/B test solution: Tweak genetic algorithm parameters (mutation rate, selection pressure)
4. Deploy fix within 1-2 weeks
5. Post update: "Based on your feedback, we've improved evolution speed by 30%."

**Avoid:** Defensive responses ("that's how real evolution works"). Be user-focused.

---

### Scenario 4: Server Costs Spike (Traffic Surge)

**Symptoms:** Hosting bills jump from $20/month to $500/month

**Response:**
1. Check if CDN/caching is working properly
2. Upgrade Vercel plan temporarily (if needed)
3. Implement usage limits for free tier (e.g., 100 cloud saves max)
4. Post update: "Due to high traffic, we're upgrading servers. Pro tier coming soon to cover costs."
5. Launch Pro tier 2-4 weeks early (to offset costs)

---

## Final Pre-Launch Review (Day Before)

**24 Hours Before Launch:**
- [ ] Run full QA test (30-minute playthrough)
- [ ] Review all marketing copy (typos, broken links)
- [ ] Test deployment pipeline (staging → production)
- [ ] Notify Discord community: "Launching tomorrow at 9 AM PST!"
- [ ] Schedule Twitter thread (use Buffer or TweetDeck)
- [ ] Prepare Hacker News post (draft in notepad)
- [ ] Set up launch day calendar (block 8-12 hours for engagement)

**The Night Before:**
- [ ] Get good sleep (you'll need energy for launch day!)
- [ ] Disable notifications on personal phone (avoid distractions)
- [ ] Set up coffee/snacks for launch day workspace
- [ ] Remind yourself: "This is just the beginning. Stay calm, have fun!"

---

## Launch Day Mindset

**Remember:**
- Not everyone will love your project (and that's okay)
- Negative feedback is a gift (use it to improve)
- Celebrate small wins (first 10 stars, first positive comment)
- Engage authentically (be yourself, not a marketing robot)
- Have fun! You built something amazing.

**Emergency Contacts:**
- Hosting support: Vercel, Netlify
- Payment support: Stripe
- Error monitoring: Sentry

**Post-Launch Reflection (End of Week 1):**
- What went well?
- What would you do differently?
- What surprised you?
- What did you learn?

---

**Last Updated:** November 15, 2025  
**Next Review:** Week 15 (1 week before launch)

Good luck! 🚀🧬
