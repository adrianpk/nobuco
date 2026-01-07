/**
 * Test samples for nobuco filter development
 * These are anonymized examples of post formats we want to filter
 */

// Example 1: Excessive whitespace + bait opener + emoji
const SAMPLE_SILLY_1 = `Wild: ACME Corp just announced Skynet 2.0, the world's first thinking, reasoning autonomous robot AI, launching globally later this year 😳

Put simply, ACME just taught robots how to think out loud.

Until now, robotics systems did two things: they saw the world & then reacted to it.

Skynet 2.0 adds the missing layer.

It reasons.

Sensor input → internal logic → action.

And the system can explain why it did what it did.

Not vibes.
Not a black box.
Actual decision logic.

In the demo, the robot doesn't just move. It explains:

→ Why a person looks uncertain,
→ Why an obstacle changes priorities,
→ Why waiting now avoids risk later.

That single change unlocks everything.

Debugging.
Trust.
Regulatory approval.
Real automation.

This matters because automation doesn't fail at 80% or 90%.

It fails at 99%.

The last 1%: weird edge cases, confusing human behavior, scenes no rules engine can hard-code.

That long tail is where failures live, and reasoning is how you attack it.

The coolest part?

ACME didn't keep this closed. They open-sourced the entire stack: the model, the tools, the simulator, the data.

That's a brilliant strategy.

It's basically Android for robotics.
Framework for automation.

Software becomes a commodity.
Compute becomes the choke point.

Guess who sells the compute 😎

And no - this isn't bad news for competitors.

If anything, it validates their vision-only, end-to-end approach.

But here's the hard truth leaders keep pointing to…

You don't solve the last 1% in simulation alone. You solve it with real-world experience.

At scale. Every day.

Skynet 2.0 helps everyone start. Data moats decide who finishes.

Most importantly, this isn't really about robots.

It's about physical AI.

Because the same reasoning stack works for devices, factories, warehouses, drones, and machines operating in the real world.

Once AI can reason about reality, software stops being the bottleneck.

Reality does.

And ACME just moved the entire industry one step closer to that.

P.S. check out my course on AI stuff`;

// Example 2: Normal professional post (should NOT be filtered)
const SAMPLE_NORMAL = `We're excited to announce our Q4 results and share some insights about what we learned this year.

Our team focused on three main areas: improving product quality, expanding our customer support capabilities, and investing in R&D for next-generation features. The results exceeded our expectations, with customer satisfaction scores increasing by 23% and retention improving significantly.

Some key takeaways from this quarter:
- Early customer feedback is invaluable for product development
- Cross-functional collaboration drives innovation
- Investing in team development pays long-term dividends

Looking ahead to 2026, we're doubling down on our core mission while exploring new opportunities in emerging markets. We're grateful for our team's dedication and our customers' trust.

Happy to discuss our approach in the comments.`;

// Example 3: Another silly format - one-liner spam
const SAMPLE_SILLY_2 = `🔥 Hot take 🔥

Most people don't understand this.

But I'm about to explain it.

Ready?

Here we go.

Success isn't about working hard.

It's about working smart.

Mind. Blown. 🚀

Let that sink in.

Agree? 💯`;

// Test function - copy the RULES and score function from content.js
function testSample(text, label) {
  const RULES = [
    t => (t.match(/\n/g) || []).length >= 4,
    t => t.length < 300,
    t => /\p{Extended_Pictographic}/u.test(t),
    t => t.split("\n").filter(l => l.trim().length < 60).length >= 5,
    t => /(🔥|🚀|💯){2,}/u.test(t),
    t => /^(Wild|Hot take|Unpopular opinion|Controversial|Real talk|Let that sink in|Mind[.\s]*blown|Unsettling|Shocking|Game[- ]changer|This changes everything)/i.test(t.trim()),
    t => {
      const lines = t.split("\n").filter(l => l.trim().length > 0);
      const veryShortLines = lines.filter(l => l.trim().length < 30).length;
      return lines.length > 10 && (veryShortLines / lines.length) > 0.5;
    },
    t => (t.match(/[→↳•✓✔✅❌]/g) || []).length >= 3,
  ];

  const matches = RULES.filter(r => r(text)).length;
  const score = matches / RULES.length;
  const threshold = 0.5; // Should match content.js

  console.log(`\n=== ${label} ===`);
  console.log(`Score: ${score.toFixed(2)} (threshold: ${threshold})`);
  console.log(`Action: ${score >= threshold ? 'HIDDEN ✅' : 'VISIBLE ❌'}`);
  console.log(`Line breaks: ${(text.match(/\n/g) || []).length}`);
  console.log(`Length: ${text.length}`);
  console.log(`Short lines: ${text.split("\n").filter(l => l.trim().length < 60).length}`);
  console.log(`Has emojis: ${/\p{Extended_Pictographic}/u.test(text)}`);
}

// Example 4: Real LinkedIn post from user (anonymized slightly)
const SAMPLE_REAL_LINKEDIN = `Unsettling: AI isn't just changing how we write - it's literally reshaping our brains 😳

A recent study from MIT analyzed the brains of writers using EEG while they drafted essays:

→ With AI like ChatGPT
→ With search engines
→ Completely unassisted

The results were quite alarming:

↳ AI users showed 83% lower recall of their own work, struggling significantly to quote sentences they'd just written.

↳ EEG scans revealed drastic reductions in brain connectivity, especially in crucial alpha and beta bands linked to memory and attention.

↳ Reliance on AI weakened the neural signatures that represent our unique linguistic style and creative fingerprints.

The worrying part?

Participants heavily dependent on AI experienced lasting "cognitive debt" - persistently reduced brain activity even when AI was later removed 🤯

Yet, there's hope.

Those who began with brain-only writing and later integrated AI showed robust neural networks, suggesting a balance between AI use and unaided practice can strengthen cognitive skills rather than diminish them.

The takeaway is clearer than it looks:

AI is a powerful ally, but constant reliance dulls your mental edge.

To keep your brain sharp and creativity intact, use AI to extend thinking, not replace it.

Practice without it regularly.

Your brain is your greatest asset, so use AI wisely, not blindly.`;

// Run tests
testSample(SAMPLE_SILLY_1, "SAMPLE 1: Whitespace abuse + bait");
testSample(SAMPLE_NORMAL, "SAMPLE 2: Normal professional post");
testSample(SAMPLE_SILLY_2, "SAMPLE 3: One-liner spam");
testSample(SAMPLE_REAL_LINKEDIN, "SAMPLE 4: Real LinkedIn post (Unsettling + arrows)");
