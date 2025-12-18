# Performance Improvements TODO

This document tracks all performance improvements identified during the code review, organized by impact level.

## 🔴 CRITICAL - Highest Impact

- [x] **Cache parsed decorations per document version**
  - **Location**: `src/decorator.ts:30-32` → `updateDecorations()` → `updateDecorationsInternal()`
  - **Problem**: Every cursor movement triggers full remark AST parse even when content unchanged
  - **Solution**: 
    - Track document version (`document.version`)
    - Cache `Map<documentVersion, DecorationRange[]>`
    - On selection change, only re-filter cached decorations, skip parsing
    - Invalidate cache only on actual document content changes
  - **Impact**: Eliminates O(n) parsing on every selection change
  - **Status**: ✅ **COMPLETED** - Implemented LRU cache with document version tracking

- [x] **Decouple parsing from decoration application**
  - **Location**: `src/decorator.ts:131-254` - `updateDecorationsInternal()` does everything
  - **Problem**: Cannot optimize parsing independently from visual updates
  - **Solution**:
    - Split into `parseDocument()` (cached, returns decorations)
    - Split into `applyDecorations()` (fast, uses cached parse)
    - Separate concerns: parsing vs. filtering vs. application
  - **Impact**: Enables independent optimization of each phase
  - **Status**: ✅ **COMPLETED** - Refactored into `parseDocument()`, `filterDecorations()`, and `applyDecorations()`

- [x] **Implement incremental parsing for text changes**
  - **Location**: `src/decorator.ts:34-38` → `updateDecorations()` on document change
  - **Problem**: Small edits (single character) trigger full document parse
  - **Solution**:
    - Track changed regions from `TextDocumentChangeEvent`
    - Only re-parse affected regions
    - Merge with cached decorations from unchanged regions
    - Fall back to full parse for large changes (>50% of document)
  - **Impact**: Reduces parse time from O(n) to O(changed_region_size)
  - **Status**: ✅ **COMPLETED** - Added `updateDecorationsFromChange()` with change tracking support

## 🟠 HIGH - Significant Impact

- [ ] **Improve debounce strategy with batching**
  - **Location**: `src/decorator.ts:107-125` - 150ms debounce
  - **Problem**: Rapid typing still causes multiple full parses, just delayed
  - **Solution**:
    - Use `requestIdleCallback` for non-urgent updates
    - Track document version to skip redundant work
    - Batch multiple document changes into single parse
    - Different debounce times: immediate for selection, longer for typing
  - **Impact**: Reduces redundant parsing during rapid edits

- [x] **Add document version tracking**
  - **Location**: Missing throughout codebase
  - **Problem**: Cannot detect if document actually changed between parse and apply
  - **Solution**:
    - Store `lastParsedVersion` in Decorator
    - Check `document.version` before parsing
    - Skip parse if version unchanged
  - **Impact**: Prevents unnecessary work when document hasn't changed
  - **Status**: ✅ **COMPLETED** - Integrated into cache system with `CacheEntry.version`

- [x] **Optimize selection filtering**
  - **Location**: `src/decorator.ts:174-236` - filters after parsing
  - **Problem**: Wastes CPU parsing decorations that will be filtered out
  - **Solution**:
    - If document unchanged, only re-run filtering on cached decorations
    - Use spatial index for faster range intersection checks
    - Early exit optimizations in `isRangeSelected()`
  - **Impact**: Faster updates when only selection changes
  - **Status**: ✅ **COMPLETED** - Selection changes now only re-filter cached decorations, skip parsing

## 🟡 MEDIUM - Moderate Impact

- [ ] **Optimize decoration type storage**
  - **Location**: `src/decorator.ts:158-172` - separate arrays for each type
  - **Problem**: Memory allocation and iteration overhead
  - **Solution**:
    - Use `Map<DecorationType, Range[]>` instead of 15 separate arrays
    - Or use single array with type field, group during application
  - **Impact**: Reduces memory allocations and simplifies code

- [ ] **Batch decoration application**
  - **Location**: `src/decorator.ts:239-253` - 15 separate `setDecorations()` calls
  - **Problem**: VS Code API overhead, potential re-renders
  - **Solution**:
    - Check if VS Code API supports batch decoration updates
    - Group decorations by type more efficiently
    - Consider decoration type pooling/reuse
  - **Impact**: Reduces API call overhead

- [ ] **Early exit for non-markdown files**
  - **Location**: `src/decorator.ts:135-137` - check happens after debounce
  - **Problem**: Unnecessary debounce setup for non-markdown files
  - **Solution**:
    - Check language ID in `updateDecorations()` before debounce
    - Early return if not markdown
  - **Impact**: Prevents unnecessary work for non-markdown files

- [ ] **Cache document text with version check**
  - **Location**: `src/decorator.ts:139` - `document.getText()` on every update
  - **Problem**: String allocation for large documents
  - **Solution**:
    - Cache text with version: `Map<version, text>`
    - Only retrieve if version changed
    - Or use incremental text access if available
  - **Impact**: Reduces memory allocations for large documents

## 🟢 LOW - Minor Optimizations

- [ ] **Optimize ancestor tracking**
  - **Location**: `src/parser.ts:142-151` - builds ancestor chain on every node
  - **Problem**: O(n²) worst case for deeply nested structures
  - **Solution**: Build ancestor chain during single-pass traversal using stack
  - **Impact**: Reduces complexity for nested markdown

- [ ] **Optimize range intersection checks**
  - **Location**: `src/decorator.ts:295-312` - `isRangeSelected()` checks all selections
  - **Problem**: O(n×m) where n=decorations, m=selections
  - **Solution**:
    - Use spatial index (R-tree) for decorations
    - Early exit optimizations
    - Cache intersection results for common cases
  - **Impact**: Faster selection filtering for many decorations

- [ ] **Memoize position conversions**
  - **Location**: `src/decorator.ts:269-280` - `createRange()` calls `positionAt()` repeatedly
  - **Problem**: VS Code API calls for same positions
  - **Solution**:
    - Cache `Map<offset, Position>` conversions
    - Batch position conversions
  - **Impact**: Reduces VS Code API overhead

## Notes

- Focus on Phase 1 first for immediate performance gains
- Measure before and after each change to validate improvements
- Consider user experience: selection changes should feel instant
- Document changes should feel responsive even during rapid typing
- Large documents (>1000 lines) should remain usable

