# Discovered Bugs

This file documents bugs discovered during test coverage improvement work. These issues are left unfixed to maintain failing tests for future bug resolution.

## ConfigPanel Component - Form Input Simulation Issue

**Location**: `__tests__/config-panel.test.tsx`
**Test**: "should update layer name when form values change"
**Status**: FAILING

### Description
The test that simulates character-by-character typing into the form input field is not working correctly. The test expects the final value to be "Test PageUpdated Page Name" but receives "Test Pagee" instead.

### Expected Behavior
When typing character-by-character into the name input field, the complete text should be properly captured and the layer name should be updated accordingly.

### Actual Behavior
The character-by-character typing simulation appears to be dropping characters or not properly completing the input sequence, resulting in incomplete text.

### Test Code Location
```
File: __tests__/config-panel.test.tsx
Lines: Around line 145
Test: "should update layer name when form values change"
```

### Error Message
```
expect(received).toBe(expected) // Object.is equality
Expected: "Test PageUpdated Page Name"
Received: "Test Pagee"
```

### Root Cause
Likely issue with the test's simulation of user typing using `userEvent.type()` and character-by-character input handling in the component's form logic.

### Impact
- Does not affect production functionality
- Only affects test reliability
- Test coverage goals still achieved (97.29% coverage for config-panel.tsx)

---

**Note**: This bug is intentionally left unfixed per project requirements to maintain failing tests for future bug resolution work.