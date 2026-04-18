export type Persona = {
  id: number;
  name: string;
  role: string;
  initials: string;
  gradeBand: 'K–5' | '6–8' | '9–12';
  relationshipStatus: 'Legacy' | 'Active' | 'Preparing' | 'Prospective' | 'Churned';
  motivationSpectrum: 'Early adopter' | 'Voluntold' | 'Middle';
  motivationScore: number;
  background: string;
  excited: string;
  nervous: string;
  feelLike: string;
  successLooks: string;
  failureLooks: string;
  channelsWithinControl: string[];
  channelsOutsideControl: string[];
  journey: {
    preLaunch: { moments: string[] };
    launch: { moments: string[] };
    summer: { moments: string[] };
    backToSchool: { moments: string[] };
  };
};

export const personas: Persona[] = [
  {
    id: 1,
    name: 'Claudette Osei-Bonsu',
    role: 'Library Media Specialist',
    initials: 'CO',
    gradeBand: 'K–5',
    relationshipStatus: 'Legacy',
    motivationSpectrum: 'Early adopter',
    motivationScore: 90,
    background:
      'Claudette has been a library media specialist at a Title I elementary school in suburban Atlanta for 16 years. She discovered Code.org in 2013, nearly the moment it launched, and immediately saw it as a vehicle to give her students — mostly Black and Latine kids whose parents work in distribution and logistics — a seat at a table that was never built for them. She was flown to a Code.org educator summit in 2015, received a stipend, and trained eleven colleagues in her district the following year. She still talks about that summit as one of the most professionally validating experiences of her career. She runs Hour of Code every December like a school holiday, decorates the library, and sends personal invitations to every classroom. She is not a classroom teacher and has no formal CS credential, but she is the closest thing her school has to a CS champion.',
    excited:
      'Claudette is genuinely excited that AI is finally being named as part of the mission. She has been watching her fifth-graders interact with AI tools without any scaffolding or context and has felt frustrated that she did not have curriculum to match the moment. She sees the rebrand as Code.org finally catching up to what the kids are already living.',
    nervous:
      'She is nervous that the rebrand will erase or minimize the CS-first identity she has spent years defending to skeptical principals and parents. She built credibility on the argument that CS is foundational and serious — not a fad. She worries AI framing will make the work feel trendy rather than rigorous, and she fears losing the institutional relationship she remembers from the early days.',
    feelLike:
      'Claudette feels like a founding member of a band who just found out the band is changing its name and sound. She believes in the direction but wishes someone had called her first.',
    successLooks:
      'Success looks like receiving a personal communication from Code.org before the public announcement — something that acknowledges her history and invites her into the transition, not just informs her of it. She wants to be a voice in her district for why the rebrand makes sense, and she needs the language and confidence to do that.',
    failureLooks:
      'Failure looks like showing up to the Code.org site one morning to pull a lesson plan and finding a logo she does not recognize, with no explanation in her inbox. She feels replaced rather than included, starts fielding confused questions from colleagues she trained, and gradually stops recommending Code.org to new teachers.',
    channelsWithinControl: [
      'School library newsletter',
      'Personal email to teachers she trained',
      'Hour of Code event planning and promotion',
      'One-on-one conversations with her principal',
    ],
    channelsOutsideControl: [
      'District curriculum adoption decisions',
      'Whether Code.org sends advance communication to legacy teachers',
      'How the rebrand is covered in education media',
      'State CS funding and policy priorities',
    ],
    journey: {
      preLaunch: {
        moments: [
          'Notices Code.org social accounts posting differently — more AI language, less pure CS framing — and feels a low-grade unease she cannot name yet.',
          'Gets an email from a newer teacher she trained asking "is Code.org changing?" — she does not have an answer and feels embarrassed.',
          'Starts quietly preparing her Hour of Code plans for next December and wonders whether the branding will be different by then.',
        ],
      },
      launch: {
        moments: [
          'Sees the rebrand announcement and feels a wave of mixed emotions — pride that the mission is growing, grief that no one looped her in beforehand.',
          'Reads the announcement carefully looking for language about the original CS mission and CS teachers who have been there from the start.',
          'Shares the announcement on her personal Facebook with a measured caption — she is not going to be the person who publicly complains, but she is watching closely.',
        ],
      },
      summer: {
        moments: [
          'Attends a regional facilitated workshop she signed up for months ago and finds facilitators are not fully prepared to address her questions about what changed and why.',
          'Has a long conversation with another legacy teacher she met at the 2015 summit — they process the rebrand together and land in cautious optimism.',
          'Updates her library bulletin board to reflect AI + CS framing, but keeps the original Hour of Code posters alongside it as a statement.',
        ],
      },
      backToSchool: {
        moments: [
          'Introduces the AI + CS framing to her school faculty at a back-to-school PD session — it lands better than she expected because several teachers have been asking about AI all summer.',
          'Submits a proposal to present at her district\'s fall tech conference about how AI + CS is different from the AI hype circulating in ed-tech.',
          'Sends an email to Code.org\'s teacher contact list asking whether there is still a community space for legacy educators — she gets a form response and feels the distance.',
        ],
      },
    },
  },
  {
    id: 2,
    name: 'Marcus Thibodeau',
    role: '7th Grade Technology Teacher',
    initials: 'MT',
    gradeBand: '6–8',
    relationshipStatus: 'Active',
    motivationSpectrum: 'Voluntold',
    motivationScore: 25,
    background:
      'Marcus taught middle school social studies for eight years in a mid-size district in rural Louisiana before his principal asked him — with four weeks of summer left — to take over the technology elective when the previous teacher retired suddenly. He had no CS background, no technology credential, and no particular interest in the subject. He said yes because he needed the position and his principal assured him "the curriculum practically teaches itself." He found Code.org through a Google search the week before school started. He is now in his second year teaching CS Discoveries units 1 and 2 to 7th graders who rotate through his class on an eight-week elective cycle. He has started to find moments he genuinely enjoys — especially when a kid who struggles in other classes suddenly becomes the expert in his room — but he still wakes up some mornings dreading the day.',
    excited:
      'Marcus is not especially excited about the rebrand. He is cautiously interested in AI curriculum because he suspects his students will engage with it more than some of the foundational CS units, which have felt abstract to some kids.',
    nervous:
      'He is nervous that AI content will require more of him technically than he currently has. He barely feels competent with what he is teaching now. The idea of adding AI — a subject he does not understand well personally — feels like being handed a harder book in a language he is still learning.',
    feelLike:
      'Marcus feels like a substitute teacher who was accidentally left in charge of the classroom permanently. The rebrand is another reminder that the subject is moving faster than he is.',
    successLooks:
      'Success looks like the platform looking and working exactly the same on the day he shows up to class after the rebrand. No surprises, no broken links, no students asking why the logo changed. A short, plain-language email in his inbox before launch telling him what changed and what did not, with specific reassurance that CS Discoveries units he is mid-way through are unaffected.',
    failureLooks:
      'Failure looks like opening the platform in front of 28 seventh-graders and finding something visually different — a new logo, a different name on the screen — and having no idea what happened or what to say. He loses credibility in the room and decides privately that he is going to find a different curriculum solution next year. Or just show YouTube videos.',
    channelsWithinControl: [
      'Lesson prep choices and pacing decisions',
      'What he tells students about the tools they are using',
      'Whether he re-enrolls in Code.org PD next summer',
    ],
    channelsOutsideControl: [
      'Whether Code.org notifies him before the rebrand goes live on the platform he uses daily',
      'Whether his principal continues to support the technology elective or restructures the schedule',
      'State-level CS mandate changes that could affect whether his course is required or optional',
      'Whether a trained CS teacher gets hired at his school, making him redundant',
    ],
    journey: {
      preLaunch: {
        moments: [
          'Does not notice any signals that a rebrand is coming — he is not following Code.org on social media and barely reads the emails.',
          'Finishes unit 2 of CS Discoveries in April and breathes a sigh of relief that the year is almost over.',
          'Gets an automated reminder about summer professional development he registered for and considers canceling it to use the time for something else.',
        ],
      },
      launch: {
        moments: [
          'Opens the Code.org platform the morning of the rebrand launch to pull up the day\'s activity. Sees a new logo and a different name at the top of the screen.',
          'A student immediately asks, "Mr. T, why does it say something different?" He says he is not sure and deflects.',
          'Checks his email during lunch and finds the announcement — reads it quickly, understands that the curriculum is not changing, and exhales. But feels annoyed he was not told sooner.',
        ],
      },
      summer: {
        moments: [
          'Attends the summer workshop he almost canceled. The facilitator addresses the rebrand in the first hour, which helps significantly.',
          'Discovers an introductory AI module and runs it as a simulation with the workshop group. For the first time, he thinks: "I could actually teach this."',
          'Updates his course syllabus to include a note about AI + CS framing for parents — borrows language directly from the Code.org rebrand page.',
        ],
      },
      backToSchool: {
        moments: [
          'Introduces the course on day one using the new AI + CS framing. Several students light up at the word "AI" in a way they did not when he said "computer science" last year.',
          'Has a moment in week three where a student who rarely participates builds a functioning project and explains it to the class. Marcus takes a photo and sends it to his principal.',
          'Quietly decides he is going to stick with it for at least one more year.',
        ],
      },
    },
  },
  {
    id: 3,
    name: 'Priya Subramaniam',
    role: 'AP Computer Science A Teacher',
    initials: 'PS',
    gradeBand: '9–12',
    relationshipStatus: 'Churned',
    motivationSpectrum: 'Early adopter',
    motivationScore: 78,
    background:
      'Priya has a computer science degree from UC Davis and has been teaching AP CS A and AP CS Principles at a large public high school in the San Jose Unified School District for nine years. She used Code.org heavily in her first three years — primarily as supplemental material for her CS Principles students and as a bridge for students who came in with very little experience. She stopped relying on it around year four when she felt the curriculum was not keeping pace with what she wanted to teach and when she found other resources (particularly from MIT OpenCourseWare and her own materials) that felt more rigorous for her context. She still recommends Code.org to colleagues at middle schools who are just getting started, but she has not logged into the platform herself in about two years. She follows CS education conversations closely on LinkedIn and through the CSTA network.',
    excited:
      'Priya is genuinely excited about the AI + CS direction in concept. She thinks it is the right pedagogical call and has been frustrated for years watching AI treated as a separate, magical thing rather than something grounded in computation and data structures. If Code.org can make that argument clearly and back it with rigorous curriculum, she is interested.',
    nervous:
      'She is skeptical that Code.org will execute the AI curriculum with enough depth for high school students who are on an AP track. She has seen too many ed-tech platforms chase the AI trend with surface-level content that impresses administrators but does not actually teach anything. She does not want to get excited and then feel let down again.',
    feelLike:
      'Priya feels like an alumni who got a newsletter from her old school announcing a major renovation — genuinely curious about what it will look like when it is done, but not ready to re-enroll until she sees the results.',
    successLooks:
      'Success looks like Code.org reaching out to her specifically — or to the CSTA community she is active in — with a preview of the AI + CS curriculum that demonstrates real rigor: computational thinking, not just ethical discussion. She reviews it, shares it with two colleagues, and starts piloting a unit with her CS Principles students in the spring.',
    failureLooks:
      'Failure looks like the rebrand generating buzz she finds shallow — a new logo and an "AI is the future" press release with no substantive curriculum to back it. She rolls her eyes at a CSTA thread about it, posts a cautionary note about waiting to see the actual content, and remains comfortably in her current approach.',
    channelsWithinControl: [
      'CSTA chapter participation and peer conversations',
      'Curriculum choices for her own classroom',
      'How she talks about Code.org to newer teachers who ask for recommendations',
      'LinkedIn presence and professional network',
    ],
    channelsOutsideControl: [
      'Whether Code.org\'s AI curriculum meets the rigor bar she needs for AP students',
      'Whether Code.org proactively reaches out to churned teachers through channels she actually uses',
      'College Board AP curriculum alignment decisions',
      'District decisions about AP CS course offerings and class sizes',
    ],
    journey: {
      preLaunch: {
        moments: [
          'Sees an uptick in Code.org references in a CSTA Slack channel she monitors — files it as "something is happening over there."',
          'A colleague in her department who is newer to CS asks her opinion of Code.org. She gives a measured answer: "Good for beginners, not quite right for AP, but worth watching."',
          'Does not receive any direct communication from Code.org — she has not logged in long enough that her contact information may be stale.',
        ],
      },
      launch: {
        moments: [
          'Reads the rebrand announcement via a LinkedIn share from someone in her CSTA network.',
          'Clicks through to the site, scans for curriculum detail, and finds the landing page strong on vision but thin on substance. Makes a note to check back in a few months.',
          'Posts a measured LinkedIn comment: "Encouraging direction. The real question is what the curriculum looks like. Will be watching."',
        ],
      },
      summer: {
        moments: [
          'Attends CSTA annual conference and hears Code.org mentioned in two sessions. Picks up a handout at a booth but does not stop to talk.',
          'Finds a preview of new AI curriculum units shared in a CSTA newsletter and reads through the learning objectives carefully.',
          'Emails a colleague: "This is more substantive than I expected. I might pilot one unit in the fall."',
        ],
      },
      backToSchool: {
        moments: [
          'Pilots a single AI + CS unit with her CS Principles sections — frames it as an experiment and tells students the curriculum is new.',
          'Students respond well, especially to a data bias activity that sparks a 20-minute debate she did not anticipate.',
          'Logs back into Code.org for the first time in two years to access the teacher materials. Notices the new branding, thinks "okay, this looks serious," and bookmarks the teacher dashboard.',
        ],
      },
    },
  },
  {
    id: 4,
    name: 'DeShawn Lattimore',
    role: '4th and 5th Grade STEM Teacher',
    initials: 'DL',
    gradeBand: 'K–5',
    relationshipStatus: 'Preparing',
    motivationSpectrum: 'Middle',
    motivationScore: 55,
    background:
      'DeShawn is a STEM specialist at an elementary school in Memphis, Tennessee, in his third year of the role. He previously taught fourth grade for five years before transitioning to a pull-out STEM class that serves grades 3 through 5 in 45-minute weekly sessions. He heard about Code.org at a district STEM coordinator meeting in March, where a colleague showed a few slides about the curriculum and said it was free and self-paced. DeShawn went home that night, made a Code.org account, clicked around for about twenty minutes, and registered for a summer professional development workshop. He has not been back to the site since. He is generally enthusiastic about the subject matter — he thinks coding is going to matter for his students — but he is also managing a full STEM curriculum across three grade levels and honestly forgot he registered until a calendar reminder popped up last week.',
    excited:
      'DeShawn is excited in an abstract way — he believes in the mission and thinks his kids deserve access to CS. He is particularly excited about having a structured curriculum he does not have to build himself, which is currently a significant pain point.',
    nervous:
      'He is nervous about competence — he is not a programmer and has never taught CS formally. He is also low-key worried that by the time summer PD arrives, the thing he registered for will look different than what he saw in March, and he will not know if he is in the right place.',
    feelLike:
      'DeShawn feels like someone who signed up for a 5K six months ago and is now a week out from race day wondering if he ever actually trained enough.',
    successLooks:
      'Success looks like receiving a clear, friendly email before summer that confirms his registration, tells him what to expect, and mentions the rebrand plainly: "You may notice we have a new name and logo — here is what that means for your workshop and your classroom." He shows up to PD feeling like he is in the right place.',
    failureLooks:
      'Failure looks like arriving at the summer workshop link and finding a page that looks different enough from what he remembers that he spends ten minutes wondering if he registered for the wrong thing. He texts a colleague, gets no clear answer, and decides he will just figure out CS on his own next year — maybe use Scratch.',
    channelsWithinControl: [
      'Whether he actually attends the summer PD',
      'How much prep time he puts in before the workshop',
      'What he shares with his STEM coordinator about his plans for next year',
    ],
    channelsOutsideControl: [
      'Whether Code.org sends him advance communication about the rebrand before he shows up to PD',
      'Whether the summer workshop facilitator is prepared to address his beginner-level questions',
      'District STEM budget decisions that affect whether he has planning time to implement',
      'School schedule changes that could affect his weekly STEM pull-out block',
    ],
    journey: {
      preLaunch: {
        moments: [
          'Calendar reminder fires for his summer PD registration. He re-reads the confirmation email and thinks "okay, this is still happening."',
          'Mentions to a colleague that he is going to a Code.org workshop this summer — colleague has heard of it and says positive things, which boosts his confidence slightly.',
          'Does not revisit the Code.org site before launch — too busy wrapping up the school year.',
        ],
      },
      launch: {
        moments: [
          'Does not see the rebrand announcement in real time. School is still in session and he is managing end-of-year assessments.',
          'Clicks a Code.org link from his old confirmation email two weeks after the launch and notices the logo is different. Assumes he clicked the wrong link, clicks it again, and decides it must be fine.',
          'Never receives a proactive communication about the rebrand — his email from registration may have an error or gone to spam.',
        ],
      },
      summer: {
        moments: [
          'Shows up to the summer workshop in person. Facilitator opens with a five-minute explanation of the rebrand and the new name — DeShawn exhales and thinks "okay, this is exactly what I signed up for."',
          'Finds the workshop more practical and less intimidating than he expected. The unplugged activities in particular feel immediately usable in his STEM class.',
          'Takes photos of three activity setups to share with his STEM coordinator when school starts.',
        ],
      },
      backToSchool: {
        moments: [
          'Introduces his first CS unit in October — later than planned because September was swallowed by school startup logistics.',
          'A fifth-grade student explains a debugging concept to a classmate unprompted. DeShawn sends the story to his principal in a Friday email.',
          'Registers for next year\'s Code.org PD before Thanksgiving — this time without waiting for a reminder.',
        ],
      },
    },
  },
  {
    id: 5,
    name: 'Ingrid Halvorsen',
    role: 'Instructional Technology Coach',
    initials: 'IH',
    gradeBand: '6–8',
    relationshipStatus: 'Prospective',
    motivationSpectrum: 'Early adopter',
    motivationScore: 82,
    background:
      'Ingrid is an instructional technology coach serving three middle schools in a mid-size district in Minneapolis. She came up as a 7th and 8th grade science teacher, transitioned to a tech coaching role four years ago, and spends her days running professional development for teachers, troubleshooting tools, and trying to help her district figure out what to do about AI now that every teacher and parent has an opinion about it. She has heard Code.org mentioned at two separate state-level EdTech conferences in the past year and has had it on her "look into this" list for months. She has not yet made an account. Her district is actively looking for a CS curriculum solution for middle school — currently there is no coherent approach — and her superintendent asked her to put together a recommendation by the end of October. The rebrand campaign and associated press coverage are what finally push her to engage.',
    excited:
      'Ingrid is excited about finding a solution that is free, curriculum-complete, and backed by a credible organization. She is particularly drawn to AI + CS framing because it maps directly to the conversation she is already having with her superintendent about preparing students for an AI-shaped world.',
    nervous:
      'She is nervous about making a recommendation that falls flat. She has advocated for tools before that were not sustained, and she is protective of her credibility with both teachers and administrators. She needs to trust that Code.org will still be here and well-supported in two years, and that the AI pivot is not a funding chase.',
    feelLike:
      'Ingrid feels like a buyer at a farmers market who has walked past the same booth several times and is finally stopping to try a sample — interested but evaluating carefully before she commits.',
    successLooks:
      'Success looks like a clear, professional entry point from the rebrand campaign that speaks directly to instructional coaches and curriculum decision-makers — not just individual teachers. She creates an account, explores the middle school curriculum, and walks away with enough confidence to build a one-page recommendation for her superintendent.',
    failureLooks:
      'Failure looks like arriving at the site and finding it designed entirely for the individual teacher with no clear pathway for someone making a district-level recommendation. She spends twenty minutes clicking around, cannot quickly find answers to the questions her superintendent will ask (How is it sequenced? What is the teacher support model? How does it address AI?), and puts it back on her list for later — where it sits until October and she recommends something else instead.',
    channelsWithinControl: [
      'The recommendation she brings to her superintendent',
      'The PD sessions she runs for her district\'s middle school teachers',
      'Which tools she actively champions versus passively mentions',
      'Connections to other instructional coaches in the state EdTech network',
    ],
    channelsOutsideControl: [
      'Whether Code.org\'s landing experience is designed to serve her decision-making role',
      'Superintendent priorities and timeline for the curriculum decision',
      'Budget availability for any associated PD costs',
      'Whether the teachers she supports buy into the curriculum once she recommends it',
    ],
    journey: {
      preLaunch: {
        moments: [
          'Sees a conference session abstract mentioning Code.org\'s forthcoming rebrand and AI curriculum direction. Adds it to her notes.',
          'Gets a question from a 7th grade science teacher asking about AI tools for the classroom — thinks "I need to actually figure out what Code.org is doing."',
          'Saves a Code.org URL to her browser bookmarks but does not visit it yet.',
        ],
      },
      launch: {
        moments: [
          'Sees a press article about the rebrand shared in an ed-tech LinkedIn group she follows. Clicks through immediately.',
          'Spends 35 minutes on the site — the longest she has spent on an ed-tech platform in months. Creates a free account before closing the tab.',
          'Screenshots the AI + CS positioning language and drops it into a Slack message to her superintendent: "This might be what we\'ve been looking for."',
        ],
      },
      summer: {
        moments: [
          'Attends a regional ed-tech unconference where a Code.org facilitator runs a short session. Introduces herself afterward and asks about district-level onboarding.',
          'Spends three days in July mapping CS Discoveries units against her district\'s 6th, 7th, and 8th grade scope and sequences.',
          'Drafts a two-page curriculum recommendation document for her superintendent to review in August.',
        ],
      },
      backToSchool: {
        moments: [
          'Presents the recommendation to her superintendent and curriculum director in a September meeting. Gets provisional approval to pilot in two schools.',
          'Runs a half-day intro workshop for eight middle school teachers in October — borrows structure directly from Code.org\'s facilitator materials.',
          'Sends a follow-up email to the Code.org facilitator she met over the summer: "We\'re officially piloting. What\'s the best way to stay connected to what\'s coming next?"',
        ],
      },
    },
  },
  {
    id: 6,
    name: 'Tomás Reyes-Gallardo',
    role: 'CS Principles and Web Design Teacher',
    initials: 'TR',
    gradeBand: '9–12',
    relationshipStatus: 'Active',
    motivationSpectrum: 'Voluntold',
    motivationScore: 35,
    background:
      'Tomás has been teaching at a comprehensive high school in Albuquerque, New Mexico for eleven years — originally math, then math and web design, and now math, web design, and CS Principles after his district became subject to a state CS graduation requirement two years ago. He was handed the CS Principles course because he was already teaching web design and his department head said "you\'re basically already doing this." He started using Code.org\'s CS Principles curriculum that first semester out of necessity and has been using it since, though he supplements heavily with his own web design expertise in the units where he feels competent. He is the only CS teacher in his building. He has no formal CS credential and is working toward one through an online program his district is subsidizing — slowly, because he is also coaching JV soccer and raising two elementary-age kids. He is not a Code.org evangelist, but he is not looking for a replacement either. It works well enough, it is free, and he does not have the bandwidth to start over.',
    excited:
      'Tomás is cautiously interested in any AI curriculum that does not require him to become an AI expert before he can teach it. His students are using AI constantly — he sees it in their work — and he has no scaffolded way to address it. If Code.org hands him something ready to use, he will use it.',
    nervous:
      'He is most nervous about in-class surprises during the rebrand transition. He cannot afford to lose credibility in a room full of high schoolers who already have more comfort with some of this content than he does. He is also nervous about workload — any "new" thing right now, even a positive one, represents time he does not have.',
    feelLike:
      'Tomás feels like a contractor who was hired for one job and keeps getting handed adjacent projects without a corresponding reduction in the original scope. He is doing his best but is acutely aware that he is building the plane while flying it.',
    successLooks:
      'Success looks like the rebrand being entirely invisible to him on the day it happens — no disruption to his live platform, a brief and clear email a week before that explains what is changing and what is not, and new AI curriculum units that are drop-in ready, not reconstruction projects. He can teach the same course he planned and quietly incorporate one new AI unit by November.',
    failureLooks:
      'Failure looks like students noticing the rebrand before he does, asking questions he cannot answer, and him spending twenty minutes of class time troubleshooting confusion instead of teaching. He files a mental complaint, decides to skip the new AI units this year because he does not have time to vet them, and starts keeping an eye out for alternatives for next school year.',
    channelsWithinControl: [
      'Which Code.org units he chooses to teach and in what order',
      'How he integrates his web design expertise with Code.org curriculum',
      'Communication with his department head about course plans',
      'Whether he continues pursuing his CS credential',
    ],
    channelsOutsideControl: [
      'Whether Code.org notifies him before the rebrand affects the live platform he uses daily',
      'State CS graduation requirement changes that could expand or contract his course load',
      'Whether his district hires a second CS teacher, reducing his isolation',
      'How quickly new AI curriculum units are published and how vetted they are before release',
    ],
    journey: {
      preLaunch: {
        moments: [
          'Notices Code.org emails in his inbox have been arriving more frequently than usual. Opens one, skims it, closes it. Files it under "read later."',
          'A student brings up an AI tool during a web design critique — Tomás redirects but thinks afterward that he needs something structured to address AI in his class.',
          'His department head asks in passing if he has heard anything about Code.org changing. He has not.',
        ],
      },
      launch: {
        moments: [
          'Pulls up the Code.org platform at 7:48am before first period to double-check a lesson link. Sees the new logo and name. Feels his stomach drop slightly.',
          'Checks his email — finds the announcement sent the day before, which he missed because it arrived during parent-teacher conferences.',
          'First period student asks: "Mr. Reyes, is this a different website?" He says calmly, "Same company, new name — the curriculum is the same," and moves on. Inside he is annoyed at the timing.',
        ],
      },
      summer: {
        moments: [
          'Does not attend summer PD — soccer coaching schedule overlaps with the available workshop dates.',
          'Spends an afternoon in July reviewing the new AI + CS unit previews available on the teacher dashboard. Sets a bookmark on two activities that look immediately usable.',
          'Texts a math teacher friend who also got assigned CS: "Have you looked at the new Code.org AI stuff? Might be worth checking out before August."',
        ],
      },
      backToSchool: {
        moments: [
          'Runs the first AI + CS activity in week six of the semester — a lesson about how algorithms shape content feeds. Students are more engaged than they have been all year.',
          'A student stays after class to ask if they can do an independent project on AI bias. Tomás says yes and immediately starts looking for resources to support it.',
          'Mentions to his department head at a check-in that Code.org has new AI content that is working well. Department head asks him to present it at a February faculty meeting.',
        ],
      },
    },
  },
];