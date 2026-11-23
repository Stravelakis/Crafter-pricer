// Per-repo config. Most projects only touch this file and src/docs/*.md.

interface SocialLink {
  kind: "github" | "linkedin";
  label: string;
  href: string;
}

export const siteConfig = {
  projectName: "MarginCraft",
  description:
    "Price 3D prints, UV prints, laser and CNC jobs so every order pays you: machine wear, electricity, materials, your time, rent, VAT and income tax in one quote, next to what competitors charge.",
  repoUrl: "https://github.com/Stravelakis/Crafter-pricer",
  // Path under /public including the base path, e.g. '/repo-name/favicon.svg'. Empty = no favicon tag.
  faviconHref: "/Crafter-pricer/favicon.png",

  // What a link to the site shows when shared (Open Graph / Twitter cards).
  // seoTitle is the front page's <title> and share title; empty falls back to
  // "Overview · projectName". socialImage is a 1200x630 PNG in /public
  // (without the base path); empty means no image, and most platforms then
  // show a bare, easily-ignored link. Always set both before publishing.
  seoTitle: "MarginCraft — cost-plus pricing for 3D, UV, laser & CNC makers",
  socialImage: "og-image.png",
  socialImageAlt: "MarginCraft: price every maker job so it actually pays you",
  locale: "en_GB",

  // Left menu, top group. Each id must match an element id on the page. The
  // "On this page" group below it is built from the headings of the reading
  // level on screen.
  nav: [
    { id: "top", label: "Overview" },
    { id: "features", label: "What it does" },
    { id: "showcase", label: "Screenshots" },
    { id: "try", label: "Try the calculator" },
  ],

  // Buttons and chips in the hero (primary = the filled button).
  heroLinks: [
    { label: "Try the calculator", href: "#try", primary: true },
    { label: "Source on GitHub", href: "https://github.com/Stravelakis/Crafter-pricer" },
    { label: "What changed", href: "https://github.com/Stravelakis/Crafter-pricer/blob/HEAD/CHANGELOG.md" },
  ],
  heroPills: ["Runs in your browser", "No account", "Saved in your browser", "Free and open source"],

  // The three cards under the hero. They switch the reading level.
  levelCards: [
    { id: "dev", tag: "Dev", title: "How it is built", text: "The exact pricing formula, storage, what leaves the browser, build, test and release." },
    { id: "plain", tag: "English", title: "How to use it", text: "For makers comfortable with tech who do not write code. Run it, price a job, tax, market check, fixes." },
    { id: "eli5", tag: "ELI5", title: "Start from zero", text: "What cost-plus pricing is, every word in the form explained, every click spelled out." },
  ],

  // First visit lands on English; a reader's saved choice still wins.
  defaultVernacular: "plain",

  // Reading-level switch at the top of the sidebar. The ids are fixed (they
  // match src/docs/dev.md, plain.md, eli5.md); change labels only.
  vernaculars: [
    { id: "dev", label: "Dev" },
    { id: "plain", label: "English" },
    { id: "eli5", label: "ELI5" },
  ],

  // Tally form link (STANDARDS §8). Empty = no "Send feedback" link.
  feedbackUrl: "",

  playground: {
    // The front page has its own live box that runs the app's real pricing
    // engine (src/lib/calc.ts), so the generic code runner stays off.
    enabled: false,
    starterCode: `// try it\nconsole.log("hello from the playground")`,
  },

  author: {
    name: "Stravelakis",
    links: [
      { kind: "github", label: "GitHub", href: "https://github.com/Stravelakis" },
      { kind: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/stravelakiscom/" },
    ] as SocialLink[],
  },
};
