# Bugs Found During Test Coverage Improvement

This document tracks bugs discovered while adding comprehensive tests to improve coverage to 90%.

## 1. CodeBlock isCopied State Issue
**File**: `components/ui/ui-builder/codeblock.tsx`
**Issue**: The `isCopied` state from `useCopyToClipboard` hook doesn't seem to properly control the icon display. When `isCopied` is true, the component should show a CheckIcon instead of CopyIcon, but this isn't working as expected in tests.
**Test Location**: `__tests__/codeblock.test.tsx` - "CodeBlock with isCopied state" tests
**Severity**: Medium - Affects user feedback but doesn't break core functionality

## 2. Markdown Component Export/Import Issue
**File**: `components/ui/ui-builder/markdown.tsx`
**Issue**: There seems to be an issue with how the custom components (anchor, image, code) are being passed to ReactMarkdown. The components object is undefined when trying to access `components.a`, `components.img`, etc.
**Test Location**: `__tests__/markdown.test.tsx` - "Markdown component functions" tests
**Severity**: Low - Components may not be rendering with custom styling/behavior

## 3. React DOM Attribute Warnings
**Files**: Various components in `components/ui/ui-builder/internal/classname-control/`
**Issue**: Several components are passing invalid props to DOM elements:
- `collapsible="true"` should be `collapsible={true.toString()}` or removed
- `possibleTypes` prop is being passed to DOM select element
- `component` prop with invalid value being passed to select element
**Test Location**: Appears in console warnings during test runs
**Severity**: Low - Causes console warnings but doesn't break functionality

## 4. React Testing Act Warnings  
**File**: `components/ui/ui-builder/internal/iframe-wrapper.tsx`
**Issue**: State updates in `setIsMounted(true)` are not wrapped in `act()` causing test warnings
**Test Location**: `__tests__/iframe-wrapper.test.tsx`
**Severity**: Low - Test warnings only, doesn't affect production code

## 5. HTML Validation Issues
**Files**: Various components
**Issue**: Several HTML validation problems:
- Invalid DOM nesting (div inside select)
- Unrecognized React props on DOM elements (`colorTheme`, `borderRadius`)
- Invalid tag names (underscore-prefixed tags like `<_page_>`)
**Test Location**: Console warnings during test execution
**Severity**: Low - May affect HTML validation and accessibility

## Notes
- These bugs were discovered while writing comprehensive tests to improve coverage
- Many are test-specific issues rather than production bugs
- Some are related to component prop passing and DOM attribute validation
- All tests that discovered these bugs have been kept in place to help fix them later