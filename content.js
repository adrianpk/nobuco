/**
 * Nobuco - LinkedIn Feed Filter
 *
 * PURPOSE:
 * Filters LinkedIn posts based on writing style patterns (not content/topics).
 * Targets "infantilized" formatting: excessive line breaks, one-liners, emoji-heavy layouts.
 *
 * PRIVACY GUARANTEE:
 * - All processing happens locally in your browser
 * - ZERO network requests (check DevTools Network tab - you'll see nothing)
 * - ZERO data collection, analytics, or telemetry
 * - This script only: reads post text from DOM → scores it → hides element if needed
 * - Your data NEVER leaves your computer
 *
 * HOW IT WORKS:
 * 1. Find LinkedIn post elements in the DOM
 * 2. Extract text content from each post
 * 3. Score text using heuristics (line breaks, length, emojis)
 * 4. If score >= threshold, hide the post with CSS (display: none)
 * 5. Use MutationObserver to handle LinkedIn's infinite scroll
 *
 * TRANSPARENCY:
 * - Open source - audit this code yourself
 * - No obfuscation, no minification
 * - No permissions beyond reading LinkedIn pages
 * - Conservative failure mode: if unsure, post stays visible
 */

// --- Config ---
const THRESHOLD = 0.4; // Posts scoring >= 40% on heuristics get hidden (adjust 0.0-1.0)
const DEBUG = true;    // Set to false for production - logs filtering decisions to console

// --- Settings (loaded from storage) ---
let settings = {
  filterSpam: true,
  filterPolls: true
};

// Load settings from storage
chrome.storage.sync.get(settings, (stored) => {
  settings = { ...settings, ...stored };
  if (DEBUG) console.log('[nobuco] Settings loaded:', settings);
  process(); // Re-process with loaded settings
});

// Listen for setting changes
chrome.storage.onChanged.addListener((changes) => {
  for (const key in changes) {
    settings[key] = changes[key].newValue;
  }
  if (DEBUG) console.log('[nobuco] Settings updated:', settings);
  // Reset processed posts to re-evaluate with new settings
  document.querySelectorAll('[data-silly-checked]').forEach(post => {
    delete post.dataset.sillyChecked;
    post.style.display = '';
    delete post.dataset.nobucohidden;
  });
  process();
});

// --- Heuristic rules ---
// Each rule returns a score (0 = no match, 1 = match, 2 = strong match)
// This allows weighting certain patterns more heavily
const RULES = [
  t => ((t.match(/\n/g) || []).length >= 4) ? 1 : 0,                 // many line breaks
  t => (t.length < 300) ? 1 : 0,                                      // deceptively short length
  t => /\p{Extended_Pictographic}/u.test(t) ? 1 : 0,                  // contains emojis
  t => (t.split("\n").filter(l => l.trim().length < 60).length >= 5) ? 1 : 0, // many short lines
  t => /(🔥|🚀|💯){2,}/u.test(t) ? 1 : 0,                             // repeated hype emojis
  t => /^(Wild|Hot take|Unpopular opinion|Controversial|Real talk|Let that sink in|Mind[.\s]*blown|Unsettling|Shocking|Game[- ]changer|This changes everything)/i.test(t.trim()) ? 1 : 0,
  t => {
    // High whitespace-to-content ratio (lots of short dramatic lines)
    const lines = t.split("\n").filter(l => l.trim().length > 0);
    const veryShortLines = lines.filter(l => l.trim().length < 30).length;
    return (lines.length > 10 && (veryShortLines / lines.length) > 0.5) ? 1 : 0;
  },
  t => ((t.match(/[→↳•✓✔✅❌]/g) || []).length >= 3) ? 1 : 0,  // decorative bullets/arrows
  t => {
    // High paragraph fragmentation: many "paragraphs" that are just single lines
    // Detects bro-style posts where every sentence is its own paragraph
    // Weight: 2 (this pattern alone is a strong signal)
    const blocks = [];
    let current = [];
    for (const line of t.split('\n')) {
      if (line.trim() === '') {
        if (current.length > 0) {
          blocks.push(current);
          current = [];
        }
      } else {
        current.push(line);
      }
    }
    if (current.length > 0) blocks.push(current);
    const singleLineBlocks = blocks.filter(b => b.length === 1).length;
    return (blocks.length >= 6 && (singleLineBlocks / blocks.length) > 0.7) ? 2 : 0;
  },
];

const MAX_SCORE = 10; // sum of all weights (8 rules × 1 + fragmentation × 2)

// --- Scoring ---
function score(text) {
  const points = RULES.reduce((sum, rule) => sum + rule(text), 0);
  return points / MAX_SCORE;
}

// --- DOM helpers ---
function findPosts() {
  // LinkedIn uses dynamic class names, so we target multiple selectors
  return document.querySelectorAll([
    'div.feed-shared-update-v2',
    'div[data-urn^="urn:li:activity"]',
    'div.fie-impression-container',
    // Group posts and newer LinkedIn feed structure
    '[data-view-name="feed-full-update"]',
    '[role="listitem"][componentkey*="Feed"]'
  ].join(', '));
}

function extractText(post) {
  // Try multiple selectors to find post text
  const selectors = [
    'span.break-words',
    'div.update-components-text',
    'div.update-components-update-v2__commentary',
    'div.feed-shared-inline-show-more-text'
  ];

  for (const selector of selectors) {
    const node = post.querySelector(selector);
    if (node && node.innerText) {
      return node.innerText;
    }
  }

  return "";
}

function hasPoll(post) {
  // Detect LinkedIn polls by their DOM structure
  const pollSelectors = [
    'div.update-components-poll',
    'fieldset[role="radiogroup"]',
    '.update-components-poll-option',
    // New LinkedIn poll structure (2024+)
    '[data-view-name="feed-poll-vote-option"]',
    '[data-view-name="feed-poll-view-question"]',
    '[data-view-name="feed-poll-voters-list"]'
  ];

  for (const selector of pollSelectors) {
    if (post.querySelector(selector)) {
      return true;
    }
  }
  return false;
}

// --- Processing ---
function process() {
  findPosts().forEach(post => {
    // Skip already-processed posts
    if (post.dataset.sillyChecked) return;
    post.dataset.sillyChecked = "true";

    let shouldHide = false;
    let hideReason = '';

    // Check for polls first (if enabled)
    if (settings.filterPolls && hasPoll(post)) {
      shouldHide = true;
      hideReason = 'POLL';
      if (DEBUG) {
        console.log('[nobuco] Post analysis:', {
          reason: 'poll detected',
          action: 'HIDDEN'
        });
      }
    }

    // Check spam heuristics (if enabled and not already hidden)
    if (!shouldHide && settings.filterSpam) {
      const text = extractText(post);
      if (!text) {
        if (DEBUG) console.log('[nobuco] No text extracted from post, skipping', post);
        return; // Conservative: if we can't read it, leave it visible
      }

      const postScore = score(text);
      shouldHide = postScore >= THRESHOLD;
      hideReason = 'SPAM';

      if (DEBUG) {
        console.log('[nobuco] Post analysis:', {
          score: postScore.toFixed(2),
          threshold: THRESHOLD,
          action: shouldHide ? 'HIDDEN' : 'VISIBLE',
          preview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          lineBreaks: (text.match(/\n/g) || []).length,
          length: text.length,
          hasEmojis: /\p{Extended_Pictographic}/u.test(text)
        });
      }
    }

    // Hide if any filter matched
    if (shouldHide) {
      post.style.display = "none";
      post.dataset.nobucohidden = hideReason;
    }
  });
}

// --- LinkedIn dynamic loading ---
const observer = new MutationObserver(process);
observer.observe(document.body, { childList: true, subtree: true });

// Initial pass
process();
