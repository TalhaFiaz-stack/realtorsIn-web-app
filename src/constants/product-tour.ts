/**
 * Product tour content — shared by the public landing page (`/`, `/welcome`)
 * and the post-signup getting-started tour (`/onboarding/welcome`).
 * Each feature maps to a real screen in the web app.
 */
export type ProductFeatureId =
  | "feed"
  | "network"
  | "offplan"
  | "properties"
  | "messages"
  | "jobs-events"
  | "profile";

export type ProductFeature = {
  id: ProductFeatureId;
  eyebrow: string;
  title: string;
  description: string;
  /** "How to use it" — short, action-oriented steps. */
  steps: string[];
  /** Where the feature lives in the app. */
  href: string;
  cta: string;
};

export const PRODUCT_FEATURES: ProductFeature[] = [
  {
    id: "feed",
    eyebrow: "Home feed",
    title: "Share listings and market updates with your network",
    description:
      "Your home feed is where the UAE real-estate community posts properties, client inquiries, off-plan launches, photos and videos.",
    steps: [
      "Tap “What’s on your mind” to post text, photos or video",
      "Attach a property, a client inquiry or an off-plan project as a rich card",
      "@mention colleagues, react, comment and repost to reach more people",
    ],
    href: "/feed",
    cta: "Open the feed",
  },
  {
    id: "network",
    eyebrow: "Network",
    title: "Build a trusted network of agents and brokers",
    description:
      "Connect with professionals across the Emirates, see mutual connections and find verified brokers you can co-broke with.",
    steps: [
      "Search people by name or browse “People you may know”",
      "Send a connection request — they accept from Network → Requests",
      "Browse Verified brokers to find partners with a checked broker card",
    ],
    href: "/connections",
    cta: "Find people",
  },
  {
    id: "offplan",
    eyebrow: "Off-plan projects",
    title: "Explore off-plan projects and pitch units to clients",
    description:
      "Browse developer projects on a map or list, check prices, payment plans and available units — then create client-ready material in seconds.",
    steps: [
      "Filter projects by area, developer, price and handover",
      "Open a project to see units, floor plans and payment plans",
      "Create a branded presentation or quotation PDF, or share to your feed",
    ],
    href: "/listings?tab=off-plan",
    cta: "Browse projects",
  },
  {
    id: "properties",
    eyebrow: "Property Hub",
    title: "Manage your listings and match them with client needs",
    description:
      "Keep your buy, sell and rent listings and client requirements in one hub — RealtorsIn suggests matching listings from other brokers.",
    steps: [
      "Add a listing (sell / rent out) or a client requirement (buy / rent in)",
      "Track status — pending, active, sold — from one place",
      "Tap “Find matching properties / clients” to see the best matches",
    ],
    href: "/properties",
    cta: "Open Property Hub",
  },
  {
    id: "messages",
    eyebrow: "Messaging",
    title: "Close deals faster with real-time chat",
    description:
      "Message any connection instantly. Share posts, listings, jobs, events and documents right inside the conversation.",
    steps: [
      "Start a chat from any profile or from Messages",
      "Send photos and documents, or share a listing straight from the feed",
      "Get notified in the app and in your browser when someone replies",
    ],
    href: "/messages",
    cta: "Open messages",
  },
  {
    id: "jobs-events",
    eyebrow: "Jobs & events",
    title: "Hire, get hired and meet the industry",
    description:
      "Agencies post open roles and members apply in one tap. Host or join industry events, launches and trainings — online or in person.",
    steps: [
      "Browse jobs and apply with your RealtorsIn profile (Easy Apply)",
      "Post a job and review applicants from the job page",
      "Register for events or host your own and invite your connections",
    ],
    href: "/jobs",
    cta: "See jobs & events",
  },
  {
    id: "profile",
    eyebrow: "Profile & verification",
    title: "A professional profile clients and partners trust",
    description:
      "Show your experience, licenses and skills, get the verified broker badge, and track who viewed your profile.",
    steps: [
      "Complete your profile — photo, headline, experience and certificates",
      "Upload your broker card and ID to earn the verified badge",
      "Track profile views, post impressions and search appearances",
    ],
    href: "/me",
    cta: "View my profile",
  },
];

/** How it works — the four-step journey. */
export const HOW_IT_WORKS = [
  { title: "Create your profile", body: "Sign up with email, phone, Google or Facebook and add your headline, photo and experience." },
  { title: "Get verified", body: "Upload your broker card to earn the verified badge that builds trust with clients and peers." },
  { title: "Connect & share", body: "Grow your network, post listings and inquiries, and message other professionals." },
  { title: "Match & close", body: "Use Property Hub matches, off-plan presentations and quotations to close deals faster." },
] as const;

/** Factual product points (no unverified marketing numbers). */
export const PRODUCT_HIGHLIGHTS = [
  { value: "Web + mobile", label: "One account on web, iOS and Android" },
  { value: "Verified", label: "Broker-card verification badge" },
  { value: "Off-plan", label: "Projects, units, PDFs & quotations" },
] as const;

export const AUDIENCES = [
  { title: "Agents & brokers", body: "Find listings and clients, co-broke with verified partners, and grow your personal brand." },
  { title: "Agencies", body: "Hire talent, showcase your team and keep listings and client needs organised." },
  { title: "Developers & sales teams", body: "Put projects in front of active agents and share launches, events and updates." },
] as const;

export const LANDING_FAQ = [
  {
    q: "What is RealtorsIn?",
    a: "RealtorsIn is a professional network for the UAE real-estate industry — a place to connect with agents and brokers, share listings and inquiries, explore off-plan projects, chat and find jobs and events.",
  },
  {
    q: "Who can join?",
    a: "Real-estate professionals — agents, brokers, agencies, developers and their sales teams.",
  },
  {
    q: "What does “verified broker” mean?",
    a: "Members who upload their broker card and ID get it reviewed by our team. Once approved, a verified badge appears on their profile, and some features such as off-plan project details are reserved for verified brokers.",
  },
  {
    q: "Can I use the same account on web and mobile?",
    a: "Yes. Sign in on the web or in the RealtorsIn app (App Store and Google Play) with the same account — your profile, network, posts and messages stay in sync.",
  },
  {
    q: "How do I create a presentation or quotation for a client?",
    a: "Open an off-plan project, choose a unit, and pick Create presentation or Create quotation. Choose currency, language and what to include, then download the PDF or copy a client offer link.",
  },
] as const;
