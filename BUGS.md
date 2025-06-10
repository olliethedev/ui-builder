# Bugs Found During Test Coverage Improvement

## Overview
This document tracks bugs discovered while adding tests to improve coverage from ~76% to 80%.

## Bugs Discovered

### 1. ConfigPanel Component - Null Reference Error
**File**: `components/ui/ui-builder/internal/config-panel.tsx:100`  
**Issue**: Component crashes when trying to read the `name` property of undefined layers  
**Error**: `Cannot read properties of undefined (reading 'name')`  
**Status**: Existing test expects this behavior (test marked as "documented expected behavior")  
**Impact**: Component doesn't handle edge cases gracefully - should have proper null/undefined checks

### 2. DOM Validation Issues in Variables Panel  
**File**: `components/ui/ui-builder/internal/variables-panel.tsx`  
**Issue**: DOM nesting validation warning - `<div>` cannot appear as child of `<select>`  
**Error**: `validateDOMNesting(...): <div> cannot appear as a child of <select>`  
**Status**: HTML structure issue  
**Impact**: Invalid HTML structure that could cause rendering issues

### 3. Schema Key Warnings in Props Panel
**File**: `components/ui/ui-builder/internal/props-panel.tsx:245`  
**Issue**: Multiple warnings about unknown schema keys being ignored  
**Warnings**: 
- `Key "children" does not exist in the schema and will be ignored`
- `Key "config" does not exist in the schema and will be ignored`  
- `Key "count" does not exist in the schema and will be ignored`
- `Key "enabled" does not exist in the schema and will be ignored`
**Status**: Schema definition mismatch  
**Impact**: Properties may not be processed correctly due to schema inconsistencies

### 4. React Props Validation Warnings
**Files**: Multiple component tests  
**Issues**:
- `Received true for a non-boolean attribute 'collapsible'` in breakpoint-classname-control  
- `React does not recognize the 'possibleTypes' prop on a DOM element` in classname-item-control  
- `Invalid value for prop 'component' on <select> tag` in classname-item-control  
**Status**: Props being passed to DOM elements that shouldn't receive them  
**Impact**: Console warnings and potential rendering issues

### 5. Iframe Component Act Warnings
**File**: `components/ui/ui-builder/internal/iframe-wrapper.tsx:170`  
**Issue**: State updates not wrapped in `act(...)` during tests  
**Error**: `Warning: An update to IframeWrapper inside a test was not wrapped in act(...)`  
**Status**: Test environment issue  
**Impact**: Test reliability - may cause timing issues in tests

## Notes for Future Fixes

1. **ConfigPanel**: Add proper null/undefined checks before accessing layer properties
2. **Variables Panel**: Fix HTML structure - don't nest divs inside select elements  
3. **Props Panel**: Align schema definitions with actual component props
4. **Component Props**: Filter out non-DOM props before passing to HTML elements
5. **Iframe Wrapper**: Wrap async state updates in `act()` for testing or handle them properly

## Test Coverage Status

- **Initial Coverage**: ~76%
- **Current Coverage**: 77.05%
- **Target Coverage**: 80%
- **Components Improved**:
  - `classname-field.tsx`: 0% → 100%
  - `name-edit.tsx`: 22.72% → 100%  
  - `dev-profiler.tsx`: 85.71% → 100%
  - `error-fallback.tsx`: Maintained 100%