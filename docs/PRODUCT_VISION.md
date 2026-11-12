# Pathpin — Product Vision

**Pathpin — Smart Campus Navigation & Information Platform**
*Find your place. Understand your campus.*

Status: accepted reference for positioning (2026-11-12). Changes to this document are product decisions and go through [DECISIONS.md](DECISIONS.md).

## What Pathpin is

Pathpin is a specialised digital layer that connects people to the **physical campus** and to the **context** of its places. It works as an extension of existing university systems, not a replacement. It fills the gap those systems rarely cover: understanding the campus, and relating digital information to physical places.

The first development and experimentation environment is the University of Nyíregyháza, Hungary. Pathpin is an **independent initiative**: it assumes no partnership, authorisation or official recognition from the university.

## Problems Pathpin solves

- Finding buildings, floors, rooms and services.
- Understanding how the campus is physically organised.
- Missing context about specific spaces (what happens there, who it is for, how to access it).
- Discovering facilities and resources people don't know exist.
- Language barriers in understanding university information.
- Information scattered across web pages, posters, emails and physical signs.
- Connecting announcements and information to the places they concern.

## What Pathpin is not

Specialisation is a strategic decision, not an accidental limitation. Pathpin is **not**:

- a university management system;
- an enrolment, grades or exams system;
- a learning management system (LMS);
- a university social network;
- a replacement for the institutional website;
- an event management system;
- a platform that tries to concentrate every university activity.

**Rule of thumb:** if a feature makes Pathpin the owner of a process (booking, publishing events, procedures, conversations), it is out of scope. Pathpin answers *where*, *what this place is* and *how to get there*, and links to whoever owns the rest.

## Who it is for

| User | Main need |
| --- | --- |
| New international student | Find offices and rooms, understand what they are, overcome Hungarian-only information |
| Hungarian first-year student | Find rooms in the first weeks, learn which office does what |
| Returning student | Quick lookups: a room code, a printer, a quiet study space |
| Visitor or guest lecturer | Reach one room once, from a car park or bus stop |
| Person with access needs | Know whether a place is reachable before going |

## Product principles

1. **Honest data.** Every fact carries its source and verification state. Unverified stays visibly unverified. Fictional sample data is never presented as real.
2. **Lightweight first.** Static web, no install, works on weak connections. Infrastructure is added only when a feature needs it.
3. **Accessible by default.** Accessibility is information users need, not just interface compliance.
4. **Multilingual by design.** Language is a property of the data, not a later translation pass.
5. **Institution-adaptable.** Anything specific to one university lives in configuration and data, not in code.
6. **Independent but respectful.** No official branding, no implied endorsement, no contact on behalf of the project without the founder's decision.
7. **Private by default.** Personal preferences stay on the user's device until accounts are clearly justified.

## Product domains

| Domain | Question it answers |
| --- | --- |
| **Navigate** | How do I get there? |
| **Directory** | What exists, and where is it? |
| **Discover** | What useful places don't I know about? |
| **Translate** | What does this mean, in my language? |
| **Campus Information** | What is happening at this place right now? |
| **MyCampus** | What matters to me? |
| **Platform & Data** | How do we keep it correct, adaptable and trustworthy? |

The full, classified feature catalogue is in [FEATURE_UNIVERSE.md](FEATURE_UNIVERSE.md). Sequencing is in [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md).

## Classification used across the docs

**Tier:** Core (defines the product) · Supporting (improves the experience) · Experimental (worth exploring) · Future (depends on maturity, data or resources).

**Feasibility:** Independent (the team can do it alone) · Institutional (needs university information or permission) · Integration (needs an external system or service).

An interesting idea is not a priority. Tiers describe value; the roadmap decides order.
