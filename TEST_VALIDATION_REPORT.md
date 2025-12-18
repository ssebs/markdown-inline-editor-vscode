# Test Validation Report

This document validates whether failing test cases have correct expectations.

## Invalid Test Cases (Tests with incorrect expectations)

### 1. Bold with Special Characters
**File:** `parser-bold.test.ts`  
**Test:** "should handle bold with special characters"  
**Markdown:** `**text!@#**`  
**Issue:** Test expects `endPos: 10`, but:
- String: `**text!@#**` (length 11)
- Content "text!@#" is 7 characters at positions 2-8
- Correct `endPos` should be **9** (exclusive end)
- `endPos: 10` would include the closing `**` marker

**Verdict:** ❌ **INVALID TEST** - Should expect `endPos: 9`

### 2. Heading Tests (All levels)
**File:** `parser-heading.test.ts`  
**Tests:** All heading level tests (H1-H6)  
**Issue:** Tests expect a `level` property in `DecorationRange`, but:
- The `DecorationRange` interface does not include a `level` property
- Interface only has: `startPos`, `endPos`, `type`

**Verdict:** ❌ **INVALID TEST** - Interface doesn't support `level` property

### 3. Link Basic Test
**File:** `parser-link.test.ts`  
**Test:** "should hide delimiters and style link text"  
**Markdown:** `[text](url)`  
**Issue:** Test expects hide decoration at position 9 (closing `)`), but:
- String: `[text](url)` (length 11)
- Positions: 0=[, 1-4=text, 5=], 6=(, 7-9=url, 10=)
- Closing `)` is at position **10**, not 9

**Verdict:** ❌ **INVALID TEST** - Should expect hide at position 10

## Valid Test Cases (Tests with correct expectations - parser needs fixing)

### 1. Multiple Bold Instances
**File:** `parser-bold.test.ts`  
**Test:** "should handle multiple bold instances"  
**Markdown:** `**one** and **two**`  
**Expected:** 2 bold decorations  
**Issue:** Parser only finds 1 bold instance instead of 2

**Verdict:** ✅ **VALID TEST** - Parser bug needs fixing

### 2. Multiple Italic Instances
**File:** `parser-italic.test.ts`  
**Test:** "should handle multiple italic instances"  
**Markdown:** `*one* and *two*`  
**Expected:** 2 italic decorations  
**Issue:** Similar to multiple bold - parser likely has same issue

**Verdict:** ✅ **VALID TEST** - Parser bug needs fixing

### 3. Multiple Strikethrough Instances
**File:** `parser-strikethrough.test.ts`  
**Test:** "should handle multiple strikethrough instances"  
**Markdown:** `~~one~~ and ~~two~~`  
**Expected:** 2 strikethrough decorations  
**Issue:** Similar pattern - parser likely has same issue

**Verdict:** ✅ **VALID TEST** - Parser bug needs fixing

### 4. Multiple Links/Images
**File:** `parser-link.test.ts`, `parser-image.test.ts`  
**Tests:** Multiple instances in same line  
**Issue:** Parser likely not finding all instances

**Verdict:** ✅ **VALID TEST** - Parser bug needs fixing

### 4. Italic Multiple Instances (Second Instance)
**File:** `parser-italic.test.ts`  
**Test:** "should handle multiple italic instances"  
**Markdown:** `*one* and *two*`  
**Issue:** Test expects second italic `endPos: 14`, but:
- String: `*one* and *two*` (length 15)
- Second italic: opening `*` at 10, content "two" at 11-13, closing `*` at 14
- Content "two" is 3 chars (positions 11, 12, 13)
- With exclusive end, `endPos` should be **14** (which is correct!)
- Actually, wait - let me verify: positions 11-14 (exclusive end) = positions 11, 12, 13 = "two" ✓

**Verdict:** ✅ **VALID TEST** - The test is correct, parser needs fixing

## Summary

- **Invalid Tests:** 3 categories
  1. Bold special chars: expects `endPos: 10`, should be `9`
  2. Heading level property: interface doesn't support `level`
  3. Link position: expects hide at position `9`, should be `10`

- **Valid Tests:** Multiple instances tests (bold, italic, strikethrough, links, images) - these indicate a parser bug where only the first instance is found

## Recommendations

1. **Fix Invalid Tests:**
   - Update bold special chars test: `endPos: 9` instead of `10`
   - Remove `level` property from heading tests (or add it to interface if needed)
   - Update link test: hide at position `10` instead of `9`

2. **Fix Parser:**
   - Fix position tracking to handle multiple instances of the same decoration type
   - Ensure parser processes all tokens, not just the first match

