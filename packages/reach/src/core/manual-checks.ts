import type { AxeResults } from './types.js';
import type { ManualCheckDefinition, ManualCheckResult, ManualCheckStatus } from './types.js';

export const MANUAL_CHECK_DEFINITIONS: ManualCheckDefinition[] = [
  {
    id: 'image-alt',
    title: 'Image Alternative Text',
    category: 'common',
    description:
      'Confirms meaningful images include descriptive alternative text and decorative images are marked appropriately.',
    whyItMatters:
      'People who rely on screen readers need alt text to understand the purpose of non-text content.',
    whatToLookFor: [
      'Meaningful images describe purpose or action, not purely visual detail.',
      'Decorative images use empty alt attributes (alt="").',
    ],
    automation: 'hybrid',
    relatedRuleIds: ['image-alt', 'area-alt', 'input-image-alt'],
    manualNotes: 'Review alt text manually to ensure it communicates intent and context.',
  },
  {
    id: 'page-title',
    title: 'Page Title',
    category: 'common',
    description: 'Ensures each page exposes a descriptive, unique <title> element.',
    whyItMatters:
      'Page titles are the first announcement for screen reader users and orient everyone to their location.',
    whatToLookFor: [
      'Titles summarize the page purpose in a concise phrase.',
      'Different sections expose different titles to avoid confusion.',
    ],
    automation: 'hybrid',
    relatedRuleIds: ['page-title'],
    manualNotes:
      'Verify the copy reflects the page content and is distinguishable from other pages.',
  },
  {
    id: 'headings',
    title: 'Headings',
    category: 'common',
    description: 'Validates heading structure and hierarchy so content is navigable by outline.',
    whyItMatters:
      'Screen reader and keyboard users skim by heading level to grasp structure quickly.',
    whatToLookFor: [
      'A single first-level heading establishes the page topic.',
      'Subsequent headings increase one level at a time without skipping.',
    ],
    automation: 'hybrid',
    relatedRuleIds: ['heading-order', 'landmark-one-main', 'region'],
    manualNotes:
      "Check visually that headings convey a logical outline and that important sections aren't plain paragraphs.",
  },
  {
    id: 'color-contrast',
    title: 'Color Contrast',
    category: 'common',
    description: 'Measures contrast between text or interactive elements and their backgrounds.',
    whyItMatters:
      'Low contrast makes content unreadable for people with low vision or color deficiencies.',
    whatToLookFor: [
      'Normal text meets at least 4.5:1 contrast; large text meets 3:1.',
      'Interactive states (hover, focus, active) also remain perceivable.',
    ],
    automation: 'hybrid',
    relatedRuleIds: ['color-contrast', 'link-in-text-block'],
    manualNotes:
      'Verify gradients, background images, and focus outlines maintain adequate contrast.',
  },
  {
    id: 'skip-link',
    title: 'Skip Link',
    category: 'common',
    description: 'Checks for keyboard-only mechanisms to bypass repeated navigation.',
    whyItMatters:
      'Skip links or landmarks let assistive technology users jump to main content efficiently.',
    whatToLookFor: [
      'The first tabbable element is a functional skip link or landmark.',
      'Focus moves to the main content container when activated.',
    ],
    automation: 'hybrid',
    relatedRuleIds: ['bypass'],
    manualNotes: 'Confirm the skip link is visible on focus and targets the correct region.',
  },
  {
    id: 'visible-focus',
    title: 'Visible Keyboard Focus',
    category: 'common',
    description:
      'Evaluates whether focus order and indicators are perceivable as users tab through the page.',
    whyItMatters:
      'Keyboard users must always know which element is active to interact confidently.',
    whatToLookFor: [
      'Each tabbable element exposes a clear focus outline.',
      "Focus isn't trapped within overlays or hidden containers.",
    ],
    automation: 'hybrid',
    relatedRuleIds: ['focus-order-semantics', 'focus-visible', 'focus-trap'],
    manualNotes:
      'Run a manual tab-through to ensure focus indicators are prominent and meet contrast guidelines.',
  },
  {
    id: 'language',
    title: 'Language of Page',
    category: 'common',
    description: 'Requires the root HTML element to define the primary language.',
    whyItMatters:
      'Assistive technologies pronounce content correctly only when the language is set.',
    whatToLookFor: [
      'The <html> element includes a valid BCP 47 language code.',
      'Localized pages update the attribute accordingly.',
    ],
    automation: 'automated',
    relatedRuleIds: ['html-has-lang', 'html-lang-valid'],
  },
  {
    id: 'zoom',
    title: 'Zoom',
    category: 'common',
    description:
      'Prompts verification that layout and interaction remain usable at 200–400% browser zoom.',
    whyItMatters:
      'Many people enlarge content to read; layouts must reflow without breaking functionality.',
    whatToLookFor: [
      'At 200% zoom the page avoids horizontal scrolling for primary content.',
      'Controls and dialogs remain visible and usable when zoomed.',
    ],
    automation: 'manual',
    manualNotes: 'Manually zoom the page and confirm responsive behavior without clipped content.',
  },
  {
    id: 'captions',
    title: 'Captions',
    category: 'audiovisual',
    description:
      'Ensures media with audio includes synchronized captions covering speech and relevant sounds.',
    whyItMatters: 'Captions make audio content accessible to Deaf and hard-of-hearing audiences.',
    whatToLookFor: [
      'Captions include dialogue, speaker identification, and essential sound effects.',
      'Caption controls are easy to locate and enable.',
    ],
    automation: 'manual',
    manualNotes:
      'Play each media asset and verify captions are present, accurate, and synchronized.',
  },
  {
    id: 'transcripts',
    title: 'Transcripts',
    category: 'audiovisual',
    description:
      'Confirms audio and video assets provide full text transcripts separate from the player.',
    whyItMatters:
      'Transcripts support Deaf users and anyone who prefers or requires text alternatives.',
    whatToLookFor: [
      'Transcripts cover spoken words and meaningful non-speech audio cues.',
      'Transcripts are easy to access near the media player.',
    ],
    automation: 'manual',
    manualNotes:
      'Inspect media detail pages or documentation for downloadable or inline transcripts.',
  },
  {
    id: 'audio-description',
    title: 'Audio Description',
    category: 'audiovisual',
    description:
      'Checks that visual information in video content has an audio-described alternative or secondary track.',
    whyItMatters:
      'Blind and low-vision users depend on narration of visual context to follow video stories.',
    whatToLookFor: [
      'Look for a described-video track or narration covering on-screen text, visuals, and actions.',
      'Ensure instructions and captions reference the availability of audio description.',
    ],
    automation: 'manual',
    manualNotes:
      'Watch representative videos while toggling described tracks or confirm alternate versions exist.',
  },
  {
    id: 'labels',
    title: 'Labels',
    category: 'forms',
    description: 'Validates that every form field exposes a programmatic and visible label.',
    whyItMatters:
      'Labels tell everyone what information to enter; assistive tech announces them before inputs.',
    whatToLookFor: [
      'Inputs use <label for>, aria-label, or aria-labelledby with descriptive copy.',
      'Icons or placeholders alone are not used as the only label.',
    ],
    automation: 'hybrid',
    relatedRuleIds: ['label', 'aria-label', 'aria-labelledby', 'form-field-multiple-labels'],
    manualNotes:
      'Review complex fields (date pickers, custom dropdowns) to ensure labels are read correctly.',
  },
  {
    id: 'required-fields',
    title: 'Required Fields',
    category: 'forms',
    description:
      'Highlights inputs that must be completed and ensures requirements are communicated.',
    whyItMatters: 'People need advance notice of required information to avoid validation errors.',
    whatToLookFor: [
      'Required fields are programmatically marked (required attribute or aria-required).',
      'Visual indicators (asterisks, helper text) are explained and consistent.',
    ],
    automation: 'hybrid',
    relatedRuleIds: ['aria-required-attr', 'aria-required-parent', 'aria-required-children'],
    manualNotes:
      'Attempt form submission to confirm errors are announced and instructions stay visible.',
  },
];

const CATEGORY_ORDER: ManualCheckDefinition['category'][] = ['common', 'audiovisual', 'forms'];

export function buildManualCheckResults(axeResults: AxeResults): ManualCheckResult[] {
  const violationIds = new Set(axeResults.violations.map((v) => v.id));
  const passIds = new Set(axeResults.passes.map((pass) => pass.id));
  const incompleteIds = new Set(axeResults.incomplete.map((rule) => rule.id));

  return MANUAL_CHECK_DEFINITIONS.map((definition) => {
    const related = definition.relatedRuleIds ?? [];
    const hasRelatedViolations = related.some((id: string) => violationIds.has(id));
    const hasRelatedPasses = related.some((id: string) => passIds.has(id));
    const hasRelatedIncomplete = related.some((id: string) => incompleteIds.has(id));

    let status: ManualCheckStatus;
    let notes: string | undefined;

    if (definition.automation === 'manual') {
      status = 'manual';
      notes = definition.manualNotes;
    } else if (hasRelatedViolations) {
      status = 'fail';
      notes = definition.manualNotes;
    } else if (hasRelatedIncomplete) {
      status = 'needs-review';
      notes =
        definition.manualNotes ?? 'Automated engine marked this rule incomplete; review manually.';
    } else if (definition.automation === 'hybrid') {
      status = 'needs-review';
      notes = definition.manualNotes;
      if (hasRelatedPasses && !definition.manualNotes) {
        notes = 'No automated issues detected; still perform a quick manual spot check.';
      }
    } else {
      status = hasRelatedPasses ? 'pass' : 'needs-review';
      notes = definition.manualNotes;
    }

    return {
      ...definition,
      relatedRuleIds: related,
      status,
      notes,
    } satisfies ManualCheckResult;
  }).sort((a, b) => {
    const categoryDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (categoryDiff !== 0) {
      return categoryDiff;
    }
    return a.title.localeCompare(b.title);
  });
}
