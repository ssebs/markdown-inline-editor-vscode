# Heading Whitespace Visualization Offset Bug

## Issue Summary

When rendering markdown headings in the VS Code inline editor, the whitespace character after the heading marker (`#`) was not being hidden, causing a visual offset where the first character of the heading text (e.g., "H" in "Heading") appeared to be missing or covered by the visible space.

**Symptom:** Headings displayed as `eading 1` instead of `Heading 1` (the "H" was covered by the visible space after `#`).

## Root Cause

The parser's `processHeading()` method was only hiding the heading marker characters (`#`, `##`, etc.) but not the whitespace that follows them. This caused:

1. Hide decoration: `[0-1]` for `# Heading 1` (only covered `#`)
2. Heading decoration: `[2-11]` (covered `Heading 1`)
3. **Result:** The space at position 1 remained visible, covering the "H" at position 2

## Solution

Modified `processHeading()` in `src/parser.ts` to:

1. **Calculate whitespace length** after the marker
2. **Hide both marker AND whitespace** in a single decoration
3. **Start heading content decoration** after the hidden portion

### Code Changes

**Before:**
```typescript
// Hide the heading marker
decorations.push({
  startPos: start,
  endPos: start + markerLength,  // Only hides the marker
  type: 'hide',
});

// Find content start (after marker and whitespace)
let contentStart = start + markerLength;
while (contentStart < end && /\s/.test(text[contentStart])) {
  contentStart++;
}
```

**After:**
```typescript
// Find whitespace after marker
const contentStart = start + markerLength;
let whitespaceLength = 0;
let posAfterMarker = contentStart;
while (posAfterMarker < end && /\s/.test(text[posAfterMarker])) {
  whitespaceLength++;
  posAfterMarker++;
}

const hideEnd = contentStart + whitespaceLength;

// Hide the marker AND the whitespace after it
decorations.push({
  startPos: start,
  endPos: hideEnd,  // Hides both marker and whitespace
  type: 'hide',
});
```

## Verification

**Parser Output (Fixed):**
- `# Heading 1` → Hide: `[0-2]` covers `# `, Heading: `[2-11]` covers `Heading 1`
- `## Heading 2` → Hide: `[0-3]` covers `## `, Heading: `[3-12]` covers `Heading 2`
- `### Heading 3` → Hide: `[0-4]` covers `### `, Heading: `[4-13]` covers `Heading 3`
- `#### Heading 4` → Hide: `[0-5]` covers `#### `, Heading: `[5-14]` covers `Heading 4`
- `##### Heading 5` → Hide: `[0-6]` covers `##### `, Heading: `[6-15]` covers `Heading 5`
- `###### Heading 6` → Hide: `[0-7]` covers `###### `, Heading: `[7-16]` covers `Heading 6`

**Test Results:**
- All 125 tests pass
- Heading-specific tests updated to verify whitespace is hidden
- Works correctly with both LF and CRLF line endings

## Files Changed

- `src/parser.ts` - Fixed `processHeading()` method
- `src/parser/__tests__/parser-heading.test.ts` - Updated tests to expect new behavior

## Related

- Original bug report: `docs/bug.md`
- This fix ensures consistent behavior across all heading levels (H1-H6)

## Date Fixed

Fixed after switching to remark parser. The issue was identified when headings displayed incorrectly with visible whitespace covering the first character of heading text.

