/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TFeatureItem = {
  icon: string;
  title: string;
  description: string;
};

export type TFeaturesSection = {
  heading: string;
  features: TFeatureItem[];
};

export type TSocialLinks = {
  youtube: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  tagline: string;
  logoUrl: string;
  heroImage: string;
  brandColor: TBrandColor;
  instructorName: string;
  instructorBio: string;
  instructorPhoto: string;
  heroHeading: string;
  heroSubheading: string;
  heroCta: string;
  featuresSection: TFeaturesSection;
  footerText: string;
  contactEmail: string;
  socialLinks: TSocialLinks;
  enableNotifications: boolean;
  enableChat: boolean;
  itemsPerPage: number;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Harsh Commerce Academy",
  tagline: "Learn Smart, Score Better",
  logoUrl: "FILL_LOGO_URL_HERE",
  heroImage: "",
  brandColor: {
    primary: "#3730A3",
    secondary: "#F59E0B",
    accent: "#10B981",
  },
  instructorName: "Harsh Commerce Academy",
  instructorBio:
    "A professional coaching center delivering top-quality commerce education for students aiming to excel in their exams.",
  instructorPhoto: "",
  heroHeading: "Learn Smart, Score Better",
  heroSubheading:
    "Access video lessons, notes, PDFs, and practice tests — all in one platform built for commerce students.",
  heroCta: "Get Started Free",
  featuresSection: {
    heading: "Everything You Need to Succeed",
    features: [
      {
        icon: "PlayCircle",
        title: "Video Lessons",
        description: "High-quality video lectures covering every topic in depth.",
      },
      {
        icon: "FileText",
        title: "Written Notes",
        description: "Structured rich-text notes paired with each lesson.",
      },
      {
        icon: "File",
        title: "PDF Materials",
        description: "Downloadable worksheets, guides, and reference PDFs.",
      },
      {
        icon: "CheckSquare",
        title: "MCQ Assessments",
        description: "Topic-wise quizzes with instant auto-scored results.",
      },
      {
        icon: "MessageCircle",
        title: "Query Chat",
        description: "Post your doubts and get answers from your instructor.",
      },
      {
        icon: "Bell",
        title: "Notifications",
        description: "Stay updated with new lessons, quizzes, and announcements.",
      },
    ],
  },
  footerText: "© 2026 Harsh Commerce Academy. All rights reserved.",
  contactEmail: "",
  socialLinks: {
    youtube: "",
    instagram: "",
    telegram: "",
    whatsapp: "",
  },
  enableNotifications: true,
  enableChat: true,
  itemsPerPage: 12,
};
