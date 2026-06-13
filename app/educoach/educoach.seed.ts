import { CourseModel, TopicModel, LessonModel, ContentTier, LessonType } from "./models/course.model";
import { MCQTestModel } from "./models/mcq.model";
import { NotificationModel, NotificationType } from "./models/notification.model";

export async function seedEduCoach(): Promise<void> {
  const existingCourse = await CourseModel.findOne({ deletedAt: null });
  if (existingCourse) return; // Already seeded

  // ─── Lessons ───────────────────────────────────────────────────────────────
  const lesson1 = await LessonModel.create({
    title: "Introduction to Accountancy",
    description: "Overview of accounting concepts and principles",
    type: LessonType.Video,
    content_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tier: ContentTier.Free,
    sort_order: 1,
  });

  const lesson2 = await LessonModel.create({
    title: "Journal Entries — Notes",
    description: "Detailed notes on recording journal entries",
    type: LessonType.Notes,
    notes_body: "<h2>Journal Entries</h2><p>A journal entry is the first step in the accounting cycle. Every financial transaction affects at least two accounts...</p><ul><li>Debit the receiving account</li><li>Credit the giving account</li></ul><p>Example: Cash received from sales — Debit: Cash, Credit: Sales Revenue.</p>",
    tier: ContentTier.Free,
    sort_order: 2,
  });

  const lesson3 = await LessonModel.create({
    title: "Trial Balance Worksheet",
    description: "Downloadable worksheet for trial balance practice",
    type: LessonType.PDF,
    content_url: "/api/uploader/document/trial-balance-sample.pdf",
    tier: ContentTier.Free,
    sort_order: 3,
  });

  const lesson4 = await LessonModel.create({
    title: "Advanced Financial Statements",
    description: "Profit & Loss and Balance Sheet preparation",
    type: LessonType.Video,
    content_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tier: ContentTier.Paid,
    sort_order: 4,
  });

  const lesson5 = await LessonModel.create({
    title: "Introduction to Business Studies",
    description: "Core business concepts and management principles",
    type: LessonType.Video,
    content_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tier: ContentTier.Free,
    sort_order: 1,
  });

  const lesson6 = await LessonModel.create({
    title: "Business Environment Analysis",
    description: "PESTLE and SWOT analysis techniques",
    type: LessonType.Notes,
    notes_body: "<h2>Business Environment</h2><p>The business environment consists of all internal and external factors that affect business operations...</p><h3>PESTLE Analysis</h3><ul><li><strong>Political</strong> — Government policies</li><li><strong>Economic</strong> — Economic conditions</li><li><strong>Social</strong> — Cultural trends</li><li><strong>Technological</strong> — Tech advancements</li><li><strong>Legal</strong> — Laws and regulations</li><li><strong>Environmental</strong> — Ecological factors</li></ul>",
    tier: ContentTier.Paid,
    sort_order: 2,
  });

  // ─── Topics ────────────────────────────────────────────────────────────────
  const topic1 = await TopicModel.create({
    title: "Chapter 1: Basics of Accounting",
    sort_order: 1,
    lessons: [lesson1._id, lesson2._id, lesson3._id],
  });

  const topic2 = await TopicModel.create({
    title: "Chapter 2: Financial Statements",
    sort_order: 2,
    lessons: [lesson4._id],
  });

  const topic3 = await TopicModel.create({
    title: "Chapter 1: Nature of Business",
    sort_order: 1,
    lessons: [lesson5._id, lesson6._id],
  });

  // ─── Courses ───────────────────────────────────────────────────────────────
  await CourseModel.create({
    title: "Accountancy Class 11",
    description: "Complete Accountancy course for Class 11 students. Covers all chapters from NCERT with video lessons, notes, and practice tests.",
    thumbnail_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=60",
    tier: ContentTier.Free,
    price: 0,
    category: "Accountancy",
    topics: [topic1._id, topic2._id],
    is_published: true,
    sort_order: 1,
  });

  await CourseModel.create({
    title: "Business Studies Class 12",
    description: "Comprehensive Business Studies for Class 12. Master management, marketing, finance, and entrepreneurship with premium content.",
    thumbnail_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60",
    tier: ContentTier.Paid,
    price: 1499,
    category: "Business Studies",
    topics: [topic3._id],
    is_published: true,
    sort_order: 2,
  });

  await CourseModel.create({
    title: "Economics Class 12",
    description: "Economics made simple! Covers Microeconomics and Macroeconomics with clear explanations and exam-focused content.",
    thumbnail_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60",
    tier: ContentTier.Free,
    price: 0,
    category: "Economics",
    topics: [],
    is_published: true,
    sort_order: 3,
  });

  await CourseModel.create({
    title: "Mathematics Class 11",
    description: "Mathematics for Commerce stream. Relations, Functions, Trigonometry, Calculus and more.",
    thumbnail_url: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&auto=format&fit=crop&q=60",
    tier: ContentTier.Paid,
    price: 999,
    category: "Mathematics",
    topics: [],
    is_published: true,
    sort_order: 4,
  });

  // ─── MCQ Test ──────────────────────────────────────────────────────────────
  await MCQTestModel.create({
    title: "Accounting Basics — Quiz 1",
    description: "Test your knowledge of basic accounting concepts",
    questions: [
      {
        question: "Which of the following is a Real Account?",
        options: [{ text: "Cash Account" }, { text: "Capital Account" }, { text: "Salary Account" }, { text: "Creditor Account" }],
        correct_index: 0,
        explanation: "Cash Account is a Real Account because it represents physical assets.",
      },
      {
        question: "The accounting equation is:",
        options: [
          { text: "Assets = Liabilities + Capital" },
          { text: "Assets = Liabilities - Capital" },
          { text: "Assets + Capital = Liabilities" },
          { text: "Assets - Liabilities = Revenue" },
        ],
        correct_index: 0,
        explanation: "The fundamental accounting equation: Assets = Liabilities + Owner's Capital.",
      },
      {
        question: "Which account is credited when goods are sold for cash?",
        options: [{ text: "Cash Account" }, { text: "Sales Account" }, { text: "Purchase Account" }, { text: "Debtor Account" }],
        correct_index: 1,
        explanation: "Sales Account is credited because revenue is earned (credit the giver).",
      },
      {
        question: "Depreciation is charged on:",
        options: [{ text: "Current Assets" }, { text: "Fixed Assets" }, { text: "Current Liabilities" }, { text: "Investments" }],
        correct_index: 1,
        explanation: "Depreciation is charged on Fixed Assets to account for wear and tear.",
      },
      {
        question: "Which of the following is a Nominal Account?",
        options: [{ text: "Building Account" }, { text: "Machinery Account" }, { text: "Rent Account" }, { text: "Debtors Account" }],
        correct_index: 2,
        explanation: "Rent Account is a Nominal Account as it represents an expense.",
      },
    ],
    time_limit_minutes: 10,
    is_published: true,
  });

  // ─── Notifications ─────────────────────────────────────────────────────────
  await NotificationModel.create({
    user_id: null,
    title: "Welcome to Harsh Commerce Academy!",
    body: "Explore our courses, take quizzes, and post your doubts in the query board.",
    type: NotificationType.Announcement,
    link: "/courses",
  });

  await NotificationModel.create({
    user_id: null,
    title: "New Course: Accountancy Class 11",
    body: "The Accountancy Class 11 course is now live with free access!",
    type: NotificationType.NewLesson,
    link: "/courses",
  });
}
