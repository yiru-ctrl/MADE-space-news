import { useState, useRef, useEffect, useCallback, type CSSProperties } from "react";
import logoSvg from "../imports/SVG_1__1_.svg";
import Star from "../imports/Star1/index";
import {
  Search, Volume2, VolumeX, X,
  Plus, Sparkles, Clock, Hash,
  ArrowRight, Check,
  ChevronLeft, ChevronRight, Globe, Zap,
  Moon, Sun, Trash2, MoreHorizontal, Pencil,
  ExternalLink, BookOpen, CalendarDays, ListChecks,
} from "lucide-react";
import { CanvasBoard } from "./components/CanvasBoard";
import { PolishedOnboarding } from "./components/PolishedOnboarding";
import { DotGridBackground } from "./components/DotGridBackground";
import imgSleepScience from "../assets/editorial/sleep-motion.gif";
import imgPerplexity from "../assets/editorial/deep-research.jpg";
import imgAuditorium from "../assets/editorial/auditorium.jpg";
import imgStudent from "../assets/editorial/student-lecture.jpg";
import imgGraduation from "../assets/editorial/graduation.jpg";
import imgBrownSeal from "../assets/editorial/brown-seal.jpg";
import imgBrownConvocation from "../assets/editorial/brown-convocation.jpg";
import imgBottega from "../assets/editorial/bottega-fashion-optimized.jpg";
import imgAGI from "../assets/editorial/zurich-graphic.png";
import imgBrownSnow from "../assets/editorial/brown-snow.jpg";
import imgBoooci from "../assets/editorial/boooci-studio-optimized.jpg";
import imgRadio from "../assets/editorial/radio-sleep.png";
import imgTruffle from "../assets/editorial/truffle-device.webp";
import imgDeviceMockup from "../assets/editorial/device-mockup.jpg";
import imgMoss from "../assets/editorial/moss-branch.webp";
import imgAppLight from "../imports/image.png";
import imgLaptopCanvas from "../imports/image-1.png";
import imgAppDark from "../imports/image-2.png";
import imgPinModal from "../imports/image-3.png";
import imgAiLaptop from "../imports/067adef7e766d656269035328feafd70.jpg";
import imgDocCanvas from "../imports/86eef03302a7b96f17d43120cf43c265.jpg";


// ─── Types ───────────────────────────────────────────────────────────────────

type SortOrder = "relevant" | "newest" | "oldest";

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceIcon: string;
  category: string;
  publishedAt: string;
  imageUrl: string | null;
  imageAspect?: string;
  imagePosition?: string;
  readTime: number;
  boardIds: string[];
  url?: string;
  feedUrl?: string;
  isLive?: boolean;
}

interface Board {
  id: string;
  name: string;
  articleIds: string[];
  emoji: string;
}

interface TextSelectionState {
  text: string;
  top: number;
  left: number;
}

interface PinMenuState {
  articleId: string;
  top: number;
  right: number;
  maxHeight: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Technology", "Design", "Science", "Culture",
  "Business", "Health", "Politics", "Environment", "Sports", "Art", "Clipping",
];

const CATEGORY_EMOJI: Record<string, string> = {
  Technology: "⚡", Design: "✦", Science: "🔬", Culture: "🎭",
  Business: "📈", Health: "🌿", Politics: "🏛", Environment: "🌍",
  Sports: "🏎", Art: "🎨", Clipping: "✎",
};

const MOCK_ARTICLES: Article[] = [
  { id: "1",  title: "The Quiet Revolution in Human-Computer Interaction", summary: "Ambient computing is reshaping the way we think about interfaces, presence, and attention — without us noticing.", source: "MIT Technology Review", sourceIcon: "M", category: "Technology", publishedAt: "2026-07-09T08:00:00Z", imageUrl: imgAppLight, readTime: 5, boardIds: [] },
  { id: "2",  title: "Brutalism Is Back — and This Time It's Digital", summary: "Designers are embracing the raw, unfinished web aesthetic in ways that actually work.", source: "Eye Magazine", sourceIcon: "E", category: "Design", publishedAt: "2026-07-08T14:30:00Z", imageUrl: imgBoooci, imageAspect: "4 / 5", readTime: 4, boardIds: [] },
  { id: "3",  title: "Ocean Floors Are Warming Faster Than Predicted", summary: "New deep-sea sensors reveal a 30-year acceleration that threatens global thermal stratification.", source: "Nature", sourceIcon: "N", category: "Science", publishedAt: "2026-07-09T06:00:00Z", imageUrl: imgRadio, imageAspect: "16 / 10", readTime: 6, boardIds: [] },
  { id: "4",  title: "Why Gen Z Reads Longer Now", summary: "After years of short-form dominance, long reads are staging a quiet comeback among younger audiences.", source: "The Atlantic", sourceIcon: "A", category: "Culture", publishedAt: "2026-07-07T10:00:00Z", imageUrl: imgStudent, imageAspect: "4 / 5", imagePosition: "center 45%", readTime: 8, boardIds: [] },
  { id: "5",  title: "The BRICS Currency Experiment Is Working", summary: "Six months in, the new settlement currency has reduced dollar dependency by 12% among member states.", source: "Financial Times", sourceIcon: "F", category: "Business", publishedAt: "2026-07-09T07:00:00Z", imageUrl: imgTruffle, imageAspect: "1 / 1", readTime: 5, boardIds: [] },
  { id: "6",  title: "Sleep Science Gets Political", summary: "Lawmakers are debating whether chronic sleep deprivation should be classified as a public health crisis.", source: "STAT News", sourceIcon: "S", category: "Health", publishedAt: "2026-07-08T09:00:00Z", imageUrl: imgSleepScience, imageAspect: "16 / 9", readTime: 4, boardIds: [] },
  { id: "7",  title: "Rewilding Europe: A Decade in Review", summary: "Wolf packs in France, bison in Poland — the continent's most ambitious ecological restoration is paying off.", source: "The Guardian", sourceIcon: "G", category: "Environment", publishedAt: "2026-07-06T11:00:00Z", imageUrl: imgMoss, imageAspect: "16 / 10", readTime: 7, boardIds: [] },
  { id: "8",  title: "The Open Source AI That Spooked the Closed Ones", summary: "A small research collective released a model that rivals GPT-7 on most benchmarks — for free.", source: "Wired", sourceIcon: "W", category: "Technology", publishedAt: "2026-07-09T05:00:00Z", imageUrl: null, readTime: 6, boardIds: [] },
  { id: "9",  title: "Nairobi's Design Week Is the World's Most Interesting Now", summary: "How Kenya's capital became the global hub for emergent material culture and speculative design.", source: "Dezeen", sourceIcon: "D", category: "Design", publishedAt: "2026-07-08T12:00:00Z", imageUrl: imgDeviceMockup, imageAspect: "4 / 3", readTime: 5, boardIds: [] },
  { id: "10", title: "What Chess Taught Us About Intelligence", summary: "Revisiting 30 years of AI milestones through the game that started it all — and what it got wrong.", source: "New Yorker", sourceIcon: "N", category: "Culture", publishedAt: "2026-07-07T15:00:00Z", imageUrl: imgAuditorium, imageAspect: "1 / 1", readTime: 9, boardIds: [] },
  { id: "11", title: "Art Fairs Are Collapsing — and That's Good", summary: "The death of the mega-fair is forcing galleries to rediscover what community actually means.", source: "Artforum", sourceIcon: "A", category: "Art", publishedAt: "2026-07-06T13:00:00Z", imageUrl: imgAGI, imageAspect: "4 / 3", readTime: 6, boardIds: [] },
  { id: "12", title: "The Protein That Might Replace Antibiotics", summary: "Bacteriophage-derived lysins show 97% efficacy against drug-resistant bacteria in Phase III trials.", source: "Science", sourceIcon: "S", category: "Health", publishedAt: "2026-07-08T08:00:00Z", imageUrl: imgBrownSeal, readTime: 5, boardIds: [] },
  { id: "13", title: "Vertical Cities Are No Longer a Fantasy", summary: "Singapore and Seoul are piloting sky-level neighborhoods that stack parks, shops, and homes above 200m.", source: "Bloomberg CityLab", sourceIcon: "B", category: "Science", publishedAt: "2026-07-07T09:00:00Z", imageUrl: imgBrownSnow, imageAspect: "4 / 5", readTime: 5, boardIds: [] },
  { id: "14", title: "Quiet Luxury Goes to Washington", summary: "How Capitol Hill dress codes became a political statement — and a fashion flashpoint.", source: "Vogue", sourceIcon: "V", category: "Politics", publishedAt: "2026-07-09T09:00:00Z", imageUrl: imgBottega, imageAspect: "3 / 4", imagePosition: "center 35%", readTime: 4, boardIds: [] },
  { id: "15", title: "Formula E Just Became More Exciting Than F1", summary: "Electric racing's awkward adolescence is over. This season has delivered drama that petrolheads can't ignore.", source: "The Race", sourceIcon: "R", category: "Sports", publishedAt: "2026-07-08T16:00:00Z", imageUrl: imgAppDark, readTime: 4, boardIds: [] },
  { id: "16", title: "The Typography of Trust", summary: "Why the fonts governments and hospitals choose directly affect how much we believe their messages.", source: "Eye Magazine", sourceIcon: "E", category: "Design", publishedAt: "2026-07-06T10:00:00Z", imageUrl: imgAGI, imageAspect: "4 / 3", readTime: 5, boardIds: [] },
  { id: "17", title: "Inside the Antarctic Ice Core That Spans 1.2 Million Years", summary: "A team of 14 nations just extracted history's longest continuous climate record. Here's what they found.", source: "Science", sourceIcon: "S", category: "Science", publishedAt: "2026-07-05T08:00:00Z", imageUrl: imgBrownSnow, imageAspect: "4 / 5", readTime: 7, boardIds: [] },
  { id: "18", title: "Notion's New AI Is Eating Its Own Market", summary: "Paradox or smart strategy? The tool-for-everything is now building tools that make its older tools obsolete.", source: "Fast Company", sourceIcon: "F", category: "Technology", publishedAt: "2026-07-09T11:00:00Z", imageUrl: imgPerplexity, readTime: 3, boardIds: [] },

  // ── Design & Architecture ──────────────────────────────────────────────────
  { id: "19", title: "Dezeen Awards 2026 Longlist: The Buildings That Stopped Us Cold", summary: "From a floating wetland pavilion in Rotterdam to a rammed-earth school in Oaxaca, this year's shortlist redefines civic ambition.", source: "Dezeen", sourceIcon: "D", category: "Design", publishedAt: "2026-07-09T07:30:00Z", imageUrl: imgBoooci, imageAspect: "4 / 5", readTime: 5, boardIds: [] },
  { id: "20", title: "designboom's 100 Most Clicked Projects of the Decade", summary: "Ten years of reader obsessions distilled: kinetic facades, zero-waste interiors, and the chair that went viral before 'viral' was a thing.", source: "designboom", sourceIcon: "d", category: "Design", publishedAt: "2026-07-08T10:00:00Z", imageUrl: imgAGI, imageAspect: "4 / 3", readTime: 6, boardIds: [] },
  { id: "21", title: "The New Minimalism Has Texture", summary: "Design Milk's editors on why the next wave of minimal interiors is anything but flat — and what material science has to do with it.", source: "Design Milk", sourceIcon: "M", category: "Design", publishedAt: "2026-07-08T09:00:00Z", imageUrl: imgMoss, imageAspect: "16 / 10", readTime: 4, boardIds: [] },
  { id: "22", title: "Core77's Industrial Design Awards: Process Over Product", summary: "This year's winners were chosen not for what they made but for how they made it — and the field is better for it.", source: "Core77", sourceIcon: "C", category: "Design", publishedAt: "2026-07-07T13:00:00Z", imageUrl: imgDeviceMockup, imageAspect: "4 / 3", readTime: 5, boardIds: [] },
  { id: "23", title: "Speculative Futures: Design Fiction Comes of Age", summary: "Dexigner surveys the studios treating tomorrow's crises as today's briefs — climate grief, post-scarcity housing, edible packaging.", source: "Dexigner", sourceIcon: "D", category: "Design", publishedAt: "2026-07-07T08:00:00Z", imageUrl: imgRadio, imageAspect: "16 / 10", readTime: 7, boardIds: [] },
  { id: "24", title: "How Independent Studios Are Winning the Brand War", summary: "Creative Boom profiles twelve studios that turned down agency acquisition offers — and doubled their revenue anyway.", source: "Creative Boom", sourceIcon: "C", category: "Design", publishedAt: "2026-07-06T14:00:00Z", imageUrl: imgBottega, imageAspect: "3 / 4", imagePosition: "center 32%", readTime: 6, boardIds: [] },
  { id: "25", title: "AI Image Tools Are Changing the Mood Board Forever", summary: "Creative Bloq investigates what happens when your reference images are generated, not gathered — and whether that's actually a problem.", source: "Creative Bloq", sourceIcon: "C", category: "Design", publishedAt: "2026-07-09T06:30:00Z", imageUrl: imgAiLaptop, readTime: 4, boardIds: [] },
  { id: "26", title: "Mass Timber Is Reshaping the Urban Skyline — Again", summary: "ArchDaily tracks the second wave of CLT construction, now reaching 30 storeys, and asks whether fire codes are finally catching up.", source: "ArchDaily", sourceIcon: "A", category: "Design", publishedAt: "2026-07-08T11:00:00Z", imageUrl: null, readTime: 6, boardIds: [] },
  { id: "27", title: "Adaptive Reuse Is the Only Honest Architecture Left", summary: "The Architect's Newspaper argues that new construction is a moral question now, and the best answer is almost always a building that already exists.", source: "The Architect's Newspaper", sourceIcon: "A", category: "Design", publishedAt: "2026-07-07T16:00:00Z", imageUrl: null, readTime: 8, boardIds: [] },
  { id: "28", title: "The Return of the Public Square", summary: "Archinect surveys a generation of plazas, courtyards, and commons designed after the pandemic proved we'd forgotten how to share space.", source: "Archinect", sourceIcon: "A", category: "Design", publishedAt: "2026-07-06T12:00:00Z", imageUrl: null, readTime: 7, boardIds: [] },

  // ── Brown ─────────────────────────────────────────────────────────────────
  { id: "29", title: "Brown Engineers Develop Self-Healing Concrete That Repairs Cracks Autonomously", summary: "A team at Brown's School of Engineering embedded bacteria-laden microcapsules into concrete mix, enabling structures to seal hairline fractures without human intervention.", source: "Brown Engineering", sourceIcon: "B", category: "Science", publishedAt: "2026-07-09T09:00:00Z", imageUrl: null, readTime: 5, boardIds: [] },
  { id: "30", title: "New Quantum Sensing Lab Opens at Brown, Targeting Medical Imaging Breakthroughs", summary: "Funded by a $14M NSF grant, the lab will pursue atom-scale sensors capable of detecting neural activity without the bulk of an MRI machine.", source: "Brown Engineering", sourceIcon: "B", category: "Science", publishedAt: "2026-07-07T10:00:00Z", imageUrl: imgStudent, readTime: 4, boardIds: [] },
  { id: "31", title: "Literary Arts at Brown Announces 2026–27 Writers-in-Residence", summary: "This year's cohort includes a Booker-longlisted novelist, a Pulitzer-finalist poet, and a graphic memoirist whose debut sold half a million copies.", source: "Brown Literary Arts", sourceIcon: "B", category: "Culture", publishedAt: "2026-07-08T13:00:00Z", imageUrl: null, readTime: 3, boardIds: [] },
  { id: "32", title: "The Essay as Resistance: Brown's Literary Arts Festival Recap", summary: "Four days of readings, workshops, and arguments about what literature owes the present moment — and whether form can ever be neutral.", source: "Brown Literary Arts", sourceIcon: "B", category: "Culture", publishedAt: "2026-07-05T11:00:00Z", imageUrl: imgAuditorium, readTime: 6, boardIds: [] },
  { id: "33", title: "Brown Bears Men's Basketball Signs Two Top-20 Recruits Ahead of Ivy Season", summary: "Head coach Bilal Abdur-Rahim lands the program's highest-ranked recruiting class in a decade, with one prospect turning down Power Five offers.", source: "Brown Athletics", sourceIcon: "B", category: "Sports", publishedAt: "2026-07-09T08:00:00Z", imageUrl: null, readTime: 3, boardIds: [] },
  { id: "34", title: "Brown Women's Rowing Finishes Second at Eastern Sprints", summary: "The varsity eight came within 0.4 seconds of their first Eastern Sprints title, setting a program record in the process.", source: "Brown Athletics", sourceIcon: "B", category: "Sports", publishedAt: "2026-07-06T15:00:00Z", imageUrl: imgGraduation, readTime: 2, boardIds: [] },

  // ── Graphic Design ────────────────────────────────────────────────────────
  { id: "35", title: "The Political Poster Is Having Its Most Urgent Moment in Decades", summary: "AIGA Eye on Design traces how a new generation of graphic designers is reclaiming protest imagery — and why the silkscreen is back.", source: "AIGA Eye on Design", sourceIcon: "A", category: "Design", publishedAt: "2026-07-09T08:30:00Z", imageUrl: null, readTime: 6, boardIds: [] },
  { id: "36", title: "Type Designers Are Finally Getting Credit — and Paid", summary: "Eye on Design profiles the foundries and independent designers reshaping how the industry values letterform work, one license at a time.", source: "AIGA Eye on Design", sourceIcon: "A", category: "Design", publishedAt: "2026-07-07T11:00:00Z", imageUrl: imgAGI, readTime: 5, boardIds: [] },
  { id: "37", title: "Designing for Cognitive Accessibility: Beyond the Checklist", summary: "Smashing Magazine's deep dive into the gap between WCAG compliance and genuinely usable interfaces for people with cognitive differences.", source: "Smashing Magazine", sourceIcon: "S", category: "Design", publishedAt: "2026-07-09T07:00:00Z", imageUrl: imgPinModal, readTime: 9, boardIds: [] },
  { id: "38", title: "CSS in 2026: What Actually Shipped and What We're Still Waiting For", summary: "A practical survey of the layout, animation, and scoping features that landed this year — and an honest look at browser support reality.", source: "Smashing Magazine", sourceIcon: "S", category: "Technology", publishedAt: "2026-07-08T08:00:00Z", imageUrl: null, readTime: 7, boardIds: [] },
  { id: "39", title: "The Web Is a Place, Not a Pipe", summary: "A List Apart's landmark essay on why treating the web as a delivery mechanism destroyed a decade of design culture — and how to rebuild it.", source: "A List Apart", sourceIcon: "A", category: "Design", publishedAt: "2026-07-06T09:00:00Z", imageUrl: null, readTime: 8, boardIds: [] },
  { id: "40", title: "Content-First Design Is Not a Phase", summary: "A List Apart argues that the industry's return to content strategy isn't a trend — it's a reckoning with fifteen years of component-driven thinking.", source: "A List Apart", sourceIcon: "A", category: "Design", publishedAt: "2026-07-05T10:00:00Z", imageUrl: null, readTime: 6, boardIds: [] },

  // ── Educational YouTube ───────────────────────────────────────────────────
  { id: "41", title: "The Most Beautiful Equation in Mathematics", summary: "MIT OpenCourseWare breaks down Euler's identity — why it connects the five most important constants in math and what it reveals about the nature of complex numbers.", source: "MIT OpenCourseWare", sourceIcon: "M", category: "Science", publishedAt: "2026-07-09T10:00:00Z", imageUrl: null, readTime: 14, boardIds: [] },
  { id: "42", title: "Justice: What's the Right Thing to Do? — Full Lecture", summary: "Harvard's Michael Sandel returns with a live lecture on trolley problems, moral luck, and why political philosophy is never just academic.", source: "Harvard University", sourceIcon: "H", category: "Culture", publishedAt: "2026-07-08T15:00:00Z", imageUrl: null, readTime: 52, boardIds: [] },
  { id: "43", title: "Andrew Ng: AI Is the New Electricity", summary: "Stanford's landmark lecture on how machine learning will restructure every industry — updated with 2026 examples from healthcare, logistics, and education.", source: "Stanford", sourceIcon: "S", category: "Technology", publishedAt: "2026-07-07T12:00:00Z", imageUrl: null, readTime: 38, boardIds: [] },
  { id: "44", title: "The Danger of a Single Story — Chimamanda Ngozi Adichie", summary: "One of TED's most-watched talks ever, remastered. Adichie on how the stories we tell shape the people we allow others to become.", source: "TED", sourceIcon: "T", category: "Culture", publishedAt: "2026-07-09T08:00:00Z", imageUrl: null, readTime: 19, boardIds: [] },
  { id: "45", title: "How Algorithms Shape Our World", summary: "TED-Ed's animated explainer on recommendation systems, filter bubbles, and the invisible math that decides what you see next.", source: "TED-Ed", sourceIcon: "T", category: "Technology", publishedAt: "2026-07-08T11:00:00Z", imageUrl: null, readTime: 11, boardIds: [] },
  { id: "46", title: "The History of the Universe in 10 Minutes", summary: "Crash Course Astronomy condenses 13.8 billion years into a single episode — from the Big Bang to the formation of Earth's first oceans.", source: "Crash Course", sourceIcon: "C", category: "Science", publishedAt: "2026-07-07T09:00:00Z", imageUrl: null, readTime: 12, boardIds: [] },
  { id: "47", title: "Intro to Linear Algebra — Vectors and Spaces", summary: "Khan Academy's most-watched math series updated for 2026, now with interactive exercises and AI-generated practice problems.", source: "Khan Academy", sourceIcon: "K", category: "Science", publishedAt: "2026-07-06T10:00:00Z", imageUrl: imgBrownConvocation, readTime: 24, boardIds: [] },
  { id: "48", title: "Why Does the Earth Spin?", summary: "Veritasium's Derek Muller travels to three continents to answer one deceptively simple question — with an experiment you can do in your kitchen.", source: "Veritasium", sourceIcon: "V", category: "Science", publishedAt: "2026-07-09T07:30:00Z", imageUrl: null, readTime: 21, boardIds: [] },
  { id: "49", title: "But What Is a Neural Network?", summary: "3Blue1Brown's definitive visual guide to deep learning — updated with transformer architecture explanations and the intuition behind attention mechanisms.", source: "3Blue1Brown", sourceIcon: "3", category: "Technology", publishedAt: "2026-07-08T14:00:00Z", imageUrl: imgLaptopCanvas, readTime: 27, boardIds: [] },
  { id: "50", title: "The Riemann Hypothesis — Numberphile Explains", summary: "A million-dollar problem that has stumped mathematicians for 167 years, explained with felt-tip pens and genuine excitement by Professor Edward Frenkel.", source: "Numberphile", sourceIcon: "N", category: "Science", publishedAt: "2026-07-07T16:00:00Z", imageUrl: null, readTime: 18, boardIds: [] },
  { id: "51", title: "How Does the Internet Actually Work?", summary: "Computerphile traces a single HTTP request from your browser to a server farm and back — routers, DNS, TLS handshakes, and all.", source: "Computerphile", sourceIcon: "C", category: "Technology", publishedAt: "2026-07-06T13:00:00Z", imageUrl: null, readTime: 16, boardIds: [] },
  { id: "52", title: "How a Gun Silencer Actually Works — Slow Motion", summary: "Smarter Every Day's Destin Sandlin films a suppressor at 100,000 fps. The results challenge almost everything the movies taught you.", source: "Smarter Every Day", sourceIcon: "S", category: "Science", publishedAt: "2026-07-09T06:00:00Z", imageUrl: null, readTime: 15, boardIds: [] },
  { id: "53", title: "Why Earth Will Eventually Lose Its Oxygen", summary: "Kurzgesagt's latest doomsday explainer — surprisingly comforting once you understand the billion-year timeline involved.", source: "Kurzgesagt", sourceIcon: "K", category: "Environment", publishedAt: "2026-07-08T10:00:00Z", imageUrl: null, readTime: 13, boardIds: [] },
  { id: "54", title: "How Do Suspension Bridges Actually Stand Up?", summary: "Practical Engineering breaks down the physics of cable tension, deck flexibility, and why the Tacoma Narrows collapsed — so no bridge ever has to again.", source: "Practical Engineering", sourceIcon: "P", category: "Science", publishedAt: "2026-07-07T11:00:00Z", imageUrl: null, readTime: 20, boardIds: [] },
  { id: "55", title: "Do Black Holes Actually Exist?", summary: "PBS Space Time's most-requested episode returns — updated with 2026 Event Horizon Telescope data and a deep dive into the information paradox.", source: "PBS Space Time", sourceIcon: "P", category: "Science", publishedAt: "2026-07-09T09:00:00Z", imageUrl: null, readTime: 31, boardIds: [] },

  // ── AI / LLM ──────────────────────────────────────────────────────────────
  { id: "56", title: "GPT-5 System Card: What OpenAI Published and What It Means", summary: "OpenAI's YouTube team walks through the full capability and safety evaluation of GPT-5, including red-team findings and new refusal behaviors.", source: "OpenAI", sourceIcon: "O", category: "Technology", publishedAt: "2026-07-09T11:00:00Z", imageUrl: null, readTime: 25, boardIds: [] },
  { id: "57", title: "Claude 4 Constitutional AI — How Values Get Into the Model", summary: "Anthropic researchers explain the RLHF pipeline, Constitutional AI updates, and why they believe interpretability is now an existential priority.", source: "Anthropic", sourceIcon: "A", category: "Technology", publishedAt: "2026-07-08T13:00:00Z", imageUrl: null, readTime: 34, boardIds: [] },
  { id: "58", title: "Gemini Ultra 2 vs. the World — DeepMind's Benchmark Deep Dive", summary: "Google DeepMind's research team explains which benchmarks matter, which don't, and what Gemini Ultra 2 actually does differently under the hood.", source: "Google DeepMind", sourceIcon: "G", category: "Technology", publishedAt: "2026-07-07T10:00:00Z", imageUrl: null, readTime: 29, boardIds: [] },

  // ── Semis & Consumer ──────────────────────────────────────────────────────
  { id: "59", title: "NVIDIA Blackwell Ultra Architecture Explained", summary: "NVIDIA's engineering team walks through the GB300's new transformer engine, HBM4 memory subsystem, and why inference efficiency tripled.", source: "NVIDIA", sourceIcon: "N", category: "Technology", publishedAt: "2026-07-09T08:30:00Z", imageUrl: null, readTime: 22, boardIds: [] },
  { id: "60", title: "Figma AI: How We Built Generative UI Into the Editor", summary: "Figma's design and engineering leads demo the new AI features live — component generation, auto-layout inference, and the model behind Make.", source: "Figma", sourceIcon: "F", category: "Design", publishedAt: "2026-07-08T09:00:00Z", imageUrl: imgDocCanvas, readTime: 18, boardIds: [] },
  { id: "61", title: "Adobe Firefly 4: What's New for Creative Professionals", summary: "Adobe's product team demonstrates Firefly 4's new video generation, 3D compositing tools, and the commercial licensing framework that makes it enterprise-safe.", source: "Adobe", sourceIcon: "A", category: "Design", publishedAt: "2026-07-07T14:00:00Z", imageUrl: null, readTime: 16, boardIds: [] },
];

const INITIAL_BOARDS: Board[] = [
  { id: "b1", name: "Weekend Reads",        articleIds: [], emoji: "📚" },
  { id: "b2", name: "Work Research",         articleIds: [], emoji: "💼" },
  { id: "b3", name: "Inspiration",           articleIds: [], emoji: "✨" },
  { id: "b4", name: "Design & Architecture", articleIds: [], emoji: "🏛" },
  { id: "b5", name: "Brown",                 articleIds: [], emoji: "🐻" },
  { id: "b6", name: "Graphic Design",        articleIds: [], emoji: "✏️" },
  { id: "b7", name: "Educational Videos",    articleIds: ["41","42","43","44","45","46","47","48","49","50","51","52","53","54","55"], emoji: "🎓" },
  { id: "b8", name: "AI & LLM",             articleIds: ["56","57","58"], emoji: "🤖" },
  { id: "b9", name: "Tech & Design",         articleIds: ["59","60","61"], emoji: "💻" },
];

const BOARD_EMOJIS = ["📚", "💼", "✨", "🔬", "🎨", "🌿", "🏛", "💡"];

// ─── Utilities ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatArticleDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function makeArticleBreakdown(article: Article): string[] {
  const topic = article.category.toLowerCase();
  return [
    `${article.source} frames this as a ${topic} signal worth watching now.`,
    article.summary,
    `The useful question: what changes if this trend becomes normal over the next ${Math.max(2, Math.round(article.readTime / 2))} months?`,
  ];
}

function makeArticleTimetable(article: Article): Array<{ label: string; detail: string }> {
  const minuteOne = Math.max(1, Math.floor(article.readTime * 0.25));
  const minuteTwo = Math.max(minuteOne + 1, Math.floor(article.readTime * 0.62));
  return [
    { label: "0 min", detail: "Orient around the headline and source context." },
    { label: `${minuteOne} min`, detail: "Scan the claim, evidence, and named actors." },
    { label: `${minuteTwo} min`, detail: "Pull one connection into a board or Made Space." },
    { label: `${article.readTime} min`, detail: "Decide whether this is worth saving, sharing, or revisiting." },
  ];
}

function makeSelectionArticle(text: string, boardId: string): Article {
  const normalized = text.replace(/\s+/g, " ").trim();
  const title = normalized.length > 92 ? `${normalized.slice(0, 92).trim()}...` : normalized;
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;

  return {
    id: `clip-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    title,
    summary: normalized,
    source: "Selected text",
    sourceIcon: "T",
    category: "Clipping",
    publishedAt: new Date().toISOString(),
    imageUrl: null,
    readTime: Math.max(1, Math.ceil(wordCount / 220)),
    boardIds: [boardId],
  };
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

function Onboarding({ onComplete }: { onComplete: (interests: string[], name: string) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (cat: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  // All colors hardcoded — onboarding is always light regardless of app dark mode
  const C = {
    bg: "#f5f5f7",
    ink: "#1C1B18",
    muted: "#8a8a8e",
    card: "rgba(255,255,255,0.55)",
    pill: "#ECEAE4",
    pillOn: "#1C1B18",
    border: "rgba(28,27,24,0.15)",
    borderFocus: "rgba(28,27,24,0.5)",
    dot: "rgba(28,27,24,0.12)",
  };

  const bgCards = [
    { w: 190, h: 230, left: "3%",  top: "5%",  rotate: -3   },
    { w: 150, h: 180, left: "80%", top: "8%",  rotate: 2    },
    { w: 170, h: 210, left: "74%", top: "58%", rotate: -1.5 },
    { w: 140, h: 160, left: "12%", top: "62%", rotate: 1.5  },
    { w: 210, h: 150, left: "42%", top: "76%", rotate: -2   },
    { w: 130, h: 180, left: "88%", top: "36%", rotate: 3    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: C.bg, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle, ${C.dot} 1.5px, transparent 1.5px)`, backgroundSize: "28px 28px" }}
      />

      {/* Floating card decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {bgCards.map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute", width: c.w, height: c.h,
              left: c.left, top: c.top,
              transform: `rotate(${c.rotate}deg)`,
              background: C.card,
              borderRadius: 18,
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              border: "1.5px solid rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              opacity: 0.75,
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div
        style={{
          position: "relative", zIndex: 10, display: "flex",
          alignItems: "center", justifyContent: "center",
          height: "100%", padding: "0 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 44 }}>
            <img
              src={logoSvg}
              alt="Made Space"
              style={{ width: 36, height: 36, objectFit: "contain", filter: "brightness(0) opacity(0.65)" }}
            />
            <span style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>
              Made Space
            </span>
          </div>

          {step === 0 && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, marginBottom: 16 }}>
                Welcome
              </p>
              <h1 style={{ fontSize: 48, lineHeight: 1.12, color: C.ink, fontWeight: 600, margin: "0 0 20px" }}>
                Your news,<br />your space.
              </h1>
              <p style={{ color: C.muted, lineHeight: 1.6, margin: "0 0 36px", fontSize: 15 }}>
                Articles from across the web, curated to you.<br />What should we call you?
              </p>
              <input
                type="text"
                placeholder="Your name..."
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && name.trim() && setStep(1)}
                autoFocus
                style={{
                  display: "block", width: "100%", boxSizing: "border-box",
                  background: "transparent",
                  border: "none", borderBottom: `2px solid ${C.border}`,
                  outline: "none", padding: "12px 0", fontSize: 24,
                  color: C.ink, marginBottom: 28,
                  fontFamily: "inherit",
                }}
                onFocus={e => (e.target.style.borderBottomColor = C.borderFocus)}
                onBlur={e => (e.target.style.borderBottomColor = C.border)}
              />
              <button
                onClick={() => name.trim() && setStep(1)}
                disabled={!name.trim()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: name.trim() ? C.ink : C.pill,
                  color: name.trim() ? "#fff" : C.muted,
                  padding: "12px 24px", borderRadius: 99, fontSize: 14,
                  fontWeight: 500, border: "none", cursor: name.trim() ? "pointer" : "default",
                  transition: "all 0.2s", fontFamily: "inherit",
                  opacity: name.trim() ? 1 : 0.5,
                }}
              >
                Continue <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          )}

          {step === 1 && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, marginBottom: 16 }}>
                Step 2 of 2
              </p>
              <h1 style={{ fontSize: 48, lineHeight: 1.12, color: C.ink, fontWeight: 600, margin: "0 0 12px" }}>
                What moves<br />you, {name}?
              </h1>
              <p style={{ color: C.muted, lineHeight: 1.6, margin: "0 0 28px", fontSize: 15 }}>
                Pick at least 3 topics to shape your feed.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
                {CATEGORIES.map(cat => {
                  const isOn = selected.has(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggle(cat)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "10px 18px", borderRadius: 99, fontSize: 13,
                        fontWeight: 500, border: "none", cursor: "pointer",
                        background: isOn ? C.pillOn : C.pill,
                        color: isOn ? "#fff" : C.ink,
                        transition: "all 0.15s", fontFamily: "inherit",
                        transform: "scale(1)",
                      }}
                    >
                      <span>{CATEGORY_EMOJI[cat]}</span>
                      {cat}
                      {isOn && <Check style={{ width: 12, height: 12 }} />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => selected.size >= 3 && onComplete(Array.from(selected), name)}
                disabled={selected.size < 3}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: selected.size >= 3 ? C.ink : C.pill,
                  color: selected.size >= 3 ? "#fff" : C.muted,
                  padding: "12px 24px", borderRadius: 99, fontSize: 14,
                  fontWeight: 500, border: "none",
                  cursor: selected.size >= 3 ? "pointer" : "default",
                  opacity: selected.size >= 3 ? 1 : 0.5,
                  transition: "all 0.2s", fontFamily: "inherit",
                }}
              >
                Open my space <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
              {selected.size < 3 && (
                <p style={{ fontSize: 12, color: C.muted, marginTop: 12 }}>
                  {3 - selected.size} more to go
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: rgba(28,27,24,0.3); }
      `}</style>
    </div>
  );
}

// ─── Article Card ─────────────────────────────────────────────────────────────

function GlobalSelectionToolbar({
  selection, boards, selectedBoardId, onSelectedBoardChange, onSave,
}: {
  selection: TextSelectionState | null;
  boards: Board[];
  selectedBoardId: string;
  onSelectedBoardChange: (boardId: string) => void;
  onSave: () => void;
}) {
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const targetBoard = boards.find(board => board.id === selectedBoardId) ?? boards[0];
  if (!selection || !targetBoard) return null;

  return (
    <div
      className="fixed z-[2147482998] flex items-center gap-1 rounded-full border border-black/10 bg-white/90 p-1 text-[#1c1b18] backdrop-blur-xl dark:border-white/10 dark:bg-[#1c1c1e]/92 dark:text-white"
      style={{
        top: selection.top,
        left: selection.left,
        transform: "translateX(-50%)",
      }}
      data-selection-toolbar
      onMouseDown={event => event.preventDefault()}
    >
      <button
        onClick={() => {
          setBoardMenuOpen(false);
          onSave();
        }}
        className="flex h-9 items-center gap-2 rounded-full bg-[#1c1b18] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-black dark:bg-white dark:text-[#1c1b18] dark:hover:bg-white/85"
      >
        <Plus className="h-3.5 w-3.5" />
        Save to {targetBoard.name} board
      </button>
      <div className="relative">
        <button
          onClick={() => setBoardMenuOpen(open => !open)}
          className="flex h-9 max-w-[160px] items-center gap-1.5 rounded-full bg-black/[0.04] px-2.5 text-xs font-medium transition-colors hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12]"
          aria-label="Choose board for selected text"
          aria-expanded={boardMenuOpen}
        >
          <span className="truncate">{targetBoard.emoji} {targetBoard.name}</span>
          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${boardMenuOpen ? "rotate-90" : ""}`} />
        </button>
        {boardMenuOpen && (
          <div className="absolute right-0 top-11 z-[2147483000] max-h-72 min-w-[220px] overflow-y-auto rounded-2xl border border-black/10 bg-white py-1.5 text-[#1c1b18] shadow-[0_16px_44px_rgba(0,0,0,.16)] dark:border-white/10 dark:bg-[#242426] dark:text-white">
            {boards.map(board => {
              const active = board.id === targetBoard.id;
              return (
                <button
                  key={board.id}
                  onClick={() => {
                    onSelectedBoardChange(board.id);
                    setBoardMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                    active ? "text-foreground dark:text-white" : "text-muted-foreground hover:bg-[var(--app-highlight)] hover:text-foreground dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  <span className="text-base">{board.emoji}</span>
                  <span className="min-w-0 flex-1 truncate">{board.name}</span>
                  <span className="text-xs opacity-45">{board.articleIds.length}</span>
                  {active && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedPinMenu({
  state, article, boards, onClose, onAddToBoard, onRemoveFromBoard,
}: {
  state: PinMenuState | null;
  article: Article | null;
  boards: Board[];
  onClose: () => void;
  onAddToBoard: (articleId: string, boardId: string) => void;
  onRemoveFromBoard: (articleId: string, boardId: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state) return;
    const handler = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [state, onClose]);

  if (!state || !article) return null;

  return (
    <div
      ref={menuRef}
      className="pin-menu fixed z-[2147483000] min-w-[190px] rounded-xl bg-white py-1.5 dark:bg-[#2c2c2e]"
      style={{
        top: state.top,
        right: state.right,
        maxHeight: state.maxHeight,
        overflowY: "auto",
      }}
      onMouseDown={event => event.stopPropagation()}
    >
      <p className="px-3 pb-1.5 pt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {article.boardIds.length > 0 ? "Pinned to" : "Pin to board"}
      </p>
      {boards.map(board => {
        const inBoard = board.articleIds.includes(article.id);
        return (
          <button
            key={board.id}
            onClick={() => {
              if (inBoard) onRemoveFromBoard(article.id, board.id);
              else onAddToBoard(article.id, board.id);
              onClose();
            }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--app-highlight)] ${
              inBoard ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-base flex-shrink-0">{board.emoji}</span>
            <span className="flex-1 truncate">{board.name}</span>
            {inBoard
              ? <Check className="w-3 h-3 text-blue-500 flex-shrink-0" />
              : <Plus className="w-3 h-3 opacity-30 flex-shrink-0" />
            }
          </button>
        );
      })}
    </div>
  );
}

function TopicManagerModal({
  topics,
  draftTopics,
  onToggle,
  onSave,
  onClose,
}: {
  topics: string[];
  draftTopics: string[];
  onToggle: (topic: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const selected = new Set(draftTopics);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[2147482000] flex items-center justify-center bg-black/45 p-4 backdrop-blur-md"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Edit topics"
    >
      <div
        className="w-full max-w-[540px] rounded-2xl border border-border bg-card p-5 text-foreground"
        onMouseDown={event => event.stopPropagation()}
        style={{ animation: "floatIn 0.18s ease both" }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Edit topics</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap a topic to keep or remove it from your feed.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[var(--app-highlight)] hover:text-foreground"
            aria-label="Close topic editor"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {topics.map(topic => {
            const active = selected.has(topic);
            return (
              <button
                key={topic}
                onClick={() => onToggle(topic)}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "border-foreground bg-foreground text-background hover:bg-foreground/90"
                    : "border-border bg-[var(--app-highlight)] text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                }`}
                aria-pressed={active}
              >
                <span>{CATEGORY_EMOJI[topic]}</span>
                <span>{topic}</span>
                {active ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5 opacity-55" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            Save topics
          </button>
          <button
            onClick={onClose}
            className="h-11 rounded-full border border-border px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[var(--app-highlight)] hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticleDetailModal({
  article, boards, readingId, onClose, onReadAloud, onAddToBoard, onRemoveFromBoard,
}: {
  article: Article;
  boards: Board[];
  readingId: string | null;
  onClose: () => void;
  onReadAloud: (article: Article) => void;
  onAddToBoard: (articleId: string, boardId: string) => void;
  onRemoveFromBoard: (articleId: string, boardId: string) => void;
}) {
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isReading = readingId === article.id;
  const isPinned = article.boardIds.length > 0;
  const breakdown = makeArticleBreakdown(article);
  const timetable = makeArticleTimetable(article);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setBoardMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`${article.title} details`}
      onMouseDown={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-[#f7f7f8] text-[#1c1b18] dark:bg-[#171719] dark:text-white"
        onMouseDown={event => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/75 text-[#1c1b18] transition-colors hover:bg-white dark:bg-black/45 dark:text-white dark:hover:bg-black/65"
          aria-label="Close article details"
        >
          <X className="h-4 w-4" />
        </button>

        {article.imageUrl && (
          <div className="relative h-[220px] overflow-hidden bg-[#e9e9eb] sm:h-[300px]">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="h-full w-full object-cover"
              style={{ objectPosition: article.imagePosition ?? "center" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25" />
            <span className="absolute left-5 top-5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
              {article.category}
            </span>
          </div>
        )}

        <div className="overflow-y-auto px-5 pb-5 pt-5 sm:px-8 sm:pb-8 sm:pt-7">
          {!article.imageUrl && (
            <span className="mb-5 inline-flex rounded-full bg-[#1c1b18] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white dark:bg-white dark:text-[#1c1b18]">
              {article.category}
            </span>
          )}

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
            <div>
              <h2 className="max-w-2xl text-[30px] font-semibold leading-[1.08] tracking-normal sm:text-[40px]">
                {article.title}
              </h2>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#77736d] dark:text-white/55">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#1c1b18] text-[10px] font-bold text-white dark:bg-white dark:text-[#1c1b18]">
                  {article.sourceIcon}
                </span>
                <span className="font-medium text-[#2d2c29] dark:text-white/80">{article.source}</span>
                <span>{timeAgo(article.publishedAt)}</span>
                <span>{article.readTime} min read</span>
                <span>{formatArticleDate(article.publishedAt)}</span>
              </div>

              <p className="mt-7 max-w-2xl text-[17px] font-medium leading-relaxed text-[#3a3834] dark:text-white/82">
                {article.summary}
              </p>

              <div className="mt-8 border-t border-black/10 pt-6 dark:border-white/10">
                <div className="mb-4 flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-[#77736d] dark:text-white/55" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#77736d] dark:text-white/55">
                    Breakdown
                  </h3>
                </div>
                <div className="space-y-3">
                  {breakdown.map((item, index) => (
                    <div key={item} className="flex gap-3 rounded-2xl bg-white/55 p-3 dark:bg-white/[0.06]">
                      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#1c1b18] text-[11px] font-semibold text-white dark:bg-white dark:text-[#1c1b18]">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-[#4d4943] dark:text-white/68">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl bg-white/60 p-4 dark:bg-white/[0.06]">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#77736d] dark:text-white/55" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#77736d] dark:text-white/55">
                    Timetable
                  </h3>
                </div>
                <div className="space-y-4">
                  {timetable.map((item, index) => (
                    <div key={`${item.label}-${item.detail}`} className="grid grid-cols-[56px_1fr] gap-3">
                      <div className="text-xs font-semibold text-[#1c1b18] dark:text-white">{item.label}</div>
                      <div className="relative pb-4 text-sm leading-relaxed text-[#66615b] dark:text-white/62">
                        {index < timetable.length - 1 && (
                          <span className="absolute -left-[18px] top-2 h-full w-px bg-black/10 dark:bg-white/12" />
                        )}
                        <span className="absolute -left-[22px] top-1.5 h-2 w-2 rounded-full bg-[#1c1b18] dark:bg-white" />
                        {item.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onReadAloud(article)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white/65 px-4 text-sm font-medium transition-colors hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
                >
                  {isReading ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {isReading ? "Stop" : "Listen"}
                </button>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setBoardMenuOpen(value => !value)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white/65 px-4 text-sm font-medium transition-colors hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
                  >
                    <Plus className="h-4 w-4" />
                    {isPinned ? "Saved" : "Save"}
                  </button>

                  {boardMenuOpen && (
                    <div className="absolute bottom-12 left-0 z-20 min-w-[210px] rounded-2xl bg-white py-1.5 dark:bg-[#2c2c2e]">
                      {boards.map(board => {
                        const inBoard = board.articleIds.includes(article.id);
                        return (
                          <button
                            key={board.id}
                            onClick={() => {
                              if (inBoard) onRemoveFromBoard(article.id, board.id);
                              else onAddToBoard(article.id, board.id);
                              setBoardMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#1c1b18] transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
                          >
                            <span>{board.emoji}</span>
                            <span className="flex-1 truncate">{board.name}</span>
                            {inBoard ? <Check className="h-3 w-3 text-blue-500" /> : <Plus className="h-3 w-3 opacity-35" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {article.url && (
                  <button
                    onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1c1b18] px-4 text-sm font-medium text-white transition-colors hover:bg-black dark:bg-white dark:text-[#1c1b18] dark:hover:bg-white/85"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open source
                  </button>
                )}
              </div>

              <div className="rounded-3xl border border-black/10 p-4 dark:border-white/10">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="h-4 w-4" />
                  Reading cue
                </div>
                <p className="text-sm leading-relaxed text-[#66615b] dark:text-white/62">
                  Save this into a board if it adds a useful angle, not just because it looks interesting.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({
  article, readingId, onReadAloud, onOpenDetail, onOpenPinMenu, pinMenuOpen,
}: {
  article: Article; readingId: string | null;
  onReadAloud: (article: Article) => void;
  onOpenDetail: (article: Article) => void;
  onOpenPinMenu: (article: Article, rect: DOMRect) => void;
  pinMenuOpen: boolean;
}) {
  const [justPinned, setJustPinned] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const isReading = readingId === article.id;
  const isPinned = article.boardIds.length > 0;
  const wasPinned = useRef(isPinned);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!wasPinned.current && isPinned) {
      setJustPinned(true);
      timer = setTimeout(() => setJustPinned(false), 700);
    }
    wasPinned.current = isPinned;
    return () => timer && clearTimeout(timer);
  }, [isPinned]);

  return (
    <div
      className="group rounded-2xl overflow-visible hover:-translate-y-0.5 transition-transform duration-200 cursor-pointer break-inside-avoid mb-4 bg-[#f5f5f7] dark:bg-[#2c2c2e]"
      onClick={() => onOpenDetail(article)}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetail(article);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${article.title}`}
    >
      {article.imageUrl && !imageFailed && (
        <div
          className="relative overflow-hidden rounded-t-2xl bg-muted"
          style={{ aspectRatio: article.imageAspect ?? (["4 / 3", "4 / 5", "1 / 1"][parseInt(article.id) % 3]) }}
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.035] transition-transform duration-700 ease-out"
            style={{ objectPosition: article.imagePosition ?? "center" }}
            loading={parseInt(article.id) <= 7 ? "eager" : "lazy"}
            decoding="async"
            onError={() => setImageFailed(true)}
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/20 opacity-80" />
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="text-[9px] tracking-[0.14em] uppercase px-2.5 py-1.5 rounded-full text-white font-semibold border border-white/15"
              style={{ backgroundColor: "rgba(12,12,12,0.48)", backdropFilter: "blur(12px)" }}>
              {article.category}
            </span>
          </div>
          {/* Read aloud on image hover */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={e => { e.stopPropagation(); onReadAloud(article); }}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: isReading ? "#fff" : "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", color: isReading ? "#000" : "#fff" }}
              title="Read aloud"
            >
              {isReading ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-2.5">
        {(!article.imageUrl || imageFailed) && (
          <span className="inline-flex items-center gap-1 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full text-white font-medium"
            style={{ backgroundColor: "#1C1B18" }}>
            {CATEGORY_EMOJI[article.category]} {article.category}
          </span>
        )}

        <h3 className="text-[15px] font-medium leading-snug text-foreground line-clamp-3">
          {article.title}
        </h3>

        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
          {article.summary}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
              style={{ backgroundColor: "#1C1B18" }}>
              {article.sourceIcon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium truncate leading-none">{article.source}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {timeAgo(article.publishedAt)} · {article.readTime} min read
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!article.imageUrl && (
              <button
                onClick={e => { e.stopPropagation(); onReadAloud(article); }}
                className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                  isReading ? "text-foreground bg-muted" : "text-muted-foreground hover:bg-[var(--app-highlight)] hover:text-foreground"
                }`}
                title="Read aloud"
              >
                {isReading ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Pin button — always visible */}
            <div className="relative">
              <button
                onClick={e => {
                  e.stopPropagation();
                  onOpenPinMenu(article, e.currentTarget.getBoundingClientRect());
                }}
                className={`pin-btn ${justPinned ? "pin-confirmed" : ""}`}
                data-pinned={isPinned ? "true" : "false"}
                data-open={pinMenuOpen ? "true" : "false"}
                aria-pressed={isPinned}
                aria-label={isPinned ? "Manage saved boards" : "Save to a board"}
              >
                <span className="pin-aura" aria-hidden="true" />
                <div className="star-fill w-3.5 h-3.5 relative z-[1]">
                  <Star />
                </div>
              </button>
              <div className="pin-tooltip" role="tooltip">
                <span className={isPinned ? "pin-status-dot saved" : "pin-status-dot"} />
                {isPinned ? "Saved · Manage boards" : "Save to a board"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// BoardView is now CanvasBoard (imported from ./components/CanvasBoard)

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [hasOnboarded, setHasOnboarded]   = useState(false);
  const [userName, setUserName]           = useState("");
  const [interests, setInterests]         = useState<string[]>([]);
  const [articles, setArticles]           = useState<Article[]>(() => {
    const boardMap: Record<string, string[]> = {};
    for (const b of INITIAL_BOARDS) {
      for (const aid of b.articleIds) {
        if (!boardMap[aid]) boardMap[aid] = [];
        boardMap[aid].push(b.id);
      }
    }
    return MOCK_ARTICLES.map(a => boardMap[a.id] ? { ...a, boardIds: boardMap[a.id] } : a);
  });
  const [boards, setBoards]               = useState<Board[]>(INITIAL_BOARDS);
  const [activeBoard, setActiveBoard]     = useState<Board | null>(null);
  const [boardFullscreen, setBoardFullscreen] = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder]         = useState<SortOrder>("relevant");
  const [readingId, setReadingId]         = useState<string | null>(null);
  const [newBoardName, setNewBoardName]   = useState("");
  const [showNewBoard, setShowNewBoard]   = useState(false);
  const [darkMode, setDarkMode]           = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [sidebarBoardMenu, setSidebarBoardMenu] = useState<string | null>(null);
  const [sidebarRenaming, setSidebarRenaming]   = useState<string | null>(null);
  const [sidebarRenameVal, setSidebarRenameVal] = useState("");
  const [feedStatus, setFeedStatus] = useState<"loading" | "live" | "fallback">("loading");
  const [liveSourceCount, setLiveSourceCount] = useState(0);
  const [detailArticleId, setDetailArticleId] = useState<string | null>(null);
  const [textSelection, setTextSelection] = useState<TextSelectionState | null>(null);
  const [selectionBoardId, setSelectionBoardId] = useState(INITIAL_BOARDS[0]?.id ?? "");
  const [pinMenuState, setPinMenuState] = useState<PinMenuState | null>(null);
  const [topicManagerOpen, setTopicManagerOpen] = useState(false);
  const [topicDraft, setTopicDraft] = useState<string[]>([]);
  const sidebarRenameRef = useRef<HTMLInputElement>(null);
  const newBoardInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.documentElement.classList.toggle("dark", darkMode); }, [darkMode]);
  useEffect(() => { if (showNewBoard) newBoardInputRef.current?.focus(); }, [showNewBoard]);
  useEffect(() => { if (sidebarRenaming) sidebarRenameRef.current?.focus(); }, [sidebarRenaming]);
  useEffect(() => {
    let cancelled = false;
    const loadFeeds = async () => {
      try {
        const response = await fetch("/api/rss");
        if (!response.ok) throw new Error(`RSS request failed: ${response.status}`);
        const payload = await response.json();
        if (cancelled || !Array.isArray(payload.articles) || payload.articles.length === 0) return;
        setArticles(previous => {
          const pinnedCurated = previous.filter(article => article.boardIds.length > 0 && !article.isLive);
          const liveIds = new Set(payload.articles.map((article: Article) => article.id));
          return [
            ...payload.articles,
            ...pinnedCurated.filter(article => !liveIds.has(article.id)),
          ];
        });
        setLiveSourceCount(payload.sourceCount || 0);
        setFeedStatus("live");
      } catch {
        if (!cancelled) setFeedStatus("fallback");
      }
    };
    loadFeeds();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!sidebarBoardMenu) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-board-menu]")) setSidebarBoardMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sidebarBoardMenu]);

  useEffect(() => {
    if (activeBoard?.id) setSelectionBoardId(activeBoard.id);
  }, [activeBoard?.id]);

  useEffect(() => {
    if (!boards.some(board => board.id === selectionBoardId) && boards[0]) {
      setSelectionBoardId(boards[0].id);
    }
  }, [boards, selectionBoardId]);

  useEffect(() => {
    let frame = 0;
    const updateSelection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const selection = window.getSelection();
        const text = selection?.toString().replace(/\s+/g, " ").trim() ?? "";
        if (!selection || selection.rangeCount === 0 || text.length === 0) {
          setTextSelection(null);
          return;
        }

        const anchor = selection.anchorNode?.parentElement;
        if (anchor?.closest("[data-selection-toolbar]")) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const fallbackRect = range.getClientRects()[0];
        const targetRect = rect.width || rect.height ? rect : fallbackRect;
        if (!targetRect) {
          setTextSelection(null);
          return;
        }

        const toolbarWidth = 330;
        const left = Math.min(window.innerWidth - toolbarWidth / 2 - 10, Math.max(toolbarWidth / 2 + 10, targetRect.left + targetRect.width / 2));
        const above = targetRect.top - 52;
        const top = above > 8 ? above : targetRect.bottom + 10;
        setTextSelection({ text, left, top });
      });
    };

    document.addEventListener("selectionchange", updateSelection);
    document.addEventListener("mouseup", updateSelection);
    document.addEventListener("keyup", updateSelection);
    window.addEventListener("scroll", updateSelection, true);
    window.addEventListener("resize", updateSelection);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("selectionchange", updateSelection);
      document.removeEventListener("mouseup", updateSelection);
      document.removeEventListener("keyup", updateSelection);
      window.removeEventListener("scroll", updateSelection, true);
      window.removeEventListener("resize", updateSelection);
    };
  }, []);

  const handleOnboarding = (ints: string[], name: string) => {
    setInterests(ints); setUserName(name); setHasOnboarded(true);
  };

  const addToBoard = useCallback((articleId: string, boardId: string) => {
    setBoards(prev => prev.map(b =>
      b.id === boardId && !b.articleIds.includes(articleId)
        ? { ...b, articleIds: [...b.articleIds, articleId] } : b
    ));
    setArticles(prev => prev.map(a =>
      a.id === articleId && !a.boardIds.includes(boardId)
        ? { ...a, boardIds: [...a.boardIds, boardId] } : a
    ));
  }, []);

  const saveSelectionToBoard = useCallback(() => {
    const targetBoard = boards.find(board => board.id === selectionBoardId) ?? boards[0];
    const text = textSelection?.text.trim();
    if (!targetBoard || !text) return;

    const clipping = makeSelectionArticle(text, targetBoard.id);
    setArticles(prev => [clipping, ...prev]);
    setBoards(prev => prev.map(board =>
      board.id === targetBoard.id
        ? { ...board, articleIds: [clipping.id, ...board.articleIds] }
        : board
    ));
    setActiveBoard(prev => prev?.id === targetBoard.id
      ? { ...prev, articleIds: [clipping.id, ...prev.articleIds] }
      : prev
    );
    setTextSelection(null);
    window.getSelection()?.removeAllRanges();
  }, [boards, selectionBoardId, textSelection]);

  const removeFromBoard = useCallback((articleId: string, boardId: string) => {
    setBoards(prev => prev.map(b =>
      b.id === boardId ? { ...b, articleIds: b.articleIds.filter(id => id !== articleId) } : b
    ));
    setArticles(prev => prev.map(a =>
      a.id === articleId ? { ...a, boardIds: a.boardIds.filter(id => id !== boardId) } : a
    ));
  }, []);

  const openPinMenu = useCallback((article: Article, rect: DOMRect) => {
    const estimatedHeight = Math.min(340, 42 + boards.length * 38);
    const opensDown = rect.top < estimatedHeight + 20;
    setPinMenuState(current => current?.articleId === article.id ? null : {
      articleId: article.id,
      top: opensDown ? rect.bottom + 8 : Math.max(12, rect.top - estimatedHeight - 8),
      right: Math.max(12, window.innerWidth - rect.right),
      maxHeight: "min(340px, calc(100vh - 24px))",
    });
  }, [boards.length]);

  const handleReadAloud = useCallback((article: Article) => {
    if (!("speechSynthesis" in window)) return;
    if (readingId === article.id) { speechSynthesis.cancel(); setReadingId(null); return; }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${article.title}. ${article.summary}`);
    utterance.rate = 0.95;
    utterance.onend = () => setReadingId(null);
    speechSynthesis.speak(utterance);
    setReadingId(article.id);
  }, [readingId]);

  const createBoard = () => {
    if (!newBoardName.trim()) return;
    const idx = boards.length;
    setBoards(prev => [...prev, {
      id: `b${Date.now()}`, name: newBoardName.trim(), articleIds: [],
      emoji: BOARD_EMOJIS[idx % BOARD_EMOJIS.length],
    }]);
    setNewBoardName(""); setShowNewBoard(false);
  };

  const renameBoard = useCallback((boardId: string, newName: string) => {
    setBoards(prev => prev.map(b => b.id === boardId ? { ...b, name: newName } : b));
    setActiveBoard(prev => prev?.id === boardId ? { ...prev, name: newName } : prev);
  }, []);

  const deleteBoard = useCallback((boardId: string) => {
    setBoards(prev => prev.filter(b => b.id !== boardId));
    setArticles(prev => prev.map(a => ({ ...a, boardIds: a.boardIds.filter(id => id !== boardId) })));
    setActiveBoard(null);
    setBoardFullscreen(false);
  }, []);

  const openTopicManager = useCallback(() => {
    setTopicDraft(interests.length > 0 ? interests : CATEGORIES.slice(0, 6));
    setTopicManagerOpen(true);
  }, [interests]);

  const toggleTopicDraft = useCallback((topic: string) => {
    setTopicDraft(prev => prev.includes(topic)
      ? prev.filter(item => item !== topic)
      : [...prev, topic]
    );
  }, []);

  const saveTopicDraft = useCallback(() => {
    setInterests(topicDraft);
    if (selectedCategory && !topicDraft.includes(selectedCategory)) {
      setSelectedCategory(null);
    }
    setTopicManagerOpen(false);
  }, [selectedCategory, topicDraft]);

  const openBoard = useCallback((board: Board, forceFullscreen = false) => {
    setActiveBoard(board);
    setBoardFullscreen(forceFullscreen || window.innerWidth < 1180);
  }, []);

  useEffect(() => {
    if (!activeBoard || boardFullscreen) return;
    const handleResize = () => {
      if (window.innerWidth < 1180) setBoardFullscreen(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [activeBoard, boardFullscreen]);

  const filtered = articles
    .filter(a => {
      if (selectedCategory && a.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.source.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      if (sortOrder === "oldest") return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      const aS = interests.includes(a.category) ? 1 : 0;
      const bS = interests.includes(b.category) ? 1 : 0;
      if (bS !== aS) return bS - aS;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  const filterCategories = interests.length > 0 ? interests : CATEGORIES.slice(0, 6);
  const detailArticle = detailArticleId ? articles.find(article => article.id === detailArticleId) ?? null : null;
  const pinMenuArticle = pinMenuState ? articles.find(article => article.id === pinMenuState.articleId) ?? null : null;

  if (!hasOnboarded) return <PolishedOnboarding onComplete={handleOnboarding} />;

  return (
    <>
      <style>{`
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif; }
        :root { --app-highlight: #E7E7ED; --app-highlight-hover: #DEDEE7; }
        .dark { --app-highlight: #2c2c2e; --app-highlight-hover: #363638; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes floatIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes boardDrawerIn { from { opacity: 0; transform: translateX(22px) scale(.985); } to { opacity: 1; transform: translateX(0) scale(1); } }
        .pin-btn {
          position: relative;
          isolation: isolate;
          width: 36px;
          height: 36px;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          border: 1px solid rgba(28, 27, 24, 0.1);
          border-radius: 999px;
          color: #1c1b18;
          background: rgba(255, 255, 255, 0.52);
          box-shadow: none;
          cursor: pointer;
          touch-action: manipulation;
          transition: transform 180ms ease, border-color 220ms ease, background 220ms ease, color 220ms ease;
        }
        .pin-btn::before {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: inherit;
        }
        .pin-btn::after {
          content: "";
          position: absolute;
          inset: 1px;
          z-index: 0;
          border-radius: inherit;
          background: linear-gradient(145deg, rgba(255,255,255,.48), transparent 48%);
          pointer-events: none;
        }
        .pin-btn .star-fill { --fill-0: #85827b; transition: filter 220ms ease, transform 220ms cubic-bezier(.2,.8,.2,1); }
        .pin-btn:hover {
          transform: translateY(-1px) scale(1.025);
          border-color: rgba(28, 27, 24, 0.2);
          background: #fff;
        }
        .pin-btn:hover .star-fill { --fill-0: #171714; transform: scale(1.08); }
        .pin-btn:active { transform: translateY(0) scale(.91); transition-duration: 90ms; }
        .pin-btn:focus-visible { outline: 3px solid rgba(28, 27, 24, .18); outline-offset: 3px; }
        .pin-btn[data-open="true"] { transform: translateY(-1px); border-color: rgba(28,27,24,.26); background: #fff; }
        .pin-btn[data-pinned="true"] {
          border-color: #171714;
          background: #171714;
        }
        .pin-btn[data-pinned="true"] .star-fill {
          --fill-0: #fff;
          filter: none;
        }
        .pin-btn[data-pinned="true"]:hover { transform: translateY(-1px) scale(1.035); border-color: #11110f; background: #11110f; }
        .pin-aura {
          position: absolute;
          inset: -1px;
          z-index: -1;
          border-radius: inherit;
          border: 1.5px solid rgba(28,27,24,.4);
          opacity: 0;
          pointer-events: none;
        }
        .pin-btn.pin-confirmed .pin-aura { animation: pinAura 620ms cubic-bezier(.2,.75,.25,1) both; }
        .pin-btn.pin-confirmed .star-fill { animation: pinStarPop 520ms cubic-bezier(.2,.9,.25,1.25) both; }
        .pin-menu {
          z-index: 2147483000;
          transform-origin: 88% 0%;
          animation: pinMenuIn 180ms cubic-bezier(.2,.8,.2,1) both;
          border: 1px solid rgba(28,27,24,.08);
          box-shadow: 0 12px 34px rgba(0,0,0,.14);
        }
        .pin-tooltip {
          position: absolute;
          right: -2px;
          bottom: 45px;
          z-index: 2147482999;
          display: flex;
          align-items: center;
          gap: 7px;
          width: max-content;
          padding: 8px 10px;
          border: 1px solid rgba(28,27,24,.08);
          border-radius: 10px;
          color: #45433e;
          background: rgba(255,255,255,.94);
          box-shadow: 0 10px 28px rgba(28,27,24,.14), 0 2px 6px rgba(28,27,24,.06);
          backdrop-filter: blur(14px);
          font-size: 10px;
          font-weight: 550;
          letter-spacing: .01em;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateY(5px) scale(.97);
          transform-origin: 90% 100%;
          transition: opacity 160ms ease, transform 180ms cubic-bezier(.2,.8,.2,1), visibility 160ms;
        }
        .pin-tooltip::after {
          content: "";
          position: absolute;
          right: 14px;
          bottom: -4px;
          width: 8px;
          height: 8px;
          border-right: 1px solid rgba(28,27,24,.08);
          border-bottom: 1px solid rgba(28,27,24,.08);
          background: rgba(255,255,255,.94);
          transform: rotate(45deg);
        }
        .pin-btn:hover + .pin-tooltip,
        .pin-btn:focus-visible + .pin-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }
        .pin-btn[data-open="true"] + .pin-tooltip { opacity: 0; visibility: hidden; transform: translateY(5px) scale(.97); }
        .pin-status-dot { width: 6px; height: 6px; border-radius: 999px; background: #aaa8a2; box-shadow: 0 0 0 3px rgba(170,168,162,.12); }
        .pin-status-dot.saved { background: #171714; box-shadow: 0 0 0 3px rgba(23,23,20,.11); }
        .dark .pin-btn {
          border-color: rgba(255,255,255,.09);
          background: rgba(58, 58, 60, .9);
          box-shadow: none;
        }
        .dark .pin-btn .star-fill { --fill-0: #aaa9ad; }
        .dark .pin-btn:hover { border-color: rgba(255,255,255,.2); background: #48484b; }
        .dark .pin-btn:hover .star-fill { --fill-0: #fff; }
        .dark .pin-btn[data-pinned="true"] { border-color: rgba(255,255,255,.9); background: #fff; box-shadow: none; }
        .dark .pin-btn[data-pinned="true"] .star-fill,
        .dark .pin-btn[data-pinned="true"]:hover .star-fill { --fill-0: #11110f; }
        .dark .pin-btn[data-pinned="true"]:hover { border-color: #fff; background: #fff; }
        .dark .pin-menu { border-color: rgba(255,255,255,.08); box-shadow: 0 16px 46px rgba(0,0,0,.42); }
        .dark .pin-tooltip { color: #ececef; border-color: rgba(255,255,255,.08); background: rgba(44,44,46,.94); box-shadow: 0 12px 32px rgba(0,0,0,.34); }
        .dark .pin-tooltip::after { border-color: rgba(255,255,255,.08); background: rgba(44,44,46,.94); }
        @keyframes pinAura {
          0% { opacity: .8; transform: scale(.82); }
          100% { opacity: 0; transform: scale(1.65); }
        }
        @keyframes pinStarPop {
          0% { transform: scale(.7) rotate(-10deg); }
          48% { transform: scale(1.28) rotate(7deg); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes pinMenuIn {
          from { opacity: 0; transform: translateY(5px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pin-btn, .pin-btn .star-fill, .pin-tooltip { transition: none; }
          .pin-btn.pin-confirmed .pin-aura, .pin-btn.pin-confirmed .star-fill, .pin-menu { animation: none; }
        }
        .app-sidebar { width: clamp(14rem, 18vw, 18rem); }
        @media (max-width: 780px) {
          .app-sidebar {
            position: absolute;
            inset: 12px auto 12px 12px;
            z-index: 50;
            width: min(82vw, 19rem);
            background: color-mix(in srgb, var(--background) 92%, transparent) !important;
            backdrop-filter: blur(18px);
            box-shadow: 0 22px 60px rgba(0,0,0,.28);
          }
        }
      `}</style>

      {/* Canvas background — always visible */}
      <DotGridBackground position="fixed" className={darkMode ? "dark" : ""} />

      <div className={`relative flex h-screen overflow-hidden p-3 gap-3 ${darkMode ? "dark" : ""}`}>

        {/* Floating Sidebar */}
        {sidebarOpen && (
          <aside
            className="app-sidebar flex-shrink-0 flex flex-col bg-transparent rounded-2xl py-5 overflow-hidden"
            style={{ animation: "slideIn 0.22s ease both" }}
          >
            <div className="px-5 mb-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <img src={logoSvg} alt="Made Space" className="w-10 h-10 object-contain flex-shrink-0 dark:brightness-[3] dark:saturate-0 dark:contrast-[0.6]" />
                  <div className="min-w-0">
                    <span className="block truncate text-xs tracking-widest uppercase text-muted-foreground">Made Space</span>
                    <span className="mt-0.5 block truncate text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/60">Brown &amp; RISD</span>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-[var(--app-highlight)] hover:text-foreground"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Hi, {userName} ✦</p>
            </div>

            <nav className="px-3 space-y-0.5 mb-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm bg-foreground text-background"
              >
                <Globe className="w-4 h-4 flex-shrink-0" /> Discover
              </button>
            </nav>

            <div className="h-px bg-border mx-4 mb-4" />

            <div className="flex-1 overflow-y-auto scrollbar-hide px-3">
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Boards</p>
                <button onClick={() => setShowNewBoard(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {showNewBoard && (
                <div className="mb-2 px-1">
                  <input
                    ref={newBoardInputRef}
                    value={newBoardName}
                    onChange={e => setNewBoardName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") createBoard(); if (e.key === "Escape") { setShowNewBoard(false); setNewBoardName(""); } }}
                    placeholder="Board name..."
                    className="w-full text-sm bg-muted rounded-lg px-3 py-2 outline-none placeholder:text-muted-foreground"
                  />
                </div>
              )}

              <div className="space-y-0.5">
                {boards.map(b => (
                  <div key={b.id} className="relative group/board">
                    {sidebarRenaming === b.id ? (
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        <span className="text-base flex-shrink-0">{b.emoji}</span>
                        <input
                          ref={sidebarRenameRef}
                          value={sidebarRenameVal}
                          onChange={e => setSidebarRenameVal(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              const v = sidebarRenameVal.trim();
                              if (v) renameBoard(b.id, v);
                              setSidebarRenaming(null);
                            }
                            if (e.key === "Escape") setSidebarRenaming(null);
                          }}
                          onBlur={() => {
                            const v = sidebarRenameVal.trim();
                            if (v) renameBoard(b.id, v);
                            setSidebarRenaming(null);
                          }}
                          className="flex-1 text-sm bg-muted rounded-lg px-2 py-1 outline-none min-w-0"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => openBoard(b)}
                        className={`w-full text-left flex items-center gap-2.5 pl-3 pr-8 py-2.5 rounded-xl text-sm transition-colors ${
                          activeBoard?.id === b.id ? "bg-[var(--app-highlight)] text-foreground" : "hover:bg-[var(--app-highlight)]"
                        }`}
                      >
                        <span className="text-base flex-shrink-0">{b.emoji}</span>
                        <span className="flex-1 min-w-0 line-clamp-2 break-words leading-snug">{b.name}</span>
                        <span className="text-[10px] text-muted-foreground opacity-60 group-hover/board:opacity-0 transition-opacity flex-shrink-0">
                          {b.articleIds.length}
                        </span>
                      </button>
                    )}

                    {/* Three-dot hover menu trigger */}
                    {sidebarRenaming !== b.id && (
                      <div data-board-menu className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/board:opacity-100 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); setSidebarBoardMenu(v => v === b.id ? null : b.id); }}
                          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--app-highlight)] text-muted-foreground"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {sidebarBoardMenu === b.id && (
                          <div
                            className="absolute right-0 top-7 bg-card dark:bg-[#2c2c2e] rounded-xl py-1.5 min-w-[150px] z-50"
                            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.22)" }}
                          >
                            <button
                              onClick={e => { e.stopPropagation(); setSidebarRenameVal(b.name); setSidebarRenaming(b.id); setSidebarBoardMenu(null); }}
                              className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--app-highlight)] transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                              Rename
                            </button>
                            <div className="h-px bg-border mx-3 my-1" />
                            <button
                              onClick={e => { e.stopPropagation(); deleteBoard(b.id); setSidebarBoardMenu(null); }}
                              className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-[var(--app-highlight)] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-border mx-4 mt-4 mb-3" />

            <div className="px-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Your Topics</p>
                <button
                  onClick={openTopicManager}
                  className="rounded-full px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-[var(--app-highlight)] hover:text-foreground"
                >
                  Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(interests.length > 0 ? interests : CATEGORIES.slice(0, 6)).slice(0, 8).map(i => (
                  <button
                    key={i}
                    onClick={openTopicManager}
                    className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background transition-opacity hover:opacity-85"
                  >
                    {CATEGORY_EMOJI[i]} {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-3 mt-4">
              <button
                onClick={() => setDarkMode(v => !v)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-[var(--app-highlight)] transition-colors text-muted-foreground"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? "Light mode" : "Dark mode"}
              </button>
            </div>
          </aside>
        )}

        {/* Main column */}
        <main className="flex-1 flex flex-col gap-3 overflow-hidden min-w-0">

          {/* Floating topbar */}
          <header className="flex-shrink-0 flex items-center gap-3 px-0 py-2.5 bg-transparent rounded-2xl">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-[var(--app-highlight)] hover:text-foreground"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            <div className="relative min-w-[260px] flex-[1.35] max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6f6f74]" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-[var(--app-highlight)] py-2 pl-8 pr-4 text-sm text-[#1c1c1e] outline-none transition-colors placeholder:text-[#6f6f74] focus:bg-[var(--app-highlight-hover)] focus:ring-2 focus:ring-foreground/10"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f6f74] hover:text-[#1c1c1e]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  !selectedCategory ? "bg-foreground text-background" : "bg-[var(--app-highlight)] text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {filterCategories.map(cat => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(active ? null : cat)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                      active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-[var(--app-highlight)] hover:text-foreground"
                    }`}
                  >
                    {CATEGORY_EMOJI[cat]} {cat}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-0.5 flex-shrink-0 bg-[var(--app-highlight)] rounded-xl p-1">
              {([
                { value: "relevant", icon: Sparkles, label: "For you" },
                { value: "newest",   icon: Zap,      label: "New" },
                { value: "oldest",   icon: Clock,    label: "Old" },
              ] as const).map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setSortOrder(value)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                    sortOrder === value ? "bg-background font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </header>

          {/* Floating feed panel */}
          <div className="flex-1 overflow-hidden rounded-2xl bg-card flex flex-col">
            {/* Feed header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedCategory ? selectedCategory
                    : sortOrder === "relevant" ? `For you, ${userName}`
                    : sortOrder === "newest" ? "Latest" : "Archive"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                  {filtered.length} article{filtered.length !== 1 ? "s" : ""}
                  {searchQuery && ` matching "${searchQuery}"`}
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${feedStatus === "live" ? "bg-emerald-500" : feedStatus === "loading" ? "bg-amber-400 animate-pulse" : "bg-muted-foreground/50"}`} />
                    {feedStatus === "live" ? `Live RSS · ${liveSourceCount} sources` : feedStatus === "loading" ? "Syncing RSS…" : "Curated fallback"}
                  </span>
                </p>
              </div>

              {readingId && (
                <div className="flex items-center gap-2 bg-[var(--app-highlight)] rounded-full px-3 py-1.5">
                  <Volume2 className="w-3 h-3 text-muted-foreground animate-pulse" />
                  <span className="text-xs font-medium">Reading aloud</span>
                  <button onClick={() => { speechSynthesis.cancel(); setReadingId(null); }} className="ml-1 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable cards */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-5">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Hash className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-medium">No articles found.</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    {searchQuery ? "Try a different search." : "Adjust your filters."}
                  </p>
                </div>
              ) : (
                <div className={`${activeBoard && !boardFullscreen ? "columns-1 sm:columns-2 min-[1900px]:columns-3" : "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5"} gap-4`}>
                  {filtered.map(article => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      readingId={readingId}
                      onReadAloud={handleReadAloud}
                      onOpenDetail={article => setDetailArticleId(article.id)}
                      onOpenPinMenu={openPinMenu}
                      pinMenuOpen={pinMenuState?.articleId === article.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {activeBoard && !boardFullscreen && (
          <section
            className="hidden min-w-[460px] flex-[0_0_clamp(460px,42vw,720px)] overflow-hidden xl:block"
            style={{ animation: "boardDrawerIn 0.24s cubic-bezier(.2,.8,.2,1) both" }}
            aria-label={`${activeBoard.name} board panel`}
          >
            <CanvasBoard
              board={activeBoard}
              boards={boards}
              articles={articles}
              mode="panel"
              onClose={() => setActiveBoard(null)}
              onFullscreen={() => setBoardFullscreen(true)}
              onRemoveFromBoard={removeFromBoard}
              onAddToBoard={addToBoard}
              onRenameBoard={renameBoard}
              onDeleteBoard={deleteBoard}
              onOpenArticle={article => setDetailArticleId(article.id)}
              onSelectBoard={board => openBoard(board)}
            />
          </section>
        )}
      </div>

      {activeBoard && boardFullscreen && (
        <CanvasBoard
          board={activeBoard}
          boards={boards}
          articles={articles}
          mode="fullscreen"
          onClose={() => setActiveBoard(null)}
          onFullscreen={() => setBoardFullscreen(false)}
          onRemoveFromBoard={removeFromBoard}
          onAddToBoard={addToBoard}
          onRenameBoard={renameBoard}
          onDeleteBoard={deleteBoard}
          onOpenArticle={article => setDetailArticleId(article.id)}
          onSelectBoard={board => openBoard(board, true)}
        />
      )}

      {detailArticle && (
        <ArticleDetailModal
          article={detailArticle}
          boards={boards}
          readingId={readingId}
          onClose={() => setDetailArticleId(null)}
          onReadAloud={handleReadAloud}
          onAddToBoard={addToBoard}
          onRemoveFromBoard={removeFromBoard}
        />
      )}

      <FeedPinMenu
        state={pinMenuState}
        article={pinMenuArticle}
        boards={boards}
        onClose={() => setPinMenuState(null)}
        onAddToBoard={addToBoard}
        onRemoveFromBoard={removeFromBoard}
      />

      <GlobalSelectionToolbar
        selection={textSelection}
        boards={boards}
        selectedBoardId={selectionBoardId}
        onSelectedBoardChange={setSelectionBoardId}
        onSave={saveSelectionToBoard}
      />

      {topicManagerOpen && (
        <TopicManagerModal
          topics={CATEGORIES.filter(category => category !== "Clipping")}
          draftTopics={topicDraft}
          onToggle={toggleTopicDraft}
          onSave={saveTopicDraft}
          onClose={() => setTopicManagerOpen(false)}
        />
      )}
    </>
  );
}
