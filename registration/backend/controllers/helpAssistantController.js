/**
 * Help assistant: FAQs stored in MongoDB; each chat reply is logged.
 * Optional OPENAI_API_KEY for open-ended replies when no FAQ matches.
 */

const HelpFaq = require("../models/HelpFaq");
const HelpChatLog = require("../models/HelpChatLog");

const DEFAULT_FAQS = [
  {
    q: 'Who can submit an event proposal?',
    a: 'Any registered club, society, or faculty member at SLIIT can submit a proposal through EventSync.',
  },
  {
    q: 'How far in advance should I submit my proposal?',
    a: 'Proposals should be submitted at least 3 weeks prior to the event date to allow sufficient time for approvals and resource allocation.',
  },
  {
    q: 'How do I book a venue like the Main Auditorium?',
    a: 'Venue booking is handled in Phase 5 of the event workflow. Once your initial proposal is approved, you can request specific venues and resources.',
  },
  {
    q: 'Who approves the final budget?',
    a: 'The Student Affairs Directorate and the Finance Department review and approve all budgets.',
  },
  {
    q: 'Can I edit my proposal after submission?',
    a: 'Yes, proposals can be edited as long as they have not yet entered the approval stage. Once submitted to the approver, you must contact the Student Affairs Office to request amendments.',
  },
  {
    q: 'How do I request audio/visual or technical equipment?',
    a: 'Equipment requests are made through the Resource Request module in Phase 5. Specify the type, quantity, and duration of equipment needed.',
  },
  {
    q: 'How long does the approval process typically take?',
    a: 'The average approval turnaround is 48 hours per stage. Events with budgets above LKR 100,000 may require additional review time.',
  },
  {
    q: 'Can external guests or speakers be invited to SLIIT events?',
    a: 'Yes, external parties can be invited. You must list external participants in your proposal and obtain clearance from the Student Affairs Directorate.',
  },
  {
    q: 'What happens after my event is completed?',
    a: 'You are required to submit a post-event report through EventSync within 7 working days. This includes attendance figures, a financial summary, and photographs.',
  },
  {
    q: 'Is there a maximum budget limit for student-organized events?',
    a: 'Budget limits vary by event type and organizing body. Club events typically have a ceiling set by the Student Affairs Office. Contact them for the current academic year limits.',
  },
  {
    q: 'Can I view events organized by other clubs or faculties?',
    a: 'Yes, the Events page on EventSync lists approved events. You can also visit the official SLIIT Events page at sliit.lk/events for announcements.',
  },
  {
    q: 'What should I do if my proposal is rejected?',
    a: "If your proposal is rejected, you will receive feedback via EventSync. You may revise and resubmit the proposal addressing the reviewer's comments within 5 working days.",
  },
];

const STOP = new Set([
  'the',
  'and',
  'for',
  'are',
  'can',
  'you',
  'how',
  'what',
  'when',
  'who',
  'with',
  'this',
  'that',
  'from',
  'have',
  'has',
  'was',
  'were',
  'will',
  'does',
  'did',
  'should',
  'would',
  'could',
  'about',
  'into',
  'your',
  'need',
  'help',
  'tell',
  'want',
  'know',
  'please',
  'thanks',
  'thank',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1);
}

function faqMatchAnswer(message, faqs) {
  const userWords = new Set(tokenize(message).filter((w) => !STOP.has(w)));
  if (userWords.size === 0) return null;

  let best = null;
  let bestScore = 0;

  for (const faq of faqs) {
    const qTokens = tokenize(faq.q);
    const aTokens = tokenize(faq.a);
    let score = 0;
    for (const w of userWords) {
      for (const t of qTokens) {
        if (t === w || (w.length >= 4 && (t.includes(w) || w.includes(t)))) score += 2;
      }
      for (const t of aTokens) {
        if (t === w || (w.length >= 4 && (t.includes(w) || w.includes(t)))) score += 0.35;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  if (best && bestScore >= 1.5) return best.a;
  return null;
}

function greetingReply(message) {
  const t = message.trim();
  if (/^(hi|hello|hey|good\s+(morning|afternoon|evening))\b/i.test(t)) {
    return "Hi! I'm the EventSync assistant. Ask about proposals, venues, budgets, equipment, approvals, or post-event reports — I pull answers from our official help topics stored for EventSync.";
  }
  return null;
}

function fallbackReply() {
  return (
    "I don't have a specific answer for that in our help topics yet. Scroll the FAQ on this page for official guidance, or contact the Student Affairs Office for case-specific questions."
  );
}

let faqEmptyCheckDone = false;

async function seedDefaultFaqsIfEmpty() {
  if (faqEmptyCheckDone) return;
  const count = await HelpFaq.countDocuments();
  if (count === 0) {
    await HelpFaq.bulkWrite(
    DEFAULT_FAQS.map((f, i) => ({
      updateOne: {
        filter: { question: f.q },
        update: { $set: { answer: f.a, order: i } },
        upsert: true,
      },
    }))
    );
  }
  faqEmptyCheckDone = true;
}

async function getFaqKnowledgeFromDb() {
  await seedDefaultFaqsIfEmpty();
  const rows = await HelpFaq.find().sort({ order: 1 }).select("question answer").lean();
  return rows.map((r) => ({ q: r.question, a: r.answer }));
}

function builtInFaqKnowledge() {
  return DEFAULT_FAQS.map((f) => ({ q: f.q, a: f.a }));
}

async function openAiReply(userMessage) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const model = process.env.OPENAI_HELP_MODEL || 'gpt-4o-mini';
  const system = `You are EventSync's concise help assistant for SLIIT event procedures. Only use plausible university event workflow guidance; if unsure, say to check the FAQ or Student Affairs. Keep answers under 120 words.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage.slice(0, 4000) },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || null;
}

async function logChat(userMessage, reply) {
  try {
    await HelpChatLog.create({ userMessage, assistantReply: reply });
  } catch (e) {
    console.warn('[help/chat] log persist failed:', e.message);
  }
}

async function chatHelp(req, res) {
  try {
    const raw = req.body?.message;
    if (typeof raw !== 'string') {
      return res.status(400).json({ error: 'message must be a string' });
    }
    const message = raw.trim();
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }
    if (message.length > 4000) {
      return res.status(400).json({ error: 'message is too long' });
    }

    const greet = greetingReply(message);
    if (greet) {
      await logChat(message, greet);
      return res.json({ reply: greet });
    }

    let faqs;
    try {
      faqs = await getFaqKnowledgeFromDb();
    } catch (e) {
      console.warn('[help/chat] FAQ DB read failed, using built-in list:', e.message);
      faqs = builtInFaqKnowledge();
    }

    const faqAns = faqMatchAnswer(message, faqs);
    if (faqAns) {
      await logChat(message, faqAns);
      return res.json({ reply: faqAns });
    }

    try {
      const ai = await openAiReply(message);
      if (ai) {
        await logChat(message, ai);
        return res.json({ reply: ai });
      }
    } catch (e) {
      console.warn('[help/chat] OpenAI failed, using fallback:', e.message);
    }

    const fb = fallbackReply();
    await logChat(message, fb);
    return res.json({ reply: fb });
  } catch (e) {
    console.error('[help/chat]', e);
    return res.status(500).json({ error: 'Could not generate a reply' });
  }
}

module.exports = { chatHelp };
