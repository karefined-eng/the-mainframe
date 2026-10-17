# Why I Started The Mainframe

A simple task app did some things well, but it could not hold the whole picture I wanted to keep track of. Plans and ideas were scattered across separate lists and whatever device or app was nearby. The problem was not that I needed another list; it was that I had no dependable place to gather the things I had decided were worth pursuing, return to them, and see progress over time.

I wanted one private home for that information, under my control and available across devices. More importantly, I did not want a strict schedule or a single ranking to declare which part of my life mattered most. I wanted enough structure to see what was ahead and choose what to work on based on the time I had. Seeing everything unfinished at once can be heavy; the system should help me choose and continue, not make the whole list feel like a verdict.

The thought that starts an item can arrive anywhere. I wanted to be able to capture it before it disappears, then make sense of it later. Mainframe is not meant to record every thought or plan every minute. Its purpose is to hold the things I choose to remember and pursue, and make progress easier to recognize.

## What Changed as the Idea Became a Build

My first sketch was broader: I imagined importing several file formats and having the app turn them into structured information. The current project brief deliberately narrows the first version to plain-text paste. I also initially pictured optional one-way calendar-to-Mainframe import; the current brief instead makes Mainframe the source of truth and any calendar connection a read-only mirror. These are changes to implementation scope, not changes to the underlying need. The current choices belong in the specifications, not as claims about what the original idea already included.

## What Should Stay True

The lasting intent is simple: keep important possibilities from getting lost, organize them without forcing everything into a rigid queue, protect the information, and let me choose what to work on next. This note records why I wanted Mainframe; the [README](README.md), [project brief](00_PROJECT_BRIEF.md), [data schema](01_DATA_SCHEMA.md), [tech setup](02_TECH_STACK_AND_SETUP.md), [UX notes](03_UX_RESEARCH_NOTES.md), and [research and prior art](04_RESEARCH_AND_PRIOR_ART.md) describe the product scope and build decisions.

## Development Spree 2: Voice Rant Ingestion, Privacy-First AI & Project Origin Seeding

### The Raw Voice Memo (Verbatim Transcript)

> *"The idea is to have sort of... because this is like for my personal history sheet. What I actually need is the ability to be able to take the Mainframe, pin it, tap a mic, and then speak out something that I have. See, like when I rant like that, it could have ideas for an app, it could have a goal, it could have an experience, it could have all that.*
>
> *And so this AI would like process my transcript against the core domains that I have set, with optional recommended domains, and then sort everything into the specific domain with proper tagging, like getting the names, the categories, and everything right.*
>
> *And so, for example, if I want to build an app specifically, I should have an option to tap a mic button and say, record something else, an idea I have for an app. The recording may not have to be saved; we just need the transcript. And so if we're going to use like an API endpoint to get a transcript, and once you have the transcripts, I can use that as the `origin.md` for a new project, that would be great, especially for building products and software products.*
>
> *Aside that, having like a voice feature in there would be great to help like actually work, have the Mainframe work the way I already work. And I'm also thinking it should be mobile-first. So maybe an API endpoint instead of a downloaded local model, depends, or maybe if embedding Gemma 2 is small enough to do what we're talking about, fine. But this is the idea, and this is something that deserves to be in the `origin.md`, maybe as a subsection of it. We are starting a new development spree, so have this in there. I think the transcript should be in there and then what you distill from it as well."*

### Distilled Intent & Architectural Directives

1. **Frictionless Voice Capture ("Rant-to-Structure"):**
   - **User Flow:** A single tap on a pinned mic button (especially on mobile) lets the user speak freely without structuring their thoughts in advance.
   - **Ephemeral Audio:** The raw audio file is strictly temporary; once transcribed into text, the audio payload can be discarded to save storage and protect privacy.
   - **Multi-Domain Decomposition:** A single spoken stream often bundles several distinct thoughts (e.g. an app concept, a personal goal, an acquisition idea, a life reflection). The AI parses the transcript, extracts each atomic entity, and sorts it cleanly into its respective domain (`build_ideas`, `goals`, `ventures`, `certifications`, `acquisitions`) with appropriate tags, titles, and categories.

2. **Automated `origin.md` Seed Generation for Software Builds:**
   - When a rant contains a software/product build idea, the raw spoken transcript and its distilled emotional intent can be exported or initialized directly as the `origin.md` for that new repository.
   - This ensures new projects carry the founder's authentic voice, raw motivation, and psychological context from day one.

3. **Mobile-First Execution & Inference Model Strategy:**
   - Primary usage happens on-the-go on mobile devices.
   - **Inference Balance:** Evaluate between a lightweight, private API endpoint (fast, zero battery drain) and an efficient on-device model (e.g. Gemma 2 2B / quantized edge runtime) to preserve privacy without compromising mobile responsiveness.

