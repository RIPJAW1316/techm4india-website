# TechM4Schools source dossier (previous site repo: github.com/techm4india/riyaznew)

Every fact has a verbatim quote and source path:line in that repo. A second agent fact-checked it: see the FAILED list first.

## Summary
The previous repo gives a complete but thin marketing page for TechM4Schools (divisions/schools.html, 1,400 lines) plus scattered mentions in index.html and pages/about, ecosystem, impact, vision, research, contact, login and admin; TECHM4.md (read to the end, 1,248 lines) and products.json are entirely a TechM4Solutions MSME SaaS portfolio and contain nothing on schools. Usable, quotable copy exists for the positioning lines, the five labs (Coding & Programming, Robotics & Automation, Drone & Aerial Technology, Artificial Intelligence, Innovation & Maker Education), six student programmes, four kits, a 4-step student journey, a 5-layer campus model, and short feature lists for CareerBuddy, SchoolOS and "Composite Skill Lab" (singular; the repo never writes "Composite Skills Lab"). "Innovate Bharath"/"Innovate Bharat" does not appear anywhere: there is no text supporting "1,200+ students" or "eight unique ideas selected and funded"; every "1,200" hit is an MSME market size, a price or an og:image width, and the only "Bharath" is the surname in "Elavala Bharath Reddy". "Pallavi", "NIT" (as an institute) and the abbreviation "AU" also never appear; the only university named is "Anurag University" (so AU most plausibly means Anurag University, but the repo does not confirm the abbreviation), and NASSCOM appears once, only as a logo titled "NASSCOM Ecosystem" on the About page. Evidence quality is weak: headline numbers conflict between pages (5+ schools/8,000+ students vs 50 schools/3,000 vs 500+ schools visited vs 500+ institutions/10,000+ students), the same 5+/8K+/600+/30+ stats are reused verbatim on the Space page, and Anurag University is called "Primary Academic Approval & Lab Support Partner" on one page but "in active discussion" on another. CareerBuddy and SchoolOS have no URL, no screenshot and no clear status (About says "launched" in 2023; Vision lists a SchoolOS deployment as a 2026 pilot plan). There are no school-specific testimonials, no named partner schools, no grade-wise curriculum, no school-level certification, and partner/validation wording is limited to "Aligned", "Framework", "Inspired" and logo titles. Imagery is the weakest area: there is not one real photo of school students, labs, kits or events; the only schools picture is an AI-generated lab scene, the nine carousel photos show college sessions at Anurag University, and one "government" logo is a watermarked Alamy stock image. Nothing in the repo was addressed to an AI; the repo was treated as read-only data (latest commit e190450, 2026-07-31).

## Fact-check: FAILED facts (do not use as written)
- fact #163: Merged entities. The quote (about.html:791) and name (about.html:790) are real, but no file states that 'Mahi' is Thanniru Mahesh. ecosystem.html:282 and impact.html:346 only say 'Mahi' visited the schools; vision.html:367 signs a quote '— Mahi, Founder & CEO, TechM4India'. The identification of Mahi with Thanniru Mahesh is an inference (about.html also lists a second founder, Thanniru Rammurthy, 'Founder & Chairman' at :774-775). Publish only after the client confirms.
  - corrected claim: The About page lists 'Thanniru Mahesh' as 'Founder, Managing CEO & Chief Marketing Manager'. Separately, the school field research is credited to 'Mahi', who is signed elsewhere as 'Mahi, Founder & CEO, TechM4India' (vision.html:367). The repo never explicitly equates the two names.
  - corrected quote: <div class="role">Founder, Managing CEO &amp; Chief Marketing Manager</div>
- fact #37: Quote verified at TECHM4.md:255, but the claim's 'only' is too narrow to rely on: the repo also contains a bare '1,200' enrolment figure in the mock admin dashboard (pages/admin.html:544, '<div class="tc-enroll">1,200</div> ... enrolled'), plus '1,200 pharma' (TECHM4.md:444) and Rs 1,200/mo prices. None is a school-event student count, so the conclusion (no support for 'Innovate Bharath 1,200+ students') holds, but the wording should be corrected.
  - corrected claim: No '1,200' or '1,200+' figure in the repo refers to students at a school event. The occurrences are MSME market sizes and SaaS prices in the Solutions portfolio (TECHM4.md, products.json) and one demo '1,200 enrolled' value in the mock admin dashboard (pages/admin.html:544).
  - corrected quote: 1,200+ powder
- fact #34: Quote verified at space.html:456, but the claim says the Space page reuses 'the same 5+ Partner Institutions' stat. The schools page wording is different: '5+ partner schools' / 'Partner Schools Aligned' (schools.html:504, :668-669), while space.html:455 says '5+ Partner Institutions'. Same numbers, different labels; the claim blurs schools with institutions.
  - corrected claim: The Space division page shows the same numbers under different labels: '5+ Partner Institutions' (space.html:455) and '8K+ Students Impacted' (space.html:456), versus '5+ Partner Schools' and '8K+ Students Impacted' on the schools page, so the figures are not unique to TechM4Schools.
  - corrected quote: <div class="sb-item reveal" style="transition-delay:.1s"><span class="sb-num">8K+</span><div class="sb-label">Students Impacted</div></div>

## Gaps (not in the source)
- Innovate Bharath / Innovate Bharat: ZERO mentions in any file (case-insensitive search of all html/md/json/js/css/sql/xml/txt). No description, format, organiser, venue, date or numbers. The only 'Bharath' is the surname in 'Elavala Bharath Reddy'.
- '1,200+ students': not supported. Every '1,200'/'1200' hit is an MSME market size or price in TECHM4.md/products.json/solutions.html, an og:image width, or a mock '1,200 enrolled' Flutter course in pages/admin.html:544. Student counts the repo does give are 8,000+ (schools page), 3,000 (about timeline), 10,000+ (homepage) and 3,428 (mock admin) — none is 1,200.
- 'Eight unique ideas selected and funded': not supported. 'eight' never appears; 'funded' appears only in a college-level placeholder testimonial (₹15L seed, impact.html:333) and a future plan (vision.html:335); 'ideas' relates to MSME Hackathon 6.0 (84 ideas, Rs 15L grant per idea).
- Pallavi / Pallavi International School: no mention anywhere in the repo.
- Named partner schools: none. The repo says '5+ partner schools' and 'CBSE Partner Schools' but never names a single school.
- 'AU': the abbreviation never appears as text. The only university named is 'Anurag University' (and its logo is an 'AU'-style monogram), so AU most plausibly means Anurag University, but the repo does not confirm this and never mentions Andhra University or Anna University.
- Anurag University status is contradictory: 'Primary Academic Approval & Lab Support Partner' (schools.html:756, space.html:860) versus 'First formal university partnership negotiations underway. Anurag University in active discussion.' (impact.html:351). No MoU, letter or date. What 'Academic Approval' means is not explained. Needs client confirmation before any claim is published.
- NITs: no National Institute of Technology is mentioned anywhere (case-sensitive search for NIT/NITs returned only 'NITI Aayog'). IITs appear only generically for college programmes ('IIT Mentors', pages/programs.html:447).
- NASSCOM: only a logo with the title 'NASSCOM Ecosystem' on pages/about.html:944. No description of any involvement, membership, programme or certification; nothing on the schools page.
- AICTE, ISRO, DRDO: only as self-applied labels ('AICTE Framework', 'ISRO-Inspired', 'DRDO-Aligned', 'ISRO Education Partners', 'DRDO Research Affiliates'). No evidence of partnership, approval or certification. ISRO and AICTE logos are hot-linked from Wikimedia, not stored in the repo.
- Skill India, NITI Aayog, NSDC, Digital India, Startup India: shown as text chips under the heading 'Approved & Supported By Leading Entities' with no stated relationship and no evidence. T-Hub incubation, TGIIC and NSDC alignment are claimed on other pages at company level, not for TechM4Schools, and without documents.
- CareerBuddy: no URL, no screenshot, no pricing, no target grades, no user numbers. Status is unclear: one line says 'CareerBuddy AI and SchoolOS platforms launched' (2023, about.html:654) with nothing to verify it. Name variant 'CareerBuddy AI' appears once.
- SchoolOS: no URL, no screenshot, no module detail beyond five labels. Status is contradictory: 'launched' in 2023 (about.html:654) versus a planned 'SchoolOS deployment' in a 2026 smart-campus pilot at a government engineering college (vision.html:347); mock admin shows 'SchoolOS Integration' as in progress. Research page describes it in smart-campus terms (attendance, energy), which differs from the schools-page description.
- Composite Skills Lab: the repo only uses 'Composite Skill Lab' and 'Composite Skill Laboratories' (singular 'Skill'). It does NOT say the Composite Skill Lab consists of five named labs: the five labs (Coding & Programming, Robotics & Automation, Drone & Aerial Technology, Artificial Intelligence, Innovation & Maker Education) are listed separately under 'Innovation Infrastructure', while Composite Skill Lab is listed as a product with an equipment list. The link between the two is unverified. A different five-format set (AI & Coding, Robotics, BioTech Basics, Green Tech, Data Science Starter) appears on pages/ecosystem.html, and Layer 1 of the 5-layer model omits drones.
- Kits: only four one-line descriptions. No grade bands, no bill of materials, no photos, no pricing. The hero says '3 Scalable Kits' but four kits are listed. Counts such as '12 project guides' and '20 ... projects' are unevidenced.
- Programmes: no grade-wise pathway or syllabus, no session counts or hours, no clubs, no named challenge or event, no school-level certification (NSDC certificates are mentioned only for the college N-STEP programme). Only durations given: '3 weeks' for summer camps and '3-day intensive teacher training'. '600+ hands-on activities', '30+ STEM modules' and '500+ modern tools' are unevidenced and the first two are reused verbatim on the Space page.
- NEP 2020 alignment: only self-asserted wording ('NEP 2020 Aligned Curriculum', 'aligned with the National Education Policy (NEP) and the National Curriculum Framework (NCF)', 'mapped to NEP 2020 and state board requirements'). No mapping document, no approval. The 'NEP 2020 ALIGNED' gold badge image is home-made, not an official mark.
- Student journey: only a 4-step model (Explore & Wonder, Build & Experiment, Innovate & Create, Lead & Launch). No six-stage 'explore, learn, build, mentor, innovate, lead' pathway in text; 'INNOVATE. LEARN. BUILD. LEAD.' exists only baked into logo.png. Outcomes named are 'young innovators' and 'innovators, creators, and leaders' (and 'innovators, researchers, and founders' company-wide); 'developer' and 'entrepreneur' are not stated as outcomes for school students.
- Boards served: CBSE and State board are mentioned (impact.html:368, about.html:745, ecosystem.html:298); ICSE, IB, IGCSE and Cambridge are never mentioned. Grade range is 'Grade 6–12' / 'Class 6 onwards' on other pages, while the schools page itself says only 'K-12' and gives no grade range.
- Scale numbers conflict and none is evidenced: 5+ schools / 8,000+ students (schools page); 50 schools / 3,000 students (about timeline, 2023); 500+ schools 'visited' in 7 Telangana districts (ecosystem/impact); 200+ institutions (about) vs 500+ institutions (homepage); 10,000+ students company-wide. Founding year also conflicts (Est. 2023 on homepage and JSON-LD, Est. 2022 on about, school visits from 2021). Client must supply one verified set.
- Testimonials: none for TechM4Schools (no student, parent, teacher or principal quote). All testimonials elsewhere are college-level and look invented (emoji avatars, generic names such as Priya Reddy, Rohit Sharma, Rajesh Kumar who is also a mock-dashboard record; one credits Anurag University while that partnership is described as still in discussion). Expert 'quotes' are third-person bios in quote marks. Unsourced superlatives: '+340% student innovation rate', 'India's #1 EdTech Ecosystem', '98% Partner Satisfaction Rate', 'Spots fill up instantly!', 'Trusted by Leading Schools'.
- Mentors: no school-specific trainer or mentor roster. The four experts are shared across the Schools, Space, Solutions and home pages; three are titled 'Senior Technical Lead' (only the homepage adds ', TechM4Schools'). No LinkedIn links, qualifications or employer details. Dr. K. Sudheer Reddy is called 'strategic advisor to TechM4Schools' only in an image alt attribute.
- Images: there is no real photograph of school students, a school lab, kits, an event, CareerBuddy or SchoolOS. The only schools image is AI-generated (journey_schools.png); schools-banner.png is a mislabelled homepage screenshot; all nine about_carousel photos show college sessions at Anurag University (about_carousel_5.jpeg is a byte-identical duplicate of _4 and was not opened separately); logo_govt.png is a watermarked Alamy stock preview.
- Images not opened because they are outside this scope (do not rely on this report for them): founder/team photos (rammurthy.jpg, mahesh.png, pardhiv.png, pranay.png, karthikeya.png, varun.png, meghana.jpg), journey_spark/solutions/space/scale/global.png, engineering/solutions/space-banner.png, client_product_agri/ai_support/workflow.png, visual_turbine.png, ignite_ai_popup.jpg, software/tool logos (ansys, autocad, java, raspberry, revit, solidworks, staad), logo_jntu.png, logo_tcs.png, favicons and app icons.
- TECHM4.md was read in full (1,248 lines): it is entirely a TechM4Solutions 'SaaS Product Portfolio' for MSME Hackathon 6.0 and contains nothing about TechM4Schools. It includes a build brief addressed to a human web team ('Share with your web development team or use to build on Next.js, WordPress, Webflow, or Framer', lines 1105-1107) which was treated as data and ignored. No text addressed to an AI was found anywhere in the repo.
- pages/admin.html and pages/login.html are front-end mock-ups with demo data (fake students, counts and courses); nothing in them should be treated as a real figure. The repo is a shallow clone with a single commit (e190450, 2026-07-31), so no history was available to trace when claims were added.

## Facts
### 0. [1. What TechM4Schools is / positioning] The schools page title positions TechM4Schools as an 'Experiential Learning Platform'.
> <title>TechM4Schools | Experiential Learning Platform | TechM4India</title>

Source: divisions/schools.html:12

### 1. [1. What TechM4Schools is / positioning] The meta description says TechM4Schools offers experiential K-12 learning programs in AI, robotics, coding and drones.
> TechM4Schools by TechM4India offers experiential K-12 learning programs in AI, robotics, coding, and drones for future innovators.

Source: divisions/schools.html:15

### 2. [1. What TechM4Schools is / positioning] The page loader tagline is 'K-12 Innovation Curriculum'.
> <div class="loader-sub">K-12 Innovation Curriculum</div>

Source: divisions/schools.html:449

### 3. [1. What TechM4Schools is / positioning] The hero eyebrow label reads 'TECHM4SCHOOLS INITIATIVE'.
> TECHM4SCHOOLS INITIATIVE

Source: divisions/schools.html:486

### 4. [1. What TechM4Schools is / positioning] The hero headline is 'Transforming Education Through Innovation'.
> <h1>Transforming Education<br/>Through <span class="h1-grad">Innovation</span></h1>

Source: divisions/schools.html:488

### 5. [1. What TechM4Schools is / positioning] The hero paragraph describes TechM4Schools as an initiative of TechM4India serving 5+ schools and impacting 8,000+ students through experiential learning.
> TechM4Schools is an initiative of TechM4India, dedicated to transforming traditional education into a future-ready innovation ecosystem. Serving 5+ schools and impacting 8,000+ students, we empower students through experiential learning — developing critical thinking, creativity, and problem-solving skills through hands-on exposure to emerging technologies.

Source: divisions/schools.html:489

### 6. [1. What TechM4Schools is / positioning] The hero trust line claims 8,000+ students already impacted.
> <strong>8,000+ students</strong> already impacted<br/>

Source: divisions/schools.html:503

### 7. [1. What TechM4Schools is / positioning] The hero trust line claims 5+ partner schools in India (no schools are named).
> across <strong>5+ partner schools</strong> in India

Source: divisions/schools.html:504

### 8. [1. What TechM4Schools is / positioning] A floating hero badge says 'Trusted by Leading Schools' (unattributed).
> <span>Trusted by Leading Schools</span>

Source: divisions/schools.html:512

### 9. [1. What TechM4Schools is / positioning] The About heading is 'Transforming Traditional Schools into Innovation Ecosystems'.
> Transforming Traditional Schools into <span class="grad">Innovation Ecosystems</span>

Source: divisions/schools.html:577

### 10. [1. What TechM4Schools is / positioning] The About copy says TechM4Schools integrates innovation labs, structured learning programs, digital platforms and industry-aligned technologies into school campuses.
> Serving 5+ schools and impacting 8,000+ students, TechM4Schools bridges the gap between theoretical education and real-world application by integrating innovation labs, structured learning programs, digital platforms, and industry-aligned technologies directly into school campuses.

Source: divisions/schools.html:582

### 11. [1. What TechM4Schools is / positioning] The stated vision is to turn schools into innovation hubs where students progress from exploration to leadership.
> To transform schools into innovation hubs where students progress from exploration to leadership by developing real-world skills, building impactful projects, and discovering their potential early in life. We aim to nurture a generation of innovators, creators, and leaders who will drive growth in science, technology, and global innovation.

Source: divisions/schools.html:601

### 12. [1. What TechM4Schools is / positioning] The stated problem is that students get mostly theoretical education with limited practical exposure to modern technology.
> Many students receive primarily theoretical education with limited practical exposure to modern technologies. This results in reduced problem-solving abilities, limited technical confidence, and uncertainty about future career paths.

Source: divisions/schools.html:609

### 13. [1. What TechM4Schools is / positioning] The stated solution is bringing innovation ecosystems, experiential learning environments and career-oriented technology programs into schools.
> TechM4Schools addresses this challenge by bringing structured innovation ecosystems, experiential learning environments, and career-oriented technology programs directly into schools.

Source: divisions/schools.html:617

### 14. [1. What TechM4Schools is / positioning] The 'Why Choose' section is headed 'Four Pillars of Real Campus Transformation.'
> <h2>Four Pillars of <em>Real</em><br/>Campus Transformation.</h2>

Source: divisions/schools.html:632

### 15. [1. What TechM4Schools is / positioning] Pillar 1 'Skill-Based Curriculum' claims 600+ hands-on activities and 30+ STEM modules aligned with NEP and NCF.
> 600+ hands-on activities and 30+ STEM modules, designed using an interdisciplinary approach aligned with the National Education Policy (NEP) and the National Curriculum Framework (NCF).

Source: divisions/schools.html:639 (title 'Skill-Based Curriculum' at :638)

### 16. [1. What TechM4Schools is / positioning] Pillar 2 'Experiential Learning' describes learning by doing through activities, projects, innovation challenges and experiments.
> Students learn by doing — through practical activities, collaborative projects, innovation challenges, and technology-based experiments that foster deeper understanding and creativity.

Source: divisions/schools.html:646 (title 'Experiential Learning' at :645)

### 17. [1. What TechM4Schools is / positioning] Pillar 4 'End-to-End Implementation Support' lists LMS, student workbooks, teacher resources, relationship managers and lab maintenance.
> Complete support through learning management systems, student workbooks, teacher resources, dedicated relationship managers, and ongoing laboratory maintenance services.

Source: divisions/schools.html:660 (title 'End-to-End Implementation Support' at :659)

### 18. [1. What TechM4Schools is / positioning] Stat cards on the schools page show 5+ 'Partner Schools Aligned' (number at :668), 8K+ 'Students Impacted Nationwide' (:673), 30+ 'STEM Modules Delivered' (:678) and 600+ 'Hands-on Activities' (:683).
> <div class="wv-label">Students Impacted<br/>Nationwide</div>

Source: divisions/schools.html:674

### 19. [1. What TechM4Schools is / positioning] The hero card shows three stats: 5+ Innovation Labs (:531-532), 6 Core Programs (:535-536) and 3 Scalable Kits (:539-540); note the page later lists four kits.
> <div class="tc-stat-label">Scalable Kits</div>

Source: divisions/schools.html:540 (number '3' at :539)

### 20. [1. What TechM4Schools is / positioning] The About page describes the Schools division as AI tools, STEM kits and career guidance for Grade 6–12.
> <p>AI tools, STEM kits, and career guidance for Grade 6–12. The future starts early.</p>

Source: pages/about.html:722

### 21. [1. What TechM4Schools is / positioning] The registration form offers the role 'School Student (Grade 6–12)'.
> <option>School Student (Grade 6–12)</option>

Source: pages/login.html:351

### 22. [1. What TechM4Schools is / positioning] The Ecosystem page says the AI & Coding Lab is for students from Class 6 onwards and designed for state board schools.
> Scratch, Python, and AI fundamentals for students from Class 6 onwards. Designed for state board schools with basic computer infrastructure.

Source: pages/ecosystem.html:298

### 23. [1. What TechM4Schools is / positioning] The Impact page says the schools curriculum is aligned with NEP 2020 and CBSE/State board requirements (self-asserted).
> Curriculum aligned with NEP 2020 and CBSE/State board requirements

Source: pages/impact.html:368

### 24. [1. What TechM4Schools is / positioning] The Ecosystem page describes five lab formats, curriculum mapped to NEP 2020 and state board requirements, built-in teacher training and a link to TechM4Engineering.
> Our answer: five lab formats designed for India's school infrastructure reality, curriculum mapped to NEP 2020 and state board requirements, teacher training built in, and a connection to TechM4Engineering so the best students graduate into a world they've already started exploring.

Source: pages/ecosystem.html:283

### 25. [1. What TechM4Schools is / positioning] The Ecosystem page positions TechM4Schools as building the pipeline before students reach college.
> <h2>Building the Pipeline Before Students Reach College</h2>

Source: pages/ecosystem.html:280

### 26. [1. What TechM4Schools is / positioning] The homepage division card describes TechM4Schools as experiential learning programs in AI, robotics, coding, drones and future technologies.
> Experiential learning programs introducing students to AI, robotics, coding, drones, and future technologies.

Source: index.html:941

### 27. [1. What TechM4Schools is / positioning] Homepage structured data describes TechM4Schools as delivering K-12 innovation curricula in AI, robotics, coding and drones.
> "description": "TechM4Schools delivers K-12 innovation curricula — AI, robotics, coding, drones — transforming school education across India and inspiring students to build the future."

Source: index.html:137

### 28. [1. What TechM4Schools is / positioning] The README summarises TechM4Schools as K-12 innovation curriculum and STEM labs.
> | **TechM4Schools** | `/schools` | K-12 innovation curriculum & STEM labs |

Source: README.md:63

### 29. [1. What TechM4Schools is / positioning] The schools page footer tagline mentions K-12 curriculum, STEM labs and career guidance.
> Transforming school education with innovation-driven K-12 curriculum, STEM labs, and career guidance.

Source: divisions/schools.html:1204

### 30. [1. What TechM4Schools is / positioning] The schools page ticker slogans include INNOVATE., BUILD ROBOTS., CODE AI., FLY DRONES., LAUNCH SATELLITES., CREATE THE FUTURE. (lines 554-559).
> <div class="ticker-item">CREATE THE FUTURE.<span class="t-star">✦</span></div>

Source: divisions/schools.html:559

### 31. [1. Conflicting scale numbers] The About timeline (2023) gives different numbers: 50 schools in the first cohort and 3,000 students.
> CareerBuddy AI and SchoolOS platforms launched. 50 schools in first cohort. 3,000 young minds ignited with the power of technology and self-belief.

Source: pages/about.html:654

### 32. [1. Conflicting scale numbers] The Ecosystem page summarises TechM4Schools as 500+ schools, 7 districts, 5 lab formats, NEP aligned (elsewhere the 500+ figure is schools 'visited', not partnered).
> 500+ schools · 7 districts · 5 lab formats · NEP aligned

Source: pages/ecosystem.html:406

### 33. [1. Conflicting scale numbers] The 500+ schools figure refers to schools the founder personally visited across 7 Telangana districts.
> Mahi has personally visited over 500 schools across 7 Telangana districts — not from a spreadsheet.

Source: pages/ecosystem.html:282

### 34. [1. Conflicting scale numbers] The Space division page reuses the same '5+ Partner Institutions' and '8K+ Students Impacted' stats, so these numbers are not unique to TechM4Schools.
> <div class="sb-item reveal" style="transition-delay:.1s"><span class="sb-num">8K+</span><div class="sb-label">Students Impacted</div></div>

Source: divisions/space.html:456

### 35. [1. Conflicting scale numbers] The mock admin dashboard shows a Schools count of '3,428 learners' (demo data, not a verified figure).
> <div class="dm-count">3,428 learners</div>

Source: pages/admin.html:387

### 36. [1. Conflicting scale numbers] The homepage claims company-wide trust by 500+ institutions and 10,000+ students.
> Trusted by <strong>500+ institutions</strong> &amp; <strong>10,000+ students</strong><br/>building India's technology future

Source: index.html:864

### 37. [2. Innovate Bharath (no direct evidence; nearest related text)] The only '1,200+' figures in the repo are MSME market sizes in the Solutions product portfolio, not student counts.
> 1,200+ powder

Source: TECHM4.md:255

### 38. [2. Innovate Bharath (no direct evidence; nearest related text)] The repo's 'ideas' and 'grant' language relates to MSME Hackathon 6.0 (84 ideas, Rs 15L grant per idea), not to a school event.
> Grant: Rs 15L per idea

Source: TECHM4.md:1247

### 39. [2. Innovate Bharath (no direct evidence; nearest related text)] The nearest school-level competition copy is a generic 'National Innovation Challenges' programme card with no event name, date, venue or numbers.
> TechM4Schools students compete at state and national levels — against the brightest minds in India. Winners get scholarships, mentorships, and the confidence that they can compete with anyone, anywhere.

Source: divisions/schools.html:950 (title 'National Innovation Challenges' at :949)

### 40. [2. Innovate Bharath (no direct evidence; nearest related text)] The only 'funded' success story is a college-level testimonial (₹15L seed funding for 'EduBot'), unrelated to schools and placeholder-looking.
> Four months later, we had ₹15L in seed funding.

Source: pages/impact.html:333

### 41. [2. Innovate Bharath (no direct evidence; nearest related text)] The only other 'funded' mention is a future plan (2027 AI Research Park) for 10 funded startup teams.
> housing 50+ researchers, 10 funded startup teams, GPU clusters, and an open lab for partner university students

Source: pages/vision.html:335

### 42. [3. CareerBuddy] The platforms section is labelled 'School Innovation Products'.
> <p class="sec-label reveal" style="color:var(--orange)">School Innovation Products</p>

Source: divisions/schools.html:961

### 43. [3. CareerBuddy] The products section describes digital platforms and physical lab environments as the backbone for managing, monitoring and delivering innovation initiatives.
> Digital platforms and physical lab environments that serve as the backbone for managing, monitoring, and delivering innovation initiatives across educational institutions.

Source: divisions/schools.html:963

### 44. [3. CareerBuddy] CareerBuddy is badged as a 'CAREER DISCOVERY PLATFORM'.
> CAREER DISCOVERY PLATFORM</div>

Source: divisions/schools.html:967

### 45. [3. CareerBuddy] The product name is spelled 'CareerBuddy' (one word, capital B).
> <h3 class="plat-title">CareerBuddy</h3>

Source: divisions/schools.html:968

### 46. [3. CareerBuddy] CareerBuddy is described as helping students identify strengths, interests and aspirations through intelligent assessments and personalized guidance.
> Enables students to identify their strengths, interests, and future aspirations through intelligent assessments and personalized guidance.

Source: divisions/schools.html:969

### 47. [3. CareerBuddy] CareerBuddy feature 1: AI-Based Assessments.
> </div>AI-Based Assessments</div>

Source: divisions/schools.html:971

### 48. [3. CareerBuddy] CareerBuddy feature 2: Career Exploration.
> </div>Career Exploration</div>

Source: divisions/schools.html:972

### 49. [3. CareerBuddy] CareerBuddy feature 3: Subject Mapping.
> </div>Subject Mapping</div>

Source: divisions/schools.html:973

### 50. [3. CareerBuddy] CareerBuddy feature 4: Career Roadmaps.
> </div>Career Roadmaps</div>

Source: divisions/schools.html:974

### 51. [3. CareerBuddy] CareerBuddy feature 5: Future Readiness Programs.
> </div>Future Readiness Programs</div>

Source: divisions/schools.html:975

### 52. [3. CareerBuddy] The About timeline (2023) calls it 'CareerBuddy AI' and says the platforms were launched; this is the only status statement and has no URL or evidence.
> CareerBuddy AI and SchoolOS platforms launched.

Source: pages/about.html:654

### 53. [3. CareerBuddy] The Space page's five-layer model names CareerBuddy for career discovery and SchoolOS as the digital ecosystem for managing innovation programs.
> CareerBuddy for career discovery and SchoolOS as the digital ecosystem for managing innovation programs.

Source: divisions/space.html:696

### 54. [4. SchoolOS] SchoolOS is badged as a 'DIGITAL SCHOOL INNOVATION ECOSYSTEM'.
> DIGITAL SCHOOL INNOVATION ECOSYSTEM</div>

Source: divisions/schools.html:980

### 55. [4. SchoolOS] The product name is spelled 'SchoolOS' (one word, capital OS).
> <h3 class="plat-title">SchoolOS</h3>

Source: divisions/schools.html:981

### 56. [4. SchoolOS] SchoolOS is described as the digital backbone for managing and monitoring innovation initiatives across institutions.
> The digital backbone for managing and monitoring innovation initiatives across educational institutions — structured, data-driven, and campus-wide.

Source: divisions/schools.html:982

### 57. [4. SchoolOS] SchoolOS module 1: Program Management.
> </div>Program Management</div>

Source: divisions/schools.html:984

### 58. [4. SchoolOS] SchoolOS module 2: Student Profiles.
> </div>Student Profiles</div>

Source: divisions/schools.html:985

### 59. [4. SchoolOS] SchoolOS module 3: Data Insights & Analytics.
> </div>Data Insights &amp; Analytics</div>

Source: divisions/schools.html:986

### 60. [4. SchoolOS] SchoolOS module 4: Event Management.
> </div>Event Management</div>

Source: divisions/schools.html:987

### 61. [4. SchoolOS] SchoolOS module 5: Collaboration Tools.
> </div>Collaboration Tools</div>

Source: divisions/schools.html:988

### 62. [4. SchoolOS] The Research page says SchoolOS is built on the company's smart-campus research (attendance, energy monitoring, predictive maintenance, student safety).
> Automated attendance, energy monitoring, predictive maintenance, and student safety systems. Deployed across partner institutions. SchoolOS is built on this research foundation.

Source: pages/research.html:391

### 63. [4. SchoolOS] The Vision page lists a SchoolOS deployment as part of a planned 2026 smart-campus pilot at a government engineering college, i.e. future tense, which conflicts with the 2023 'launched' claim.
> First fully TechM4India-powered smart campus — AI attendance, energy monitoring, predictive maintenance, SchoolOS deployment, and real-time student outcomes dashboard. Built in partnership with a Telangana state government institution.

Source: pages/vision.html:347 (heading 'Smart Campus Pilot — Government Engineering College' at :346, tag 'Telangana · 2026' at :345)

### 64. [4. SchoolOS] The mock admin dashboard lists 'SchoolOS Integration' as an in-progress course row under Solutions (demo data).
> <td>SchoolOS Integration</td>

Source: pages/admin.html:437

### 65. [4. SchoolOS] The Solutions page lists 'School ERP' as a service item; it does not name SchoolOS.
> <li class="service-item">School ERP</li>

Source: divisions/solutions.html:808

### 66. [5. Composite Skill Lab] The repo spells the product 'Composite Skill Lab' (singular 'Skill').
> <h3 class="plat-title">Composite Skill Lab</h3>

Source: divisions/schools.html:994

### 67. [5. Composite Skill Lab] It is badged 'ADVANCED EXPERIENTIAL LEARNING'.
> ADVANCED EXPERIENTIAL LEARNING</div>

Source: divisions/schools.html:993

### 68. [5. Composite Skill Lab] Composite Skill Lab is described as an experiential learning environment giving exposure to multiple emerging technologies in one integrated ecosystem.
> An advanced experiential learning environment providing practical exposure to multiple emerging technologies under one integrated ecosystem.

Source: divisions/schools.html:995

### 69. [5. Composite Skill Lab] Equipment item 1: Tablets & Workstations.
> </div>Tablets &amp; Workstations</div>

Source: divisions/schools.html:997

### 70. [5. Composite Skill Lab] Equipment item 2: 3D Printers & Interactive Presentation Platforms.
> </div>3D Printers &amp; Interactive Presentation Platforms</div>

Source: divisions/schools.html:998

### 71. [5. Composite Skill Lab] Equipment item 3: STEM Walls & Learning Models.
> </div>STEM Walls &amp; Learning Models</div>

Source: divisions/schools.html:999

### 72. [5. Composite Skill Lab] Equipment item 4: AR/VR Capabilities.
> </div>AR/VR Capabilities</div>

Source: divisions/schools.html:1000

### 73. [5. Composite Skill Lab] Equipment item 5: Robotics, Science & Math Concept Kits.
> </div>Robotics, Science &amp; Math Concept Kits</div>

Source: divisions/schools.html:1001

### 74. [5. Composite Skill Lab] Pillar 3 uses the plural 'Composite Skill Laboratories' and claims 500+ modern tools and technologies.
> Dedicated learning environments equipped with 500+ modern tools and technologies to support innovation, experimentation, and multidisciplinary learning.

Source: divisions/schools.html:653 (title 'Composite Skill Laboratories' at :652)

### 75. [5. Five labs (listed under 'Innovation Infrastructure', not explicitly under Composite Skill Lab)] The labs section heading says there are 5 labs.
> <h2 class="sec-title reveal">Our Innovation <em>Ecosystem</em>.<br/>5 Labs. Real Technology.</h2>

Source: divisions/schools.html:819

### 76. [5. Five labs (listed under 'Innovation Infrastructure', not explicitly under Composite Skill Lab)] Each lab is described as a dedicated experiential learning environment.
> Each lab is a dedicated experiential learning environment where students gain practical exposure to emerging technologies through structured, hands-on programs and real-world projects.

Source: divisions/schools.html:820

### 77. [5. Five labs (listed under 'Innovation Infrastructure', not explicitly under Composite Skill Lab)] Lab 01 is the 'Coding & Programming Lab' (tag 'Lab 01 · Coding' at :824).
> <h3 class="lab-title">Coding &amp; Programming Lab</h3>

Source: divisions/schools.html:825

### 78. [5. Five labs (listed under 'Innovation Infrastructure', not explicitly under Composite Skill Lab)] Coding & Programming Lab description: coding fundamentals, Python, JavaScript, simple apps and games.
> Students develop logical thinking and computational skills by learning coding fundamentals, Python, JavaScript, and creating simple applications and games.

Source: divisions/schools.html:826

### 79. [5. Five labs (listed under 'Innovation Infrastructure', not explicitly under Composite Skill Lab)] Lab 02 is the 'Robotics & Automation Lab' (tag 'Lab 02 · Engineering' at :837).
> <h3 class="lab-title">Robotics &amp; Automation Lab</h3>

Source: divisions/schools.html:838

### 80. [5. Five labs (listed under 'Innovation Infrastructure', not explicitly under Composite Skill Lab)] Robotics & Automation Lab description: robotics basics, sensors, motors, circuits, robot programming, automation.
> Students learn robotics basics, sensors, motors, circuit building, robot programming, automation concepts, and collaborative problem-solving through hands-on projects.

Source: divisions/schools.html:839

### 81. [5. Five labs (listed under 'Innovation Infrastructure', not explicitly under Composite Skill Lab)] Lab 03 is the 'Drone & Aerial Technology Lab' (tag 'Lab 03 · Aerospace' at :850).
> <h3 class="lab-title">Drone &amp; Aerial Technology Lab</h3>

Source: divisions/schools.html:851

### 82. [5. Five labs (listed under 'Innovation Infrastructure', not explicitly under Composite Skill Lab)] Drone & Aerial Technology Lab description: drone technology, flight principles, components, safe flying, industry applications.
> Students gain practical exposure to drone technology, flight principles, drone components, safe flying practices, and industry applications of aerial systems.

Source: divisions/schools.html:852

### 83. [5. Five labs (listed under 'Innovation Infrastructure', not explicitly under Composite Skill Lab)] Lab 04 is the 'Artificial Intelligence Lab' (tag 'Lab 04 · Intelligence' at :863).
> <h3 class="lab-title">Artificial Intelligence Lab</h3>

Source: divisions/schools.html:864

### 84. [5. Five labs (listed under 'Innovation Infrastructure', not explicitly under Composite Skill Lab)] Artificial Intelligence Lab description: AI fundamentals, simple AI projects, real-world applications and ethics.
> Students explore the fundamentals of AI, understand how intelligent systems work, build simple AI projects, and gain awareness of real-world applications and ethical considerations.

Source: divisions/schools.html:865

### 85. [5. Five labs (listed under 'Innovation Infrastructure', not explicitly under Composite Skill Lab)] Lab 05 is the 'Innovation & Maker Education Lab' (tag 'Lab 05 · Creation' at :876).
> <h3 class="lab-title">Innovation &amp; Maker Education Lab</h3>

Source: divisions/schools.html:877

### 86. [5. Five labs (listed under 'Innovation Infrastructure', not explicitly under Composite Skill Lab)] Innovation & Maker Education Lab description: design thinking, problem identification, prototyping, project-based learning.
> Students apply design thinking principles, identify real-world problems, create prototypes, and develop innovative solutions through project-based learning.

Source: divisions/schools.html:878

### 87. [5. Five labs (conflicting alternative set)] The Ecosystem page lists a different set of school lab formats: AI & Coding Lab, Robotics Lab, BioTech Basics Lab, Green Tech Lab, Data Science Starter (lines 298-302).
> <h4>BioTech Basics Lab</h4><p>DNA extraction, microscopy, and bioinformatics introduction. Bridges biology and computer science for science stream students.</p>

Source: pages/ecosystem.html:300

### 88. [5. Five labs (conflicting alternative set)] The Ecosystem page describes the school Robotics Lab as Arduino-based.
> Arduino-based robot builds, sensor programming, and mechanical design. Students build working robots in their first session.

Source: pages/ecosystem.html:299

### 89. [6. Kits] The kits section is labelled 'Hands-On Learning Kits'.
> <p class="sec-label reveal">Hands-On Learning Kits</p>

Source: divisions/schools.html:1012

### 90. [6. Kits] The kits intro names robotics kits, coding kits, electronics modules and drone technology kits.
> Students receive access to practical learning resources — robotics kits, coding kits, electronics modules, and drone technology kits — enabling real-world experimentation directly in the classroom.

Source: divisions/schools.html:1014

### 91. [6. Kits] Kit 1 'Robotics Learning Kit' is said to include motors, sensors, microcontrollers and 12 project guides.
> Build and program your own autonomous robot. Includes motors, sensors, microcontrollers, and 12 project guides.

Source: divisions/schools.html:1019 (name 'Robotics Learning Kit' at :1018)

### 92. [6. Kits] Kit 2 'Coding & Electronics Kit' is described as 20 progressive electronic projects.
> From LEDs to full circuits — students code their way through 20 progressively exciting electronic projects.

Source: divisions/schools.html:1025 (name 'Coding &amp; Electronics Kit' at :1024)

### 93. [6. Kits] Kit 3 'Drone Exploration Kit' is described as assembling, calibrating and flying a real drone.
> Assemble, calibrate, and fly a real drone. Understand aerodynamics, control systems, and aerial navigation firsthand.

Source: divisions/schools.html:1031 (name 'Drone Exploration Kit' at :1030)

### 94. [6. Kits] Kit 4 'Innovation Project Kit' is described as including 3D printing filaments, electronics components and open-ended challenges.
> The ultimate maker kit — 3D printing filaments, electronics components, and open-ended project challenges to spark invention.

Source: divisions/schools.html:1037 (name 'Innovation Project Kit' at :1036)

### 95. [6. Kits] Each kit card carries the commercial label 'Included in Partnership' (no price, no grade band).
> <span class="kit-price">Included in Partnership</span>

Source: divisions/schools.html:1020

### 96. [6. Kits] The mock admin dashboard references a 'Grade 10 STEM Kit' course row (demo data; the only grade-specific kit reference in the repo).
> <td>Grade 10 STEM Kit</td>

Source: pages/admin.html:431

### 97. [7. Programmes] The programmes intro covers innovation workshops, competitions, exhibitions and technology events.
> Innovation workshops, competitions, exhibitions, and technology events designed to strengthen creativity, collaboration, and critical thinking in every student.

Source: divisions/schools.html:903

### 98. [7. Programmes] Programme 'Innovation Learning Programs' (tag 'Year-Round'): real-world challenges through to pitching startup ideas.
> Students tackle real-world challenges using technology. From solving local problems to pitching startup ideas — this program builds the entrepreneurial mindset that India urgently needs.

Source: divisions/schools.html:910 (title at :909, tag at :908)

### 99. [7. Programmes] Programme 'Technology Exploration Workshops' (tag 'Monthly'): a new technology each month, e.g. AR/VR, quantum computing basics, blockchain.
> Hands-on, fast-paced, thrilling workshops where students explore new technologies each month. One month it's AR/VR, next it's quantum computing basics, then blockchain. Always exciting. Always new.

Source: divisions/schools.html:918 (title at :917, tag at :916)

### 100. [7. Programmes] Programme 'Future Technology Awareness' (tag 'Awareness Series'): awareness of AI, space tech and bioengineering.
> The world is changing fast. This program ensures every student knows what's coming — AI revolutions, space tech, bioengineering, and how they can be part of it all. Knowledge is the first superpower.

Source: divisions/schools.html:926 (title at :925, tag at :924)

### 101. [7. Programmes] Programme 'Summer Innovation Camps' (tag 'Seasonal'): described as 3 weeks with challenges, hackathons, drone racing and robot battles; 'Spots fill up instantly!' is unevidenced hype.
> The most exciting 3 weeks of any student's year. Immersive daily challenges, team competitions, hackathons, drone racing, robot battles — and friendships that last a lifetime. Spots fill up instantly!

Source: divisions/schools.html:934 (title at :933, tag at :932)

### 102. [7. Programmes] Programme 'Student Project Development' (tag 'Project-Based'): each student builds an app, robot or prototype, mentored by industry professionals and showcased at national innovation expos (unevidenced).
> Every student gets to build something real — an app, a robot, a working prototype. Mentored by industry professionals. Showcased at national innovation expos. This is how careers are born.

Source: divisions/schools.html:942 (title at :941, tag at :940)

### 103. [7. Programmes] Programme 6 is titled 'National Innovation Challenges' with tag 'Competition'.
> <h3>National Innovation Challenges</h3>

Source: divisions/schools.html:949

### 104. [7. Programmes / NEP wording] The hero badge wording is 'NEP 2020 Aligned Curriculum'.
> <span class="fb-green">NEP 2020</span> Aligned Curriculum

Source: divisions/schools.html:546

### 105. [7. Programmes / NEP wording] The partners chip row uses the wording 'NEP 2020 Aligned'.
> NEP 2020 Aligned</div>

Source: divisions/schools.html:766

### 106. [7. Programmes / NEP wording] The homepage claims the curriculum 'maps directly to NEP 2020, AICTE, and UGC frameworks' (company-wide, self-asserted).
> Our curriculum maps directly to NEP 2020, AICTE, and UGC frameworks — so institutions earn academic credit while students build real skills.

Source: index.html:1078

### 107. [7. Programmes] The Ecosystem page says every lab installation includes a 3-day intensive teacher training.
> Every lab installation includes 3-day intensive teacher training. The lab is only as good as the teacher who runs it.

Source: pages/ecosystem.html:303

### 108. [7. Programmes / 5-layer model] The page presents a '5-Layer Transformation Framework'.
> Our 5-Layer <span class="grad">Transformation Framework</span>

Source: divisions/schools.html:1090

### 109. [7. Programmes / 5-layer model] Layer 1 – Physical Innovation Labs: permanent labs covering coding, robotics, AI, innovation and maker education (drones not listed here).
> Permanent innovation labs established within schools, covering coding, robotics, artificial intelligence, innovation, and maker education.

Source: divisions/schools.html:1099 (title 'Layer 1 – Physical Innovation Labs' at :1098)

### 110. [7. Programmes / 5-layer model] Layer 2 – Curriculum-Integrated Learning Modules: integrated into existing academic structures without disrupting the school schedule.
> Technology-based learning experiences seamlessly integrated into existing academic structures without disrupting the regular school schedule.

Source: divisions/schools.html:1107 (title 'Layer 2 – Curriculum-Integrated Learning Modules' at :1106)

### 111. [7. Programmes / 5-layer model] Layer 3 – Student Development Programs: workshops, competitions, exhibitions and technology events.
> Innovation workshops, competitions, exhibitions, and technology events conducted to strengthen creativity, collaboration, and critical thinking.

Source: divisions/schools.html:1115 (title 'Layer 3 – Student Development Programs' at :1114)

### 112. [7. Programmes / 5-layer model] Layer 4 – Hands-On Learning Kits: robotics kits, coding kits, electronics modules, drone technology kits.
> Students receive access to practical learning resources including robotics kits, coding kits, electronics modules, and drone technology kits.

Source: divisions/schools.html:1123 (title 'Layer 4 – Hands-On Learning Kits' at :1122)

### 113. [7. Programmes / 5-layer model] Layer 5 – Digital Platforms: platforms supporting student development, innovation programs, institutional management and career guidance.
> Technology-driven platforms supporting student development, innovation programs, institutional management, and career guidance initiatives.

Source: divisions/schools.html:1131 (title 'Layer 5 – Digital Platforms' at :1130)

### 114. [7. Programmes] The page has a 5-question 'innovation quiz' whose intro promises a personalised innovation path and 'maybe even a scholarship' (no scholarship scheme is documented).
> Take this 5-question challenge and discover your inner tech genius. Your score unlocks a personalised innovation path — and maybe even a scholarship!

Source: divisions/schools.html:1051

### 115. [7. Programmes] The closing CTA lists four offer points: Free Initial Consultation, Custom Lab Design, Dedicated Expert Support, Flexible Partnership Models (lines 1153-1156).
> Flexible Partnership Models</div>

Source: divisions/schools.html:1156

### 116. [7. Programmes] The Contact page pitches TechM4Schools as a CSR vehicle (fund a lab in a government school).
> TechM4Schools is the ideal CSR vehicle. Fund a lab in a government school. Sponsor N-STEP scholarships for underprivileged students. Measurable impact with annual reporting and student outcome data.

Source: pages/contact.html:333

### 117. [8. Student journey] The vision card is headed 'From Exploration to Leadership'.
> From Exploration to Leadership</h3>

Source: divisions/schools.html:594

### 118. [8. Student journey] The hero card frames a 'TECHM4 TRANSFORMATION' from 'Traditional / Theory-focused. Passive.' (:519-520) to 'Innovation-led / Maker-focused. Creative.' (:525-526).
> <div class="tc-kid-role">Maker-focused. Creative.</div>

Source: divisions/schools.html:526

### 119. [8. Student journey] The journey section is labelled 'The TechM4 Effect' and is a 4-step model (heading 'Watch Your Child Transform in 4 Steps' at :779).
> <p class="reveal" style="color:var(--orange)">The TechM4 Effect</p>

Source: divisions/schools.html:777

### 120. [8. Student journey] Step 1 is 'Explore & Wonder'.
> Students discover their first robot, write their first line of code, and feel that magical spark of "I can do this."

Source: divisions/schools.html:788 (title 'Explore &amp; Wonder' at :787)

### 121. [8. Student journey] Step 2 is 'Build & Experiment'.
> Hands get dirty. Circuits get connected. Robots start moving. Students make mistakes and love every second of it.

Source: divisions/schools.html:795 (title 'Build &amp; Experiment' at :794)

### 122. [8. Student journey] Step 3 is 'Innovate & Create'.
> Now they're inventing — solving real problems, designing AI systems, building apps, and leading their first projects.

Source: divisions/schools.html:802 (title 'Innovate &amp; Create' at :801)

### 123. [8. Student journey] Step 4 is 'Lead & Launch', with the outcome stated as 'young innovators'.
> They graduate as young innovators — ready to lead India's technology revolution and change the world.

Source: divisions/schools.html:809 (title 'Lead &amp; Launch' at :808)

### 124. [8. Student journey] The Ecosystem page describes the cross-division progression: schools produce curious students, colleges transform them, ending in innovators, researchers and founders.
> Each division feeds the others. Schools produce curious students. Engineering colleges transform them with labs and programs. Solutions gives them real products to build on. Space gives them a frontier to aim for. The output: India's next generation of innovators, researchers, and founders.

Source: pages/ecosystem.html:404

### 125. [8. Student journey] The homepage CTA uses the verbs 'explore, innovate, and lead'.
> Partner with TechM4India to create future-ready learning environments that inspire students to explore, innovate, and lead.

Source: index.html:1052

### 126. [8. Student journey] Quiz result tiers are titled 'Innovator in the Making!', 'Natural Technology Thinker!', 'Future Tech Leader!' and 'You're a Born Innovator!' (lines 1377-1380).
> title:'Future Tech Leader!'

Source: divisions/schools.html:1379

### 127. [9. Partnerships and validation] The schools page partners section is headed 'Approved & Supported By Leading Entities' (no approval documents or details are given).
> Approved &amp; Supported <span class="grad">By Leading Entities</span>

Source: divisions/schools.html:748

### 128. [9. Partnerships and validation] The partners sub-line speaks of higher education partnerships and alignment with national development initiatives.
> Empowered by higher education partnerships and aligned with national development initiatives.

Source: divisions/schools.html:749

### 129. [9. Partnerships and validation] The only named institution on the schools page is 'Anurag University' (written in full; 'AU' is never used).
> <h4 style="font-family:'Sora',sans-serif; font-size:1.25rem; font-weight:900; color:var(--ink)">Anurag University</h4>

Source: divisions/schools.html:755

### 130. [9. Partnerships and validation] Anurag University's role is worded as 'Primary Academic Approval & Lab Support Partner'.
> Primary Academic Approval &amp; Lab Support Partner</p>

Source: divisions/schools.html:756

### 131. [9. Partnerships and validation] CONTRADICTION: the Impact page's 2026 milestone says the first formal university partnership is still being negotiated, with Anurag University 'in active discussion'.
> First formal university partnership negotiations underway. Anurag University in active discussion. Target: 10 partner institutions by end of 2026, 100,000 students touched within 3 years.

Source: pages/impact.html:351

### 132. [9. Partnerships and validation] The Vision roadmap lists 'First formal university partnerships signed' under '2025–2026 · In Progress'.
> N-STEP live cohorts running. First formal university partnerships signed. All six labs available for installation. TechM4Space program launched. 10 partner institutions by end of 2026.

Source: pages/vision.html:318

### 133. [9. Partnerships and validation] The schools page shows a text chip 'Skill India' (no stated relationship; no logo).
> </span> Skill India</div>

Source: divisions/schools.html:761

### 134. [9. Partnerships and validation] The schools page shows a text chip 'NITI Aayog' (no stated relationship; no logo).
> </span> NITI Aayog</div>

Source: divisions/schools.html:762

### 135. [9. Partnerships and validation] The schools page shows a text chip 'NSDC' (no stated relationship on this page).
> </span> NSDC</div>

Source: divisions/schools.html:763

### 136. [9. Partnerships and validation] The schools page shows a text chip 'Digital India' (no stated relationship; no logo).
> </span> Digital India</div>

Source: divisions/schools.html:764

### 137. [9. Partnerships and validation] The schools page shows a text chip 'Startup India' (no stated relationship; no logo).
> </span> Startup India</div>

Source: divisions/schools.html:765

### 138. [9. Partnerships and validation] NASSCOM is spelled 'NASSCOM' (all caps) and appears only once, as a logo with the title 'NASSCOM Ecosystem' on the About page; no involvement is described.
> <div class="collab-logo-item" title="NASSCOM Ecosystem"><img src="../assets/images/logo_nasscom.png" alt="NASSCOM Logo"></div>

Source: pages/about.html:944

### 139. [9. Partnerships and validation] The About page shows the CBSE logo with the title 'CBSE Partner Schools' (no schools named).
> <div class="collab-logo-item" title="CBSE Partner Schools"><img src="../assets/images/logo_cbse.png" alt="CBSE Logo"></div>

Source: pages/about.html:940

### 140. [9. Partnerships and validation] The About page shows a Government of Telangana emblem with the title 'Telangana State Board'.
> <div class="collab-logo-item" title="Telangana State Board"><img src="../assets/images/logo_telangana_state.png" alt="Telangana State Board Logo"></div>

Source: pages/about.html:938

### 141. [9. Partnerships and validation] The About page shows the ISRO logo (hot-linked from Wikimedia) with the title 'ISRO Education Partners'.
> <div class="collab-logo-item" title="ISRO Education Partners"><img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Indian_Space_Research_Organisation_Logo.svg" alt="ISRO Logo"></div>

Source: pages/about.html:941

### 142. [9. Partnerships and validation] The About page shows the DRDO logo with the title 'DRDO Research Affiliates'.
> <div class="collab-logo-item" title="DRDO Research Affiliates"><img src="../assets/images/logo_drdo.png" alt="DRDO Logo"></div>

Source: pages/about.html:946

### 143. [9. Partnerships and validation] The About page uses the NSDC logo under the title 'State Skill Development Boards'.
> <div class="collab-logo-item" title="State Skill Development Boards"><img src="../assets/images/logo_nsdc.png" alt="NSDC Logo"></div>

Source: pages/about.html:947

### 144. [9. Partnerships and validation] The About page uses the Emblem of India (hot-linked) under the title 'Startup India Network'.
> <div class="collab-logo-item" title="Startup India Network"><img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India Logo"></div>

Source: pages/about.html:948

### 145. [9. Partnerships and validation] The About timeline (2024) claims partnerships with engineering colleges, CBSE schools and state government skill development boards, without naming any.
> TechM4India signs partnerships with engineering colleges, CBSE schools, and state government skill development boards. The movement goes national.

Source: pages/about.html:666

### 146. [9. Partnerships and validation] The homepage partners strip is headed 'Backed by Leading Institutions'.
> Backed by <span class="grad">Leading Institutions</span>

Source: index.html:1093

### 147. [9. Partnerships and validation] The homepage shows the Anurag University logo from assets/images/logo_anurag.png.
> <img src="assets/images/logo_anurag.png" alt="Anurag University Logo">

Source: index.html:1096

### 148. [9. Partnerships and validation] The homepage labels AICTE only as 'AICTE Framework' (logo hot-linked from Wikimedia).
> <div class="logo-item" title="AICTE Framework">

Source: index.html:1103

### 149. [9. Partnerships and validation] The homepage labels ISRO only as 'ISRO-Inspired Curriculum' / 'ISRO-Inspired'.
> <div class="logo-item" title="ISRO-Inspired Curriculum">

Source: index.html:1107

### 150. [9. Partnerships and validation] The homepage labels DRDO only as 'DRDO-Aligned Programs' / 'DRDO-Aligned'.
> <div class="logo-item" title="DRDO-Aligned Programs">

Source: index.html:1111

### 151. [9. Partnerships and validation] The homepage shows a generic 'Government Initiative Partnerships' item using assets/images/logo_govt.png.
> <div class="logo-item" title="Government Initiative Partnerships">

Source: index.html:1115

### 152. [9. Partnerships and validation] The Impact page says the company was accepted into T-Hub in 2022 (company-level claim, not on the schools page).
> Company incorporated. Accepted into T-Hub — India's No.1 startup incubator backed by TGIIC.

Source: pages/impact.html:347

### 153. [9. Partnerships and validation] The Vision roadmap claims T-Hub incubation, 500+ schools visited and 'NSDC alignment secured' for 2022–2024.
> Incubated at T-Hub. 500+ schools visited. NSDC alignment secured. Four MoUs signed with HCL, JPMorgan, Deloitte, and Tech Mahindra. All six lab formats designed and tested.

Source: pages/vision.html:317

### 154. [9. Partnerships and validation] The Contact page lists backers as T-Hub, TGIIC ('Telangana Govt Technology Partner') and NSDC ('Skill India Aligned').
> T-Hub (India's No.1 Incubator)<br/>TGIIC — Telangana Govt Technology Partner<br/>NSDC — Skill India Aligned<br/>4 Active MoUs with Fortune 500 Companies

Source: pages/contact.html:314

### 155. [9. Partnerships and validation] The Space page (not the Schools page) additionally lists an 'AICTE' chip in its partners row.
> <span class="partner-chip">🎓 AICTE</span>

Source: divisions/space.html:867

### 156. [10. Testimonials / outcomes] The schools page contains no attributed testimonial; its strongest outcome line is unattributed marketing copy.
> Every single child who walks into a TechM4 lab walks out with something they've never felt before: the unshakeable belief that they can build anything.

Source: divisions/schools.html:781

### 157. [10. Testimonials / outcomes] The Impact page testimonials are college-level (N-STEP, RBLP, LSEP), use emoji avatars and generic names; e.g. 'Priya Reddy' — looks like placeholder copy.
> <div class="sa-name">Priya Reddy</div><div class="sa-role">AI Track · N-STEP Batch 1 · Placed @ HCL Technologies</div>

Source: pages/impact.html:304

### 158. [10. Testimonials / outcomes] One Impact testimonial ('Kiran Venkat') credits Anurag University, although the same page says the Anurag partnership is still in discussion — a sign of invented copy.
> T-Hub is now helping us scale it. Anurag University is why this happened.

Source: pages/impact.html:309

### 159. [10. Testimonials / outcomes] The login page testimonial is attributed to 'Rajesh Kumar', a name that also appears as demo data in the mock admin dashboard (admin.html:411, :495) — placeholder.
> <div class="lt-role">Software Engineer, Wipro · Full Stack Path</div>

Source: pages/login.html:264

### 160. [10. Testimonials / outcomes] The homepage shows an unsourced '+340% student innovation rate' badge.
> <span class="hvb-green">+340%</span> student innovation rate

Source: index.html:884

### 161. [10. Testimonials / outcomes] The homepage shows an unsourced 'India's #1 EdTech Ecosystem' badge.
> India's #1 EdTech Ecosystem</div>

Source: index.html:869

### 162. [10. Testimonials / outcomes] The homepage shows an unsourced '98% Partner Satisfaction Rate' stat.
> <span class="stat-num">98%</span><div class="stat-label">Partner Satisfaction Rate</div>

Source: index.html:964

### 163. [11. People attached to TechM4Schools] The schools page experts section is headed 'Meet the Experts Behind TechM4Schools'.
> <p class="sec-label reveal">Meet the Experts Behind TechM4Schools</p>

Source: divisions/schools.html:695

### 164. [11. People attached to TechM4Schools] Dr. K. Sudheer Reddy is listed with the role 'Dean – Academics & Planning, Anurag University'.
> <p class="expert-role">Dean – Academics &amp; Planning, Anurag University</p>

Source: divisions/schools.html:706 (name at :705)

### 165. [11. People attached to TechM4Schools] The image alt text describes Dr. K. Sudheer Reddy as 'strategic advisor to TechM4Schools'.
> Professional headshot of Dr. K. Sudheer Reddy, Dean of Academics and Planning at Anurag University and strategic advisor to TechM4Schools

Source: divisions/schools.html:703

### 166. [11. People attached to TechM4Schools] Dr. Sudheer Reddy's blurb (third-person text inside quote marks, not a real testimonial) says he has over two decades of experience and provides strategic direction.
> "With over two decades of experience in academics and technology, Dr. Sudheer Reddy provides strategic direction to ensure that innovation becomes an integral part of education. His vision focuses on bridging the gap between theoretical learning and practical application, preparing students to become future leaders and innovators."

Source: divisions/schools.html:707

### 167. [11. People attached to TechM4Schools] Mahesh Mannuru is listed as 'Senior Technical Lead' with expertise in embedded systems, cybersecurity, AUTOSAR integration and software development.
> "Mahesh brings extensive expertise in embedded systems, cybersecurity, AUTOSAR integration, and software development. Through TechM4Schools, he helps design hands-on learning experiences that expose students to industry-relevant technologies and real-world engineering concepts."

Source: divisions/schools.html:716 (name at :714, role at :715)

### 168. [11. People attached to TechM4Schools] Mettu Raja Reddy is listed as 'Senior Technical Lead' with experience in business analysis, product management and entrepreneurship.
> "With diverse experience across business analysis, product management, and entrepreneurship, Mettu Raja Reddy contributes to building innovation ecosystems that encourage creativity, problem-solving, and future readiness among students."

Source: divisions/schools.html:725 (name at :723, role at :724)

### 169. [11. People attached to TechM4Schools] Elavala Bharath Reddy is listed as 'Senior Technical Lead' specialising in Salesforce technologies and digital transformation.
> "Specializing in Salesforce technologies and digital transformation solutions, Bharath Reddy supports the development of scalable educational platforms that enhance learning experiences and empower institutions through technology."

Source: divisions/schools.html:734 (name at :732, role at :733)

### 170. [11. People attached to TechM4Schools] On the homepage the three technical leads carry the explicit role 'Senior Technical Lead, TechM4Schools' (lines 1028, 1037, 1046).
> <p class="expert-role">Senior Technical Lead, TechM4Schools</p>

Source: index.html:1028

### 171. [11. People attached to TechM4Schools] The founder ('Mahi') is credited with the school field research; the About page names 'Thanniru Mahesh' as Founder, Managing CEO & Chief Marketing Manager.
> <div class="role">Founder, Managing CEO &amp; Chief Marketing Manager</div>

Source: pages/about.html:791 (name 'Thanniru Mahesh' at :790)

### 172. [11. People attached to TechM4Schools] The schools page contact phone number is +91 63018 14246.
> <a class="contact-card-link" href="tel:+916301814246">+91 63018 14246</a>

Source: divisions/schools.html:1174

### 173. [11. People attached to TechM4Schools] The schools page contact email is ceo@techm4india.com.
> <a class="contact-card-link" href="mailto:ceo@techm4india.com">ceo@techm4india.com</a>

Source: divisions/schools.html:1181

### 174. [11. People attached to TechM4Schools] Mentors are mentioned only generically (no named school mentors), e.g. in quiz result copy.
> TechM4Schools will give you the labs, tools, and mentors to unlock your full potential.

Source: divisions/schools.html:1377

## Facts the checker says were missed
- [2. Innovate Bharath / 9. Pallavi / NITs / AU (absence)] A repo-wide search (html, md, js, json) for 'Innovate Bharat', 'Bharath' (other than the person Elavala Bharath Reddy), 'Pallavi', 'NIT'/'NITs' and standalone 'AU' returns no matches. Nothing in the repo supports '1,200+ students', 'eight ideas selected and funded', Pallavi International School, or any NIT involvement. These must come from the client with evidence.
  > <h3 class="expert-name">Elavala Bharath Reddy</h3>
  Source: divisions/schools.html:732 (only 'Bharath' hit type; zero hits for the other terms)
- [1. Conflicting scale numbers] The About timeline 2024 entry is headed '200+ Institutions. 10,000+ Students.', a third set of scale numbers conflicting with 5+ schools / 8,000+ students.
  > <h4>200+ Institutions. 10,000+ Students.</h4>
  Source: pages/about.html:665
- [1. Conflicting scale numbers] The homepage stat box claims '500+ Partner Institutions Nationwide', upgrading the '500+ schools visited' figure to partners.
  > <div class="stat-box"><span class="stat-num">500+</span><div class="stat-label">Partner Institutions Nationwide</div></div>
  Source: index.html:959
- [1. Conflicting scale numbers] The Impact page words the 500+ figure as schools 'personally researched' / 'Schools Visited' across 7 Telangana districts, not partner schools.
  > 500+ schools personally researched across 7 Telangana districts
  Source: pages/impact.html:365 (stat 'Schools Visited' at :373, 'Districts Covered' at :374)
- [1. Conflicting scale numbers] The Impact milestone dates the school visits to 2021 and describes them as conversations with students, teachers and principals.
  > Mahi begins personally visiting schools across Telangana's 7 districts. Not surveys — actual conversations with students, teachers, and principals.
  Source: pages/impact.html:346
- [1. What TechM4Schools is / positioning] The schools page About section lists five focus areas as chips: Robotics & Automation, Artificial Intelligence, Coding & Programming, Drone & Aerial Tech, Innovation & Maker Education.
  > 💡 Innovation &amp; Maker Education</span>
  Source: divisions/schools.html:589 (chips at :585-589)
- [1. What TechM4Schools is / positioning] The Impact page has a dedicated 'TechM4Schools Impact' block headed 'Building the Pipeline Before Students Reach You', with the line 'We fix this at the school level.'
  > <h2>Building the Pipeline <span>Before Students Reach You</span></h2>
  Source: pages/impact.html:362 (label 'TechM4Schools Impact' at :361)
- [1. What TechM4Schools is / positioning] The Impact page says the TechM4Schools playbook starts in Telangana and is designed for replication in every Indian state.
  > Starting local. Scaling national. The TechM4Schools playbook is designed for replication in every Indian state.
  Source: pages/impact.html:377
- [10. Testimonials / outcomes] The Impact page asserts an unevidenced outcome: students from Tier-3 towns entering engineering college with real lab experience.
  > Students from Tier-3 towns entering engineering college with real lab experience
  Source: pages/impact.html:369
- [7. Programmes] The Impact page states teacher training is embedded in every lab installation (corroborates the Ecosystem page's 3-day training claim).
  > Teacher training embedded in every lab installation
  Source: pages/impact.html:367
- [5. Five labs (count conflict)] The Vision roadmap speaks of 'six lab formats' (company-wide), conflicting with the 'five lab formats' / '5 Labs' wording used for schools.
  > All six lab formats designed and tested.
  Source: pages/vision.html:317
- [7. Programmes] The About timeline (2023) claims 'India's first school-level space lab curriculum' where students build and launch model rockets; an unevidenced 'first' claim relevant to school programmes.
  > India's first school-level space lab curriculum launches. Students build and launch model rockets, program satellites, and study orbital mechanics.
  Source: pages/about.html:638
- [1. What TechM4Schools is / positioning] The Vision roadmap sets a 2027 target of TechM4Schools in every Telangana district (future goal, not an achievement).
  > TechM4Schools in every Telangana district.
  Source: pages/vision.html:319
- [11. People attached to TechM4Schools] 'Mahi' is signed as 'Founder & CEO, TechM4India' on the Vision page; the short name is used without a surname.
  > — Mahi, Founder &amp; CEO, TechM4India
  Source: pages/vision.html:367
- [11. People attached to TechM4Schools] The schools page experts intro describes the people as 'experienced professionals behind TechM4Schools'; the section heading is 'Meet the Visionaries Driving Educational Innovation'.
  > The experienced professionals behind TechM4Schools are committed to transforming traditional education through experiential learning, emerging technologies, and student-centric innovation.
  Source: divisions/schools.html:697 (heading at :696)
- [11. People attached to TechM4Schools] On the homepage Dr. K. Sudheer Reddy's alt text does NOT call him an advisor to TechM4Schools (only the schools page alt text does); his visible role is only the Anurag University deanship. Photo file: assets/images/dr-sudheer-reddy.png.
  > Professional headshot of Dr. K. Sudheer Reddy, Dean of Academics and Planning at Anurag University
  Source: index.html:1016
- [9. Partnerships and validation] Logo files present in the repo: assets/images/logo_anurag.png, logo_nasscom.png, logo_cbse.png, logo_drdo.png, logo_nsdc.png, logo_govt.png, logo_nep.png, logo_jntu.png, logo_telangana_state.png (a Government of Telangana seal). The homepage also shows a 'NEP 2020 Aligned' badge image.
  > <img src="assets/images/logo_nep.png" alt="NEP 2020 Aligned Badge">
  Source: index.html:1100
- [9. Partnerships and validation] The homepage partners strip label is 'Trusted Partners & Recognition' and it names Anurag University with a visible caption.
  > <p class="sec-label reveal">Trusted Partners &amp; Recognition</p>
  Source: index.html:1092 (Anurag caption at :1097)
- [9. Partnerships and validation] The Contact page says the company is 'already NSDC-aligned and working with TGIIC' (company-level, self-asserted).
  > TechM4India is already NSDC-aligned and working with TGIIC.
  Source: pages/contact.html:336
- [9. Partnerships and validation] The Research page describes TGIIC as an 'active technology partner' providing access to government data and enterprise networks (company-level, unevidenced).
  > Telangana Government's Industrial and Investment Corporation is our active technology partner — providing access to government data and enterprise networks.
  Source: pages/research.html:458
- [9. Partnerships and validation] The About collaborators strip also shows a JNTU logo titled 'JNTU Affiliated Colleges' alongside the CBSE/NASSCOM/ISRO/DRDO logos; titles are tooltip-only, with no described relationship.
  > <div class="collab-logo-item" title="JNTU Affiliated Colleges"><img src="../assets/images/logo_jntu.png" alt="JNTU Logo"></div>
  Source: pages/about.html:939
- [2. Innovate Bharath (nearest numeric hit)] The mock admin dashboard contains a demo value '1,200 enrolled'; it is placeholder dashboard data and not evidence for an event headcount.
  > <div class="tc-enroll">1,200</div>
  Source: pages/admin.html:544
- [10. Testimonials / outcomes (placeholder demo data)] The mock admin dashboard's Schools row uses an invented student ('Meera Rao', Chennai) and a '+18%' growth figure; all demo data, not publishable.
  > <div class="dm-top"><span class="dm-icon">🏫</span><span class="dm-pct">+18%</span></div>
  Source: pages/admin.html:385 (Meera Rao row at :429-432)
- [7. Programmes] The homepage says programmes span 'From K-12 to postgraduate'.
  > From K-12 to postgraduate, our programs build the critical thinking, creativity, and leadership skills that define tomorrow's innovators.
  Source: index.html:1083
- [3/4. CareerBuddy and SchoolOS (URL / status)] Neither CareerBuddy nor SchoolOS has any URL, link, login or screenshot anywhere in the repo; the product cards on the schools page are plain text with no anchor, and the only status wording is the About timeline's 'launched' (2023) versus the Vision page's planned 2026 'SchoolOS deployment'.
  > <h3 class="plat-title">CareerBuddy</h3>
  Source: divisions/schools.html:968 (card :966-977 contains no href)

## Images in the old repo relevant to schools
- assets/images/journey_schools.png (1024x1024 (JPEG data despite .png extension)): Polished illustration-style scene of a neon-lit school STEM lab: about 15 children at desks building LEGO-style robots, laptops and tablets, 3D printers, floating holographic panels reading 'CODING LAB', 'BUILD YOUR ROBOT', 'MISSION: MARS ROVER', 'BLOCKS & LOGIC', 'ROBOT CONTROL: ACTIVE'. Used as the 2023 Schools Division timeline image on pages/about.html:657. | concerns: AI-generated-looking (holograms, garbled micro-text, non-Indian-looking generic children); baked-in English text; shows identifiable-looking child faces (synthetic); misleading if shown as a real lab; wrong file extension.
- assets/images/schools-banner.png (512x320): NOT a schools image: a cropped screenshot of the old homepage hero ('Innovation Ecosystem.' headline, 'Explore Our Ecosystem' / 'Our Story' buttons, 'Trusted by 500+ institutions & 10,000+ students'). Not referenced by any HTML file. | concerns: Low resolution; baked-in text with unverified claims; filename is misleading; unused in the old site.
- assets/images/dr-sudheer-reddy.png (362x536): Head-and-shoulders portrait of a man with a moustache in a grey suit, striped shirt and striped tie, cut out on white. Used as Dr. K. Sudheer Reddy (Dean – Academics & Planning, Anurag University) on schools.html:703, index.html:1016, space.html:815. | concerns: Low resolution and soft/over-smoothed; rough cut-out edges; consent of a third-party university official should be confirmed.
- assets/images/mahesh-mannuru.png (448x468): Head-and-shoulders portrait of a bearded man in a navy suit, white shirt and grey tie, cut out on white. Used as Mahesh Mannuru, Senior Technical Lead. | concerns: Low resolution; looks AI-enhanced or heavily filtered (hair has an unnatural teal tint, plastic skin smoothing); cut-out halo at shoulders.
- assets/images/mettu-raja-reddy.png (660x736): Head-and-shoulders portrait of a smiling bearded man in a blue blazer, light blue shirt and dark tie, cut out on white. Used as Mettu Raja Reddy, Senior Technical Lead. | concerns: Soft, upscaled-looking detail; jagged cut-out edge on the right shoulder; otherwise the most usable of the four headshots.
- assets/images/elavala-bharath-reddy.png (424x512): Passport-style portrait of a bearded young man in a dark navy suit, white shirt and blue tie on white. Used as Elavala Bharath Reddy, Senior Technical Lead. | concerns: Low resolution; AI-enhanced look; a small tool watermark/glyph is visible at the bottom-right corner and would need cropping.
- assets/images/logo_anurag.png (738x231): Anurag University logo: red and navy 'AU'-style monogram mark beside the wordmark 'ANURAG UNIVERSITY'. Used on index.html:1096. | concerns: Third-party logo (permission needed); relationship status is contradictory in the repo ('Primary Academic Approval & Lab Support Partner' vs 'in active discussion'); slightly soft raster, no vector.
- assets/images/logo_nep.png (362x444): A generic gold rosette badge with red ribbons and the text 'NEP 2020 ALIGNED'. Used on index.html:1100. | concerns: Not an official mark: a home-made/stock badge that implies certification; baked-in text; low resolution; stock-looking.
- assets/images/logo_cbse.png (500x500): CBSE emblem in teal with Hindi lettering, plus 'CBSE' and 'Central Board of Secondary Education' text. Used on about.html:940 titled 'CBSE Partner Schools'. | concerns: Third-party government/statutory body logo; re-coloured non-official rendering with added text; implies endorsement the repo does not evidence.
- assets/images/logo_nasscom.png (545x366): The red 'NASSCOM' wordmark with registered-trademark symbol on white. Used on about.html:944 titled 'NASSCOM Ecosystem'. | concerns: Third-party trademark; no involvement is described anywhere in the repo; raster only with large white margins.
- assets/images/logo_nsdc.png (447x447): NSDC logo: three stylised figures (green, blue, red) with 'N·S·D·C' and 'RE>IMAGINE FUTURE'. Used on about.html:947 under the title 'State Skill Development Boards'. | concerns: Third-party logo; the old site mislabels it as 'State Skill Development Boards'; NSDC claims in the repo relate to the college N-STEP programme, not to schools.
- assets/images/logo_govt.png (957x1024): A blue-gradient line icon (handshake, bank building in a network, A-to-B route) with the caption 'GOVERNMENT INITIATIVES' and a black Alamy strip at the bottom showing the 'alamy' mark, image ID 2PH9HKE and www.alamy.com. Used on index.html:1116. | concerns: Unlicensed watermarked stock preview (Alamy watermark and image ID baked in); not a real organisation's logo; baked-in text.
- assets/images/logo_telangana_state.png (148x148): The Government of Telangana state emblem (green and gold circular seal). Used on about.html:938 titled 'Telangana State Board'. | concerns: Official state emblem (restricted use); very low resolution; the repo evidences no approval from the Telangana government or state board.
- assets/images/logo_drdo.png (300x176): DRDO circular emblem (Defence R&D Organisation, Ministry of Defence) on white. Used on index.html:1112 ('DRDO-Aligned') and about.html:946 ('DRDO Research Affiliates'). | concerns: Third-party government logo; low resolution; relationship is only self-described as 'Aligned'/'Affiliates' with no evidence.
- logo.png (512x512): TechM4India brand roundel: 'techm4india' wordmark with a graduation cap on the T and a red star swoosh, 'Innovations Pvt Ltd', and the tagline 'INNOVATE. LEARN. BUILD. LEAD.' inside a purple-to-red ring. Used as nav logo on every page. | concerns: Raster only at 512px; baked-in text becomes illegible at nav size; the tagline exists only inside the image, not as text in any file.
- assets/images/about_carousel_1.jpeg (1600x1066): A man in a white shirt with a headset microphone presenting beside a projector screen in a computer lab; wall notices read 'UNIVERSITY SCHOOL OF ENGINEERING' and 'IT Lab II'; the projected screen shows a Tor/DuckDuckGo donation page. | concerns: Identifiable adult (consent); third-party university signage; unrelated website visible on screen; college setting, so it would misrepresent school work.
- assets/images/about_carousel_2.jpeg (1600x1066): A crowded lecture hall of college-age students, many wearing Anurag University lanyards ('Inspiring Tomorrows'), most looking down at phones or notes. | concerns: Many identifiable individuals; third-party branded lanyards; audience looks disengaged; not school students.
- assets/images/about_carousel_3.jpeg (1066x1600): Portrait shot of a young man in black speaking at a wooden lectern with a sticker-covered laptop (MLH sticker), projector screen showing a text list 'html 5, corecomponents, tags, elements, attributes, tables, lists, features'. | concerns: Identifiable adult; college setting; third-party stickers; spelling error visible on screen.
- assets/images/about_carousel_4.jpeg (1600x1066): Three men talking in a corridor (two wearing Anurag University lanyards) in front of a wall mural with the words 'Experiment' and 'ACT'; backpacks on racks behind them. | concerns: Identifiable adults; third-party university branding; no school context. assets/images/about_carousel_5.jpeg is a byte-identical duplicate of this file (same MD5).
- assets/images/about_carousel_6.jpeg (1600x1066): Wide shot from the back of a classroom: a speaker at a lectern, projector screen with an 'html' topic list, about 25 college students seated facing the screen. | concerns: College students, not K-12; faces mostly turned away (lower consent risk); wall clock carries Anurag branding.
- assets/images/about_carousel_7.jpeg (1600x1066): A speaker in a black shirt holding a microphone in a computer lab; four wall posters headed 'ANURAG UNIVERSITY – Department of Information Technology' (Vision, PEOs, POs, PSOs); a scatter-plot with regression line on the projector. | concerns: Identifiable adult; prominent third-party university branding; not a school.
- assets/images/about_carousel_8.jpeg (1600x1066): A presenter in a white shirt (seen from behind/side, smiling) addressing smiling college students seated behind rows of Dell monitors in a bright modern lab. | concerns: Identifiable students; Dell logos; college setting, so not for the schools page.
- assets/images/about_carousel_9.jpeg (1066x1600): Portrait shot of the white-shirted presenter at the front of a computer lab; projected slide titled 'AGENDA' for a cyber-security session carrying a Government of Telangana emblem and the words 'EDUCATION / EMPLOYABILITY'. | concerns: Identifiable adult; government emblem visible on slide; foreground blocked by monitors and heads; college setting.
- assets/images/client_product_lms.png (1024x1024 (JPEG data despite .png extension)): Dark-theme LMS dashboard mock-up branded 'EDUSYNC' ('Welcome back, Sarah Jenkins!', course progress, learning paths, grades overview). Used on the Solutions page, not as SchoolOS. | concerns: AI-generated-looking mock-up with a different product name and fictional US user; baked-in text; would be misleading as a product screenshot.
- assets/images/client_product_erp.png (1024x1024 (JPEG data despite .png extension)): Light-theme 'Global ChainLink ERP Dashboard' mock-up (inventory, warehouses, procurement tracker). Used on the Solutions page; unrelated to schools. | concerns: AI-generated-looking mock-up of a supply-chain ERP; not a school ERP; baked-in text.
