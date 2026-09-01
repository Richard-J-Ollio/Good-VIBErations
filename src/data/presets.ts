import { DecisionPreset } from "../types";

export const DECISION_PRESETS: DecisionPreset[] = [
  {
    id: "career-job-offers",
    title: "Accept Offer at High-Growth Startup vs Stay at Established Enterprise",
    category: "Career & Work",
    context: "I value rapid learning and equity upside, but also currently have good work-life balance and stable compensation.",
    options: [
      {
        name: "Join Series B Startup",
        description: "$145k base + significant equity grant, fast pace, high ownership, longer hours, remote."
      },
      {
        name: "Stay at Enterprise Tech Co",
        description: "$165k base + $25k annual bonus/401k match, 38 hrs/wk, predictable path to promotion, hybrid."
      }
    ]
  },
  {
    id: "lifestyle-housing",
    title: "Buy First Home in Suburbs vs Rent in City & Invest Difference",
    category: "Housing & Real Estate",
    context: "Looking at a 5-7 year horizon. Trying to weigh building home equity and yard space against city convenience, lower maintenance stress, and index fund returns.",
    options: [
      {
        name: "Purchase Suburb Single-Family Home",
        description: "3 bed, 2 bath, yard, 45 min commute, mortgage + taxes + maintenance costs."
      },
      {
        name: "Rent Modern City Apartment & Invest",
        description: "Walk to work/cafes, fixed monthly rent, zero repair hassle, surplus cash into diversified index funds."
      }
    ]
  },
  {
    id: "business-tech-stack",
    title: "Build MVP with Full-Stack Next.js vs Mobile-First React Native",
    category: "Product & Tech",
    context: "Launching a consumer habit app. Goal is to validate product-market fit within 90 days with minimal engineering overhead.",
    options: [
      {
        name: "Responsive Web PWA (Next.js)",
        description: "Instant deployment, no app store approval friction, easy SEO & social sharing, lower initial build time."
      },
      {
        name: "Native Mobile App (React Native)",
        description: "Native push notifications, home screen icon permanence, offline-first capabilities, app store discovery."
      }
    ]
  },
  {
    id: "personal-relocation",
    title: "Relocate to Europe for 2 Years vs Stay in Current City",
    category: "Life Adventure",
    context: "Offered internal transfer to Berlin office. Same company, similar salary adjusted for cost of living.",
    options: [
      {
        name: "Relocate to Berlin, Germany",
        description: "Immersive international experience, 30 days PTO, easy European travel, cultural expansion, but away from close family."
      },
      {
        name: "Remain in Current City",
        description: "Established social circle, direct access to family, zero relocation friction, familiar routine."
      }
    ]
  }
];
