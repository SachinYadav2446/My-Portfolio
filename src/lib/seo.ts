// Everything search engines and AI answer engines read about the site lives
// here: titles, descriptions, the share image, and the structured data that
// says who Nidhi is. None of it changes what's on screen.

export const SITE_URL = "https://www.binarysphere.dev"; // Update with your actual domain
export const OG_IMAGE = `${SITE_URL}/og.png`;

export const NAME = "Sachin Yadav";
export const ABOUT_SHORT =
  "Sachin Yadav (Binary Sphere) is a Computer Science Engineering student passionate about software development, AI/ML, and building intelligent systems that solve real-world problems.";

export const PROFILES = [
  "https://www.linkedin.com/in/sachin-yadav-735444434/",
  "https://github.com/SachinYadav2446",
  "https://x.com/BINARYSPHERE45",
  "https://leetcode.com/u/Binary-Sphere/",
];

export const person = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: NAME,
  alternateName: ["Binary Sphere", "Sachin"],
  url: SITE_URL,
  image: OG_IMAGE,
  email: "mailto:yadavsachin123411@gmail.com",
  jobTitle: "Computer Science Engineering Student & Software Developer",
  description: ABOUT_SHORT,
  worksFor: { "@type": "Organization", name: "Independent Developer" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Computer Science Engineering" },
  address: { "@type": "PostalAddress", addressCountry: "IN" },
  knowsAbout: [
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Computer Vision",
    "Full-stack development",
    "Data Science",
    "Time-series forecasting",
    "System Design",
    "Problem Solving",
    "React",
    "Node.js",
    "Python",
    "PyTorch",
  ],
  sameAs: PROFILES,
};

// Turn a JSON-LD object into a <script> entry for a route's head.
export const jsonLd = (data: Record<string, unknown>) => ({
  type: "application/ld+json",
  children: JSON.stringify({ "@context": "https://schema.org", ...data }),
});

// The standard set of tags for a page: title, description, canonical address
// and the share card.
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }) {
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "the anatomy of a curious developer — Sachin Yadav (Binary Sphere)" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
