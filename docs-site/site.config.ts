import type { DotFieldOptions } from "./src/scripts/dot-field";

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
  repoUrl: "https://github.com/DnD-World/Crafter-pricer",
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

  // Sidebar menu. Each id must match an element id on the page.
  nav: [
    { id: "top", label: "Overview" },
    { id: "features", label: "Features" },
    { id: "showcase", label: "Showcase" },
    { id: "try", label: "Try it" },
    { id: "get", label: "Get it" },
    { id: "docs", label: "Docs" },
  ],

  // Reading-level switch at the top of the sidebar. The ids are fixed (they
  // match src/docs/dev.md, plain.md, eli5.md); change labels only.
  vernaculars: [
    { id: "dev", label: "Dev" },
    { id: "plain", label: "English" },
    { id: "eli5", label: "ELI5" },
  ],

  playground: {
    // true only for JS/web projects, where running the code in the browser is real.
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

  // React Bits "Dot Field" settings, same names as on reactbits.dev.
  backgrounds: {
    page: {
      cursorRadius: 200,
      bulgeStrength: 6,
      cursorForce: 0,
      dotRadius: 2,
      dotSpacing: 5,
      glowRadius: 50,
      sparkle: true,
      gradientFrom: "#0001c6",
      gradientTo: "#00cade",
      glowColor: "#040410",
    },
    sidebar: {
      cursorRadius: 100,
      bulgeStrength: 0,
      cursorForce: 0,
      bulgeOnly: false,
      dotSpacing: 5,
      glowRadius: 50,
      gradientFrom: "#0001c6",
      gradientTo: "#00cade",
      glowColor: "#040410",
    },
  } satisfies Record<string, DotFieldOptions>,
};
