// One-time content loader for the "BVLOS Operations Fundamentals" course.
// Run once from the Railway console: node scripts/seed-bvlos-fundamentals.cjs
// Safe to re-run: it replaces this course's modules/lessons/quizzes each time,
// so re-running just refreshes the content instead of duplicating it.

const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bvlos.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const uuid = () => crypto.randomUUID();
const COURSE_SLUG = "fundamentos-bvlos";

function q(question, options, correctIndex) {
  return {
    question,
    options: options.map((text, i) => ({ text, correct: i === correctIndex })),
  };
}

// ---------------------------------------------------------------------------
// 1. Course-level content
// ---------------------------------------------------------------------------
const courseData = {
  title: "BVLOS Operations Fundamentals",
  subtitle: "The regulatory and operational foundation for flying beyond visual line of sight.",
  description:
    "A complete foundation course covering the global BVLOS regulatory landscape, airspace and chart reading, core risk-management concepts (GRC, ARC, SORA/SMS), Concept of Operations (ConOps) design, and contingency planning. Built for remote pilots, operations managers, and SMS teams starting their path toward BVLOS, and current through the July 2026 regulatory picture in the US, EU/EASA, and UK.",
  learningOutcomes: [
    "Explain BVLOS terminology and how it differs from VLOS and EVLOS",
    "Describe the current regulatory pathways in the US (Part 107 waivers and the proposed Part 108), EASA (Specific category, SORA 2.5), and the UK",
    "Read airspace classifications and aeronautical charts relevant to a BVLOS mission",
    "Explain Ground Risk Class (GRC), Air Risk Class (ARC), and how they combine into a SAIL",
    "Draft the core sections of a Concept of Operations (ConOps)",
    "Identify the main components of contingency planning for lost link, GNSS degradation, and flyaway events",
  ].join("\n"),
  level: "foundation",
  category: "bvlos",
};

// ---------------------------------------------------------------------------
// 2. Modules
// ---------------------------------------------------------------------------

const modulesData = [
  {
    title: "Module 1 — Foundations of BVLOS",
    lessons: [
      {
        title: "What BVLOS Means, and Why It's Different",
        duration: 12,
        content: `## Beyond Visual Line of Sight

BVLOS stands for **Beyond Visual Line of Sight** — operating an uncrewed aircraft outside the range where the remote pilot or a visual observer can see it with the unaided eye. This is the single biggest technical and regulatory step up from standard drone operations.

Three related terms you'll see constantly:

- **VLOS (Visual Line of Sight):** the pilot or observer maintains unaided visual contact with the aircraft at all times. This is the default, least-restrictive category almost everywhere.
- **EVLOS (Extended Visual Line of Sight):** one or more observers relay position and traffic information to the pilot, extending the effective range without technically going BVLOS. Often used as a stepping stone toward full BVLOS authorization.
- **BVLOS:** no continuous unaided visual contact. The aircraft, its command-and-control (C2) link, and its detect-and-avoid capability now carry the safety case that a human's eyes used to carry.

## Why the Bar Is Higher

In VLOS operations, the pilot's own eyes are the primary "detect and avoid" system for other aircraft, terrain, and hazards. Remove that, and every function the eyes used to serve — seeing traffic, judging distance, spotting a fault light, reacting to a bird strike — has to be replaced by a combination of technology (detect-and-avoid sensors, reliable C2 links, geofencing) and procedure (approved operating areas, coordination with air traffic services, trained crew roles).

This is why BVLOS is regulated as its own category almost everywhere in the world, rather than being treated as "VLOS, but the drone flies further."`,
      },
      {
        title: "Core Vocabulary Every BVLOS Crew Should Know",
        duration: 15,
        content: `## A Shared Vocabulary

Every BVLOS program runs on the same core vocabulary. Getting comfortable with these terms now will make every later module easier.

- **RPIC (Remote Pilot in Command):** the person with final authority and responsibility for the flight.
- **C2 Link (Command and Control Link):** the communication link between the ground control station and the aircraft, carrying commands up and telemetry down. Its reliability is one of the central design questions in any BVLOS ConOps.
- **DAA (Detect and Avoid):** the combination of sensors, software, and procedures that lets an uncrewed aircraft identify and avoid other traffic without a human directly looking outside.
- **Remote ID:** a system that broadcasts an aircraft's identity and location in real time, roughly equivalent to a digital license plate, and increasingly a baseline requirement worldwide.
- **UTM (UAS Traffic Management):** the broader digital ecosystem — separate from traditional air traffic control — that many BVLOS frameworks expect operators to integrate with as operations scale.
- **ConOps (Concept of Operations):** the foundational document describing what you're going to do, where, how, and with what mitigations. Nearly every regulatory pathway in this course starts from a ConOps.
- **Contingency Volume:** the buffer of airspace around your planned operational volume, reserved for the aircraft to safely respond to abnormal situations before reaching a true emergency.

You'll meet each of these again in more depth in later modules — this lesson is your reference point to come back to.`,
      },
      {
        title: "The US Pathway: Part 107 Waivers and the Proposed Part 108",
        duration: 18,
        content: `## Where BVLOS Stands in the United States

As of mid-2026, there is still no dedicated, standalone BVLOS rule in force in the United States. Today's legal pathway remains a **Part 107 waiver**: an operator has to petition the FAA for a case-by-case exemption from the visual-line-of-sight requirement, supported by a safety case specific to that operation.

That is expected to change. In August 2025 the FAA published a Notice of Proposed Rulemaking for a new **Part 108**, designed to replace the waiver-by-waiver approach with a standardized, scalable framework. The proposal's key features, as published, include:

- Two levels of approval: **Permitted Operations** and an **Operational Certificate**, depending on the complexity and risk of what you're doing.
- **Five population-density-based risk categories** in place of a single blanket standard.
- **Area-based approvals** intended to replace repeated single-flight waivers for repetitive operations.
- New designated roles, including an **Operations Supervisor** and a **Flight Coordinator**.
- Baseline technical expectations for detect-and-avoid, Remote ID, continuous position tracking, and integration with UTM systems.

As of this writing, Part 108 has not been finalized — it went to the White House's Office of Information and Regulatory Affairs for final review in July 2026, the last formal step before a rule can be published. Timelines for federal rulemaking routinely slip, so treat any specific finalization date you read elsewhere as provisional until you see it in the Federal Register.

**What this means for you today:** if you're operating BVLOS in the US right now, you are doing so under a Part 107 waiver, a Part 135 certificate, or another existing authority — not under Part 108, because it doesn't exist yet as enforceable law. Build your ConOps and safety case around the waiver process you actually have access to today, and treat Part 108 as the direction the ground is moving under your feet.`,
      },
      {
        title: "The EASA Pathway: Specific Category and SORA 2.5",
        duration: 18,
        content: `## Where BVLOS Stands in the European Union

The European Union took a different path than the US, and got there faster. Under EASA's regulatory structure, most BVLOS work falls into the **Specific category** — operations that are riskier than the lightly-regulated "Open" category but don't yet require full aircraft certification.

To operate in the Specific category, an applicant submits a risk assessment using the **SORA (Specific Operations Risk Assessment)** methodology, developed collaboratively through JARUS (the Joint Authorities for Rulemaking on Unmanned Systems) and adopted into EASA's own rules.

The methodology itself has been evolving quickly:

- **SORA 2.0** established the basic shape of the process still in use today: define your ConOps, calculate a Ground Risk Class, calculate an Air Risk Class, combine them into a **SAIL** (Specific Assurance and Integrity Level), and satisfy the corresponding Operational Safety Objectives.
- **SORA 2.5** became mandatory across the EU in March 2026, formalized under EASA ED Decision 2025/018/R. It replaces much of the older version's subjective, qualitative judgment calls with a quantitative, data-driven ground risk model, aimed at making outcomes more consistent from one national authority to another.
- **SORA 3.0** is already in development, focused on overhauling the air risk side of the methodology. There's no confirmed publication date yet.

We'll build up GRC, ARC, and SAIL in detail in Module 3 — for now, the key takeaway is that SORA is a live, versioned methodology, not a document you read once. An assessment built on an old version of SORA can be rejected simply for being out of date, independent of the quality of the underlying analysis.`,
      },
      {
        title: "Beyond the US and EU: A Fast-Moving Global Picture",
        duration: 12,
        content: `## The Rest of the World Isn't Waiting

BVLOS regulation is advancing on multiple fronts simultaneously, and an operator working internationally needs to track more than one framework.

- **United Kingdom:** the UK CAA runs its own SORA-based process, built on the same JARUS methodology as EASA but adapted nationally — including a digital application platform and dedicated BVLOS pathways for specific use cases like urban operations and fully integrated airspace. The CAA's public roadmap targets routine BVLOS operations by 2027 for priority use cases such as NHS medical deliveries, emergency services support, and infrastructure inspection.
- **Canada:** implemented comprehensive BVLOS rules in late 2025, and is frequently cited as a real-world proof point that structured BVLOS operations can run safely at scale.
- **ICAO:** continues to develop high-level international guidance intended to help national authorities harmonize their approaches, though — as with most ICAO material — implementation still happens country by country.

The practical lesson for this course: don't assume the framework you learned first is the only one, and don't assume any framework you learn today will look the same in two years. Build the habit now of checking the current state of the rule before every new project, rather than relying on memory.`,
      },
    ],
    quiz: [
      q("What does BVLOS stand for?", ["Beyond Visual Line of Sight", "Basic Visual Line Operations Standard", "Beyond Vertical Limit of Service", "Basic Visual Line of Sight"], 0),
      q("In VLOS operations, what primarily performs the 'detect and avoid' function?", ["The remote pilot's or observer's own eyes", "A ground radar station", "The aircraft's autopilot alone", "Air traffic control exclusively"], 0),
      q("What is EVLOS?", ["Extended Visual Line of Sight, using observers to relay information", "A synonym for BVLOS", "A certification level for pilots", "A type of detect-and-avoid sensor"], 0),
      q("What does C2 link refer to?", ["The command-and-control link between ground station and aircraft", "A certification category for pilots", "A type of contingency volume", "A ground risk classification"], 0),
      q("What is the primary legal pathway for BVLOS operations in the US as of mid-2026?", ["Part 107 waivers", "Part 108, already in force", "No pathway exists at all", "Only Part 135 air carrier certificates"], 0),
      q("As proposed, what does Part 108 introduce instead of single-flight waivers for repetitive operations?", ["Area-based approvals", "Unlimited automatic approval", "A ban on repetitive operations", "Manual air traffic control clearance every flight"], 0),
      q("What methodology underlies BVLOS risk assessment in the EASA Specific category?", ["SORA (Specific Operations Risk Assessment)", "Part 108", "FAA Order 8900.1", "ICAO Annex 2 exclusively"], 0),
      q("When did SORA 2.5 become mandatory across the EU?", ["March 2026", "2016", "2030", "It has not been adopted yet"], 0),
      q("What does SAIL stand for in the SORA methodology?", ["Specific Assurance and Integrity Level", "Safe Aircraft Inspection Log", "Standard Airspace Integration Level", "System Autonomy Independence Level"], 0),
      q("Which of these is an accurate statement about global BVLOS regulation as of 2026?", ["Multiple countries are advancing different frameworks at different speeds simultaneously", "Every country now uses an identical rulebook", "Only the US has any BVLOS framework", "BVLOS regulations, once published, never change again"], 0),
    ],
  },
  {
    title: "Module 2 — Airspace, Charts, and ATC Coordination",
    lessons: [
      {
        title: "Airspace Classification for UAS Operators",
        duration: 15,
        content: `## Reading the Airspace You Fly In

Airspace is organized into classes that determine what's required to operate there — from air traffic control clearance to simple self-separation. For UAS operators, the classes you'll encounter most often are:

- **Class A:** high-altitude controlled airspace, generally well above where most UAS operations take place.
- **Class B, C, and D:** controlled airspace around busier airports, requiring coordination with air traffic control before entry. Many BVLOS corridor operations near urban areas have to account for one of these.
- **Class E:** controlled airspace that doesn't fit the above categories — often the airspace directly above uncontrolled airports and much of the airspace used for cross-country BVLOS corridors.
- **Class G:** uncontrolled airspace, typically at lower altitudes away from airports. This is where a large share of current BVLOS operations (agricultural monitoring, linear infrastructure inspection) take place, precisely because it minimizes the need for direct ATC coordination.

A BVLOS ConOps should state, explicitly, which classes of airspace the operation will transit, and what procedure applies in each one. "We'll mostly be in Class G" is not a complete answer if any part of the route clips controlled airspace near an airport.`,
      },
      {
        title: "Reading Aeronautical Charts",
        duration: 18,
        content: `## Charts Are a Working Tool, Not Paperwork

An aeronautical chart isn't a reference you check once during planning — it's a working document you should be able to read fluently during a live operation.

Key elements to look for on a VFR sectional chart:

- **Airspace boundaries and their class**, shown with different line styles and colors (solid blue for Class B, dashed blue for Class D, and so on, depending on the chart series).
- **Obstacles and their height**, including towers well above typical UAS ceilings that still matter for approach and departure paths.
- **Special use airspace**, such as Military Operating Areas (MOAs), restricted areas, and prohibited areas — some are always active, others depend on published schedules or NOTAMs.
- **Frequencies**, for the relevant control tower, approach control, or common traffic advisory frequency, which your crew may need even if you're not talking on them directly for a small UAS.

Practice reading a chart for a route you already know well. If you can't quickly answer "what airspace class am I in right now, and what's the nearest controlled airspace boundary," that's a sign to spend more time here before flying BVLOS for real.`,
      },
      {
        title: "NOTAMs and Temporary Restrictions",
        duration: 12,
        content: `## What NOTAMs Are, and Why They Change Daily

A **NOTAM (Notice to Air Missions)** is a time-sensitive notice containing information that isn't yet on published charts but that's essential to flight safety — a temporary tower outage, a firefighting Temporary Flight Restriction (TFR), a crane erected near an approach path, or a special security TFR around a major event.

For BVLOS operations, NOTAMs matter in two directions:

1. **Checking them before you fly.** A route that was clear yesterday can have a new TFR today. This should be a standing pre-flight step, not an occasional one.
2. **Filing them yourself**, where required, so that other airspace users know about your operation. Some BVLOS authorizations come with an explicit condition to publish a NOTAM before each operating window.

Treat "check NOTAMs" as a checklist item with a timestamp, not a general habit — write down when you checked and what you saw, as part of your operational record.`,
      },
      {
        title: "LAANC, UAS Facility Maps, and Digital Authorization",
        duration: 12,
        content: `## Digital Tools for Airspace Authorization

In the US, most controlled-airspace authorization below a certain altitude is handled through **LAANC (Low Altitude Authorization and Notification Capability)**, an automated system that grants near-real-time clearance for eligible operations based on **UAS Facility Maps** — published grids showing the maximum altitude typically pre-approved in each area around an airport.

For BVLOS work specifically, LAANC's automatic approvals often don't cover the full scope of what you need — many BVLOS operations still require manual coordination or a specific waiver condition layered on top. Treat LAANC as one tool in the kit, not a substitute for reading the airspace yourself and understanding what your specific authorization actually permits.

Equivalent digital platforms exist in other jurisdictions — the practical skill that transfers everywhere is the same: know which digital system governs your airspace, and know the difference between "the app said yes" and "my authorization covers this specific flight."`,
      },
      {
        title: "Coordinating with Air Traffic Control",
        duration: 15,
        content: `## When a Human Conversation Still Matters

Even in a world of automated digital authorization, direct coordination with air traffic control remains essential for many BVLOS operations — particularly anything that transits controlled airspace or operates near an active airport.

Good practice for ATC coordination includes:

- **Establishing points of contact before the operating day**, not improvising during a live flight.
- **Briefing your operation in terms ATC understands**: altitude blocks, lateral boundaries, time windows, and what to expect if something goes wrong (a lost-link return-to-home behavior, for instance).
- **Having a clear, rehearsed communication plan** for the crew member responsible for talking to ATC, separate from the person actively flying the aircraft — this separation of duties shows up again as a named role in the proposed Part 108 framework.
- **Debriefing coordination issues** after every operation, and feeding them back into your ConOps and training, not just noting them and moving on.

A BVLOS program that treats ATC coordination as a one-time approval rather than an ongoing relationship tends to accumulate friction over time. The programs that scale well treat it as a standing operational relationship.`,
      },
    ],
    quiz: [
      q("Which airspace class is typically uncontrolled and hosts much current BVLOS activity?", ["Class G", "Class A", "Class B", "Class D"], 0),
      q("What generally requires direct coordination with air traffic control before entry?", ["Class B, C, and D airspace", "Class G airspace only", "No airspace ever requires this", "Only airspace over international waters"], 0),
      q("On a VFR sectional chart, what should you be able to quickly identify?", ["Airspace class boundaries and obstacle heights", "Only road names", "Only city population figures", "Nothing relevant to UAS operations"], 0),
      q("What is a NOTAM?", ["A time-sensitive notice of information affecting flight safety", "A pilot's logbook entry", "A permanent chart symbol", "A type of aircraft registration"], 0),
      q("Why should NOTAM checks be logged with a timestamp?", ["Because conditions can change day to day, and the check needs to reflect the current situation", "Because it is legally required to record the weather", "Because NOTAMs never change once issued", "Timestamps are not useful for this purpose"], 0),
      q("What does LAANC provide in the US?", ["Near-real-time authorization for eligible operations in controlled airspace below certain altitudes", "A replacement for all BVLOS waivers", "A worldwide universal airspace authorization", "A pilot certification exam"], 0),
      q("What are UAS Facility Maps used for?", ["Showing pre-approved maximum altitudes around airports", "Displaying weather radar only", "Listing approved aircraft manufacturers", "Tracking pilot certification status"], 0),
      q("Why might LAANC's automatic approval be insufficient for a BVLOS operation?", ["Many BVLOS operations require additional manual coordination or specific waiver conditions", "LAANC always covers every possible BVLOS scenario", "LAANC is only used outside the United States", "LAANC replaces the need for a ConOps"], 0),
      q("What is good practice for ATC coordination in BVLOS operations?", ["Establishing points of contact and a communication plan before the operating day", "Improvising communication only during the flight", "Avoiding ATC contact whenever legally possible", "Assuming ATC already knows about your flight"], 0),
      q("Why is separating the ATC-communication role from the active-flying role considered good practice?", ["It reduces the risk of divided attention during a live operation", "It has no safety benefit", "It is required only for aircraft over 500 kg", "It eliminates the need for any ConOps"], 0),
    ],
  },
  {
    title: "Module 3 — Risk Management Fundamentals",
    lessons: [
      {
        title: "What a Safety Management System Actually Is",
        duration: 15,
        content: `## SMS: Four Pillars, One Ongoing Cycle

A **Safety Management System (SMS)** is not a document you write once and file away — it's an ongoing organizational process built around four pillars:

1. **Safety Policy:** the organization's documented commitment to safety, including who is accountable for what.
2. **Safety Risk Management:** identifying hazards, assessing their risk, and putting mitigations in place — the part of SMS most closely tied to the SORA-style methodology you'll build up through this module.
3. **Safety Assurance:** monitoring whether your mitigations are actually working in practice, through audits, data review, and performance indicators — not just assuming that a plan on paper is being followed in the field.
4. **Safety Promotion:** training, communication, and building a culture where people report problems rather than hide them.

A common mistake is treating "SMS" as a single risk-assessment document. In reality, a risk assessment (like a SORA submission) is a snapshot output of the second pillar — it should be backed by the other three, ongoing pillars, or it will drift out of date the moment operations begin.`,
      },
      {
        title: "Ground Risk Class (GRC): The Basics",
        duration: 18,
        content: `## Starting on the Ground

**Ground Risk Class (GRC)** estimates the risk an uncrewed aircraft poses to people on the ground if something goes wrong during the flight. It's typically the first calculation in a SORA-style assessment, and it starts from two main inputs:

- **The aircraft's characteristic dimension** (roughly, its size) and kinetic energy, since a larger, heavier, faster aircraft causes more harm on impact.
- **The population density** of the area overflown — how many people are typically present beneath the operational and contingency volumes.

Under the newer, quantitative SORA 2.5 model adopted across the EU in 2026, this population density figure is calculated with actual demographic data rather than broad, qualitative bands like "sparsely populated" — part of the push to make outcomes more consistent between different national authorities reviewing the same kind of operation.

Once you have an initial ("intrinsic") GRC, mitigations can reduce it — for example, strategies that reduce the population density actually exposed, or technical means that reduce the effect of ground impact (parachutes, shielded operating areas, and so on). Each mitigation has to be justified and, in most frameworks, evidenced — you can't simply claim credit for a mitigation you haven't actually implemented or tested.`,
      },
      {
        title: "Air Risk Class (ARC): The Other Half",
        duration: 15,
        content: `## Now Look Up

Where GRC asks "what happens if this aircraft comes down," **Air Risk Class (ARC)** asks "how likely is this aircraft to encounter other air traffic in the first place." It's assessed based on the airspace you're operating in — its class, typical traffic density, and altitude — and results in a category from low to high.

Once you know your GRC and ARC, they combine into a single overall figure — the **SAIL (Specific Assurance and Integrity Level)** — that determines the rigor of evidence a regulator will expect from you. A low-GRC, low-ARC operation over a remote area at low altitude might sit at SAIL I or II, requiring relatively light evidence. A higher-risk combination pushes you toward SAIL IV, V, or VI, with correspondingly demanding requirements — often including third-party technical evaluation of your systems.

This is why "what's our SAIL" is one of the first questions a consultant or authority will ask about any proposed BVLOS operation — it sets the scale of everything that follows.`,
      },
      {
        title: "Mitigations and Operational Safety Objectives",
        duration: 15,
        content: `## Turning Risk Down, on Paper and in Practice

Once GRC, ARC, and SAIL establish your starting risk level, the SORA methodology defines a set of **Operational Safety Objectives (OSOs)** — specific outcomes you need to demonstrate, covering things like the operator's competency, the reliability of the C2 link, and the robustness of the aircraft design, scaled to your SAIL level.

Three broad categories of mitigation typically apply:

- **Strategic mitigations:** changing the operation itself to reduce exposure — flying at a time or in an area with fewer people or less air traffic, for instance.
- **Technical mitigations:** equipment-based reductions in risk, such as a parachute recovery system, a more capable detect-and-avoid sensor suite, or a more resilient C2 link architecture.
- **Operational/procedural mitigations:** trained crew responses, checklists, and standard operating procedures that reduce the likelihood or consequence of a given hazard.

The critical discipline here is **traceability**: every mitigation you claim credit for in your risk assessment should map to something concrete — a procedure in your operations manual, a piece of equipment on your aircraft, a training record for your crew — that an auditor could actually go and verify.`,
      },
      {
        title: "Building a Hazard Log and Risk Register",
        duration: 15,
        content: `## Where Risk Management Becomes a Habit, Not a Document

A **hazard log** (sometimes called a risk register) is the living record where an organization tracks every identified hazard, its assessed risk, the mitigations in place, and the current status of each one. This is the tool that keeps your SMS's risk-management pillar alive between formal SORA submissions.

A workable hazard log typically tracks, for each entry:

- A clear description of the hazard (not just "GNSS issue," but specifically what could happen and under what conditions).
- The risk level before and after mitigation.
- The specific mitigation(s) in place, and who owns making sure they stay in place.
- A status: open, mitigated, or closed, with a date and the name of the person who last reviewed it.

New hazards typically surface from three places: incident and near-miss reports, routine safety audits, and changes to the operation itself (new aircraft, new area, new mission type). A hazard log that hasn't been updated in the last few months is a sign that the safety-assurance pillar of your SMS has gone quiet — worth flagging and fixing before it becomes a bigger problem.`,
      },
    ],
    quiz: [
      q("What are the four pillars of a Safety Management System?", ["Safety policy, safety risk management, safety assurance, safety promotion", "Ground risk, air risk, SAIL, and OSO", "VLOS, EVLOS, BVLOS, and UTM", "Part 107, Part 108, SORA, and ICAO"], 0),
      q("What does Ground Risk Class (GRC) primarily estimate?", ["The risk to people on the ground if the aircraft comes down", "The likelihood of encountering other aircraft", "The pilot's certification level", "The battery life of the aircraft"], 0),
      q("Under SORA 2.5, how is population density typically assessed?", ["Using quantitative demographic data rather than broad qualitative bands", "It is no longer considered at all", "By pilot estimate only", "By counting parked cars in the area"], 0),
      q("What does Air Risk Class (ARC) assess?", ["The likelihood of encountering other air traffic based on the airspace flown", "The weight of the aircraft", "The pilot's years of experience", "The cost of the operation"], 0),
      q("What does SAIL stand for and represent?", ["Specific Assurance and Integrity Level; the combined rigor required based on GRC and ARC", "A single certification exam for remote pilots", "A category of aircraft registration", "A synonym for ConOps"], 0),
      q("What are Operational Safety Objectives (OSOs)?", ["Specific outcomes an operator must demonstrate, scaled to SAIL level", "A list of banned operating areas", "An alternative name for NOTAMs", "A pilot's flight logbook"], 0),
      q("Which of these is a strategic mitigation?", ["Choosing a time or area with fewer people or less air traffic", "Installing a parachute recovery system", "Writing a checklist", "Training a crew member"], 0),
      q("Why is traceability important when claiming credit for a mitigation?", ["An auditor should be able to verify that the mitigation is actually implemented", "Traceability has no practical purpose", "It only matters for aircraft over 25 kg", "It replaces the need for a hazard log"], 0),
      q("What is a hazard log used for?", ["Tracking hazards, their risk level, and mitigation status over time", "Recording only successful, incident-free flights", "Replacing the ConOps entirely", "Listing approved aircraft paint colors"], 0),
      q("What might an outdated hazard log indicate?", ["That the safety-assurance pillar of the SMS has gone quiet and needs attention", "That the operation has become perfectly safe and needs no further review", "That the ConOps is no longer required", "Nothing of operational significance"], 0),
    ],
  },
  {
    title: "Module 4 — ConOps and Operational Design",
    lessons: [
      {
        title: "What Belongs in a Concept of Operations",
        duration: 15,
        content: `## The Document Everything Else Builds On

A **Concept of Operations (ConOps)** is the foundational description of what you intend to do, and it's the starting point for essentially every risk assessment framework covered in this course. A solid ConOps typically includes:

- **Mission description:** what the operation is actually for (inspection, delivery, mapping, and so on) and why BVLOS is necessary to accomplish it.
- **Aircraft description:** type, weight, performance characteristics, and relevant equipment (DAA sensors, parachute, Remote ID broadcast module).
- **Area of operations:** described both narratively and with maps, including the airspace classes involved.
- **Operational volume and contingency volume:** covered in depth in the next lesson.
- **Crew roles and responsibilities:** who does what, and how they communicate with each other during a flight.
- **Normal and abnormal procedures:** what a routine flight looks like, and what happens when something goes wrong.

Authorities and consultants read a ConOps first because it tells them what to expect from everything that follows — a weak or vague ConOps makes every downstream risk assessment harder to trust, no matter how carefully the math is done.`,
      },
      {
        title: "Operational Volume, Contingency Volume, and Ground Risk Buffer",
        duration: 15,
        content: `## Three Nested Boundaries

Every well-designed BVLOS mission defines three nested spatial boundaries:

1. **Operational Volume:** the airspace where the aircraft is expected to fly during normal operations — your planned route or survey area, with a margin for ordinary navigational accuracy.
2. **Contingency Volume:** a buffer around the operational volume, sized to give the aircraft room to safely respond to an abnormal event (a lost-link procedure, a course deviation) before it reaches the boundary of your authorized airspace.
3. **Ground Risk Buffer:** the additional area on the ground that could plausibly be affected if the aircraft came down anywhere within the contingency volume, given its flight characteristics — this is what actually feeds into your Ground Risk Class calculation.

Sizing these correctly is a balance: too small, and a minor deviation turns into an unauthorized excursion; too large, and you may unnecessarily inflate your ground risk classification or run into more controlled airspace and other traffic than the mission needs. Getting this sizing right, and being able to justify the numbers you chose, is one of the most commonly scrutinized parts of a BVLOS submission.`,
      },
      {
        title: "Detect and Avoid Systems",
        duration: 15,
        content: `## Replacing the Pilot's Eyes

**Detect and Avoid (DAA)** is the umbrella term for the sensors, software, and procedures that let an uncrewed aircraft identify potential conflicts with other traffic and respond appropriately — the direct technical replacement for what a VLOS pilot's own eyes and judgment would normally do.

DAA approaches generally fall into a few categories:

- **Cooperative detection:** relying on other aircraft broadcasting their position (via ADS-B or similar systems) so your aircraft or ground station can detect them electronically.
- **Non-cooperative detection:** onboard sensors (radar, electro-optical, acoustic) capable of detecting traffic that isn't broadcasting its position at all — technically harder, but necessary in mixed airspace where you can't assume everyone else is cooperating.
- **Ground-based detection:** radar or other sensors on the ground, feeding traffic information to the operator rather than the aircraft carrying the sensor itself.

Regulators increasingly expect a documented, tested case for whichever approach you use, not just a manufacturer's data sheet — how the system performs in your specific operating environment, at your specific altitudes, matters more than a generic capability claim.`,
      },
      {
        title: "C2 Link Reliability and Lost-Link Procedures",
        duration: 15,
        content: `## When the Connection Drops

The **C2 (command and control) link** is the lifeline between the ground control station and the aircraft. Because BVLOS operations often push that link to greater distances, through more obstructions, or over longer durations than typical VLOS flights, link reliability is one of the most heavily scrutinized elements of any BVLOS safety case.

Every BVLOS ConOps needs an explicit, tested **lost-link procedure** — what the aircraft does automatically if the C2 link drops, without waiting for a human decision that, by definition, can't be communicated. Common elements include:

- A **pre-programmed return-to-home or loiter behavior**, defined before every flight, not left as a generic default.
- **Time thresholds**: how long the aircraft waits before executing the lost-link behavior, and whether that changes depending on the phase of flight.
- **Link re-acquisition logic**: what happens if the link comes back before the lost-link procedure completes.
- **Crew notification and response**: what your ground crew does the moment they notice the link has dropped, independent of what the aircraft is doing autonomously.

This procedure should be tested, not just described on paper — an authority reviewing your submission will often ask specifically how you validated it, not just what it says.`,
      },
      {
        title: "Remote ID and UTM Integration",
        duration: 12,
        content: `## Being Visible in the System

**Remote ID** broadcasts an aircraft's identity, location, and altitude in real time, giving other airspace users, regulators, and — depending on the framework — the public a way to identify who's flying nearby. It's becoming a near-universal baseline requirement across the frameworks covered in this course, and the proposed US Part 108 explicitly builds on it.

**UTM (UAS Traffic Management)** is the broader digital ecosystem for coordinating uncrewed traffic, separate from — but increasingly connected to — traditional air traffic control. As BVLOS operations scale from occasional flights to routine, high-frequency corridors, regulators are steadily pushing operators toward UTM integration rather than one-off manual coordination for every flight.

For a foundations-level takeaway: treat Remote ID as a baseline compliance item to get right early, and treat UTM integration as a capability worth building toward even before it's strictly mandatory for your specific operation — the direction of travel across every framework in this course points the same way.`,
      },
    ],
    quiz: [
      q("What is a Concept of Operations (ConOps)?", ["The foundational document describing what an operation intends to do and how", "A synonym for Remote ID", "A type of aircraft registration certificate", "A weather briefing document"], 0),
      q("What should a ConOps typically include?", ["Mission description, aircraft description, area of operations, and procedures", "Only the aircraft's purchase price", "Only the pilot's home address", "Nothing related to crew roles"], 0),
      q("What is the Operational Volume?", ["The airspace where the aircraft is expected to fly during normal operations", "The area used only for maintenance", "A synonym for Remote ID", "The pilot's certification region"], 0),
      q("What is the purpose of the Contingency Volume?", ["To give the aircraft room to safely respond to an abnormal event before reaching the authorized boundary", "To reduce the cost of insurance", "To replace the need for a ConOps", "To define the pilot's home airport"], 0),
      q("What does the Ground Risk Buffer feed into?", ["The Ground Risk Class calculation", "The pilot's certification exam", "The Remote ID broadcast frequency", "The aircraft's paint scheme requirements"], 0),
      q("What is Detect and Avoid (DAA)?", ["Sensors, software, and procedures that let an aircraft identify and avoid conflicts without a pilot's direct view", "A synonym for lost-link procedure", "A type of NOTAM", "A ground risk mitigation exclusive to Class G airspace"], 0),
      q("What is the difference between cooperative and non-cooperative detection?", ["Cooperative relies on other aircraft broadcasting position; non-cooperative uses onboard sensors to detect traffic that isn't broadcasting", "There is no meaningful difference", "Cooperative detection is illegal in the EU", "Non-cooperative detection only works at night"], 0),
      q("What is a lost-link procedure?", ["A pre-defined, tested aircraft behavior when the C2 link drops", "A method for filing NOTAMs", "A way to increase Ground Risk Class credit automatically", "A backup pilot certification"], 0),
      q("What does Remote ID broadcast?", ["An aircraft's identity, location, and altitude in real time", "The pilot's medical history", "The aircraft's purchase invoice", "Weather conditions at the departure point"], 0),
      q("What is UTM?", ["UAS Traffic Management, a digital ecosystem for coordinating uncrewed traffic", "A synonym for Part 108", "A single company's proprietary software only", "A certification exam for remote pilots"], 0),
    ],
  },
  {
    title: "Module 5 — Contingency Planning and Safety Culture",
    lessons: [
      {
        title: "Planning for Lost Link, GNSS Degradation, and Flyaway",
        duration: 15,
        content: `## The Three Contingencies Every ConOps Should Address

While every operation has its own specific hazards, three contingency scenarios come up in nearly every BVLOS safety case, and are worth planning for explicitly:

- **Lost C2 link:** covered in Module 4 — a pre-programmed, tested behavior that doesn't depend on a human decision arriving in time.
- **GNSS degradation or loss:** if the aircraft's satellite navigation becomes unreliable or unavailable, what does it do? Options range from switching to an alternative navigation source, to holding position if capable, to executing a controlled descent within the contingency volume — the right answer depends heavily on your specific aircraft and mission.
- **Flyaway:** a scenario where the aircraft is no longer under control and is not executing any expected contingency behavior. This is the scenario your Ground Risk Buffer sizing and technical mitigations (geofencing, flight termination systems) are ultimately meant to contain.

For each of these, your documentation should specify: how you'll detect the condition, what the aircraft does automatically, what the crew does, and how you'll evaluate whether the response actually worked after the fact.`,
      },
      {
        title: "Emergency Procedures and Reporting",
        duration: 12,
        content: `## When Things Go Wrong for Real

A contingency is something your system is designed to handle; an **emergency** is what you call it when things go beyond that design. Every BVLOS operator should have a clear emergency procedure covering:

- **Immediate crew actions**: who does what in the first minute, without waiting for a full investigation.
- **Notification requirements**: which authority needs to be told, how quickly, and through what channel — these requirements vary by jurisdiction and by the severity of the event, so this needs to be specific to where you operate.
- **Evidence preservation**: telemetry logs, flight data, and crew statements captured promptly, before memory fades or data is overwritten.
- **Post-event review**: feeding what happened back into your hazard log and, where relevant, into training and procedure updates — this is the link back to the safety-assurance pillar of your SMS.

A program that handles emergencies well isn't one that never has them — it's one that responds consistently, reports honestly, and demonstrably learns from every event.`,
      },
      {
        title: "Human Factors in Remote Operations",
        duration: 12,
        content: `## The Human Side of a Screen-Based Job

Removing the pilot from the aircraft doesn't remove human factors from the operation — it changes their shape. BVLOS crews face some distinct challenges:

- **Vigilance decrement:** staying attentive during long, uneventful monitoring periods is genuinely difficult, and fatigue affects screen-based monitoring differently than it affects hands-on flying.
- **Automation complacency:** the more reliable your automation and DAA systems normally are, the easier it becomes to under-react when something actually goes wrong, precisely because "everything is usually fine."
- **Distributed crew coordination:** BVLOS crews are often physically separated — a remote pilot in one location, a visual observer or ground crew elsewhere, an ATC coordinator on a different channel entirely — which places real demands on communication discipline.
- **Distinct workload patterns:** the workload of a remote pilot in cruise phase, watching for anomalies, is very different from the workload during takeoff, landing, or contingency response, and rest and rotation planning should account for that difference rather than treating "flight time" as uniform.

Building these human factors considerations into your training and crew scheduling, rather than treating BVLOS as identical to VLOS with a longer cable, is part of what separates a mature safety program from a paper one.`,
      },
      {
        title: "Just Culture and Voluntary Reporting",
        duration: 12,
        content: `## Building an Organization People Report To

A **just culture** is one where people feel safe reporting mistakes, near-misses, and honest errors, because the organization's response is focused on learning rather than blame — reserving genuine accountability for reckless or willful violations, not for honest mistakes made in good faith.

This matters enormously for BVLOS safety in practice, because so many of the hazards this course has covered — a lost-link event that resolved fine, a GNSS glitch that didn't quite become a flyaway, a near-miss with unexpected traffic — never show up in a formal incident report unless the person who saw it feels safe describing it.

Practical steps toward a just culture include:

- A **clearly written reporting policy** that distinguishes honest error from willful violation, agreed and communicated before you need it, not improvised after an event.
- **Protecting the reporter** from unrelated disciplinary consequences for the act of reporting itself.
- **Closing the loop visibly**: when someone's report leads to a real change in procedure or training, communicate that back to the organization, so people see that reporting has real effect.

Without this, your hazard log from Module 3 will quietly stop reflecting reality, no matter how good the template looks.`,
      },
      {
        title: "Continuous Improvement and Lessons Learned",
        duration: 12,
        content: `## Safety Management Doesn't End at Authorization

Getting your BVLOS authorization approved — whether that's a Part 107 waiver, a Part 108 certificate once it exists, or an EASA Specific-category approval under SORA — is a milestone, not a finish line. Every pillar of your SMS is meant to keep running after that point.

A practical continuous-improvement cycle includes:

- **Regular review of your hazard log**, not just when preparing for a new submission.
- **Trend analysis** across incidents, near-misses, and even routine flight data, looking for patterns rather than treating every event in isolation.
- **Refresher training**, scaled to how often your crew actually flies BVLOS — skills and procedural discipline both fade faster than people expect during long gaps between operations.
- **Regulatory monitoring**, since — as this course has shown repeatedly — the frameworks themselves keep changing. SORA has moved from 2.0 to 2.5, with 3.0 already in development; Part 108 is still being finalized in the US as of this writing. A safety program that assumes the rules it learned once will stay fixed is planning for a world that no longer exists.

This is really the throughline of this entire foundations course: BVLOS safety isn't a document you complete, it's a discipline you maintain.`,
      },
    ],
    quiz: [
      q("Which three contingencies does nearly every BVLOS ConOps need to address explicitly?", ["Lost link, GNSS degradation, and flyaway", "Weather delay, fuel cost, and paint damage", "Pilot certification renewal, insurance renewal, and aircraft resale", "Marketing, sales, and customer support"], 0),
      q("What is the difference between a contingency and an emergency?", ["A contingency is designed for; an emergency goes beyond the designed response", "They are exactly the same thing", "An emergency only applies to crewed aircraft", "A contingency only applies to weather events"], 0),
      q("What should emergency procedures specify?", ["Immediate crew actions, notification requirements, and evidence preservation", "Only the aircraft's resale value", "Only the pilot's personal contact information", "Nothing beyond the ConOps"], 0),
      q("What is 'vigilance decrement'?", ["The difficulty of staying attentive during long, uneventful monitoring periods", "A type of GNSS malfunction", "A synonym for lost link", "A required training certificate"], 0),
      q("What is automation complacency?", ["Under-reacting to problems because automation is usually reliable", "A benefit with no downside", "A type of Ground Risk Class mitigation", "A synonym for Remote ID"], 0),
      q("Why does distributed crew coordination require special attention in BVLOS?", ["Crew members are often physically separated, demanding strong communication discipline", "It never applies to BVLOS operations", "It only matters for aircraft under 250 grams", "It replaces the need for a lost-link procedure"], 0),
      q("What is a 'just culture'?", ["An environment where honest errors are reported without fear, while reckless violations are still held accountable", "A culture where no consequences ever apply to anyone", "A synonym for Safety Assurance only", "A legal requirement unique to the UK"], 0),
      q("Why is protecting the reporter important in a just culture?", ["It encourages people to report honest mistakes and near-misses instead of hiding them", "It has no real effect on reporting behavior", "It is only relevant to management, not crew", "It replaces the need for a hazard log"], 0),
      q("What does a practical continuous-improvement cycle include?", ["Regular hazard log review, trend analysis, and refresher training", "A single risk assessment completed once at authorization", "Ignoring regulatory updates once approved", "Removing the SMS once a waiver is granted"], 0),
      q("What is the central theme connecting all modules in this foundations course?", ["BVLOS safety is an ongoing discipline, not a document completed once", "Regulations never change once published", "VLOS and BVLOS require identical procedures", "Only technical systems matter, not human factors or culture"], 0),
    ],
  },
];

// ---------------------------------------------------------------------------
// 3. Apply everything to the database
// ---------------------------------------------------------------------------

const course = db.prepare("SELECT * FROM courses WHERE slug = ?").get(COURSE_SLUG);
if (!course) {
  console.error(`[seed] No course found with slug "${COURSE_SLUG}". Aborting — nothing was changed.`);
  process.exit(1);
}

console.log(`[seed] Found course: ${course.title} (${course.id})`);

db.prepare(
  "UPDATE courses SET title = ?, subtitle = ?, description = ?, learning_outcomes = ? WHERE id = ?"
).run(courseData.title, courseData.subtitle, courseData.description, courseData.learningOutcomes, course.id);

// Wipe existing modules/lessons/progress for this course so re-running refreshes cleanly.
const existingModules = db.prepare("SELECT id FROM modules WHERE course_id = ?").all(course.id);
for (const m of existingModules) {
  const existingLessons = db.prepare("SELECT id FROM lessons WHERE module_id = ?").all(m.id);
  for (const l of existingLessons) {
    db.prepare("DELETE FROM lesson_progress WHERE lesson_id = ?").run(l.id);
  }
  db.prepare("DELETE FROM lessons WHERE module_id = ?").run(m.id);
}
db.prepare("DELETE FROM modules WHERE course_id = ?").run(course.id);

const insertModule = db.prepare(
  'INSERT INTO modules (id, course_id, title, "order", quiz_json) VALUES (?, ?, ?, ?, ?)'
);
const insertLesson = db.prepare(`
  INSERT INTO lessons (id, module_id, title, content, duration_minutes, "order", is_preview)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

modulesData.forEach((mod, mi) => {
  const moduleId = uuid();
  insertModule.run(moduleId, course.id, mod.title, mi, JSON.stringify(mod.quiz));
  mod.lessons.forEach((lesson, li) => {
    insertLesson.run(uuid(), moduleId, lesson.title, lesson.content, lesson.duration, li, mi === 0 && li === 0 ? 1 : 0);
  });
  console.log(`[seed] Module ${mi + 1}: "${mod.title}" — ${mod.lessons.length} lessons, ${mod.quiz.length} quiz questions`);
});

console.log("[seed] Done. BVLOS Operations Fundamentals is fully loaded.");
db.close();
