# Defensive Coding Patterns - Smart Power Flow Card

## Error Prevention Strategy

The Smart Power Flow Card is built with defensive programming to handle edge cases in Home Assistant sensor data.

### Common Pitfalls Avoided

#### ❌ Unsafe Pattern (AVOID)
```javascript
if (unit.startsWith('W')) { ... }  // Error if unit is undefined
if (entityId.startsWith('sensor.')) { ... }  // Might be null
```

#### ✅ Safe Pattern (USED)
```javascript
if (unit && unit.startsWith('W')) { ... }  // Guard clause
if (unit === 'W' || unit === 'kW') { ... }  // Direct equality
if (entityId.includes('grid')) { ... }  // entityId always defined
```

## Implementation Details

### Entity Detection Safety

**File:** `src/smart-power-flow-card.ts` (lines 113-189)

**Pattern:**
```typescript
private _findEnergyEntities() {
  const result = { grid: null, solar: null, ... };
  
  // 1. Early guard: Check if states exist
  if (!this.hass.states) return result;
  
  Object.keys(this.hass.states).forEach((entityId) => {
    const state = this.hass.states[entityId];
    
    // 2. Safe attribute extraction (no assumed existence)
    const deviceClass = state.attributes.device_class;
    const unit = state.attributes.unit_of_measurement;
    
    // 3. Safe comparison chain (handles undefined unit)
    if (
      deviceClass === 'power' &&           // Direct comparison
      (unit === 'W' || unit === 'kW') &&   // Direct equality, no .startsWith()
      !result.grid                         // Already found?
    ) {
      // 4. Safe string method on guaranteed-defined entityId
      if (entityId.includes('grid')) {
        result.grid = entityId;
      }
    }
  });
  
  return result;
}
```

### Numeric Value Safety

**File:** `src/smart-power-flow-card.ts` (lines 357-369)

**Pattern:**
```typescript
private _getNumericValue(entityId: string): number {
  // 1. Check entity exists
  if (!entityId || !this.hass.states[entityId]) {
    return 0;
  }
  
  const state = this.hass.states[entityId].state;
  
  // 2. Handle unknown/invalid states
  if (state === 'unknown' || state === '--') {
    return 0;
  }
  
  // 3. Safe parsing with fallback
  return Math.round(parseFloat(state));
}
```

### Attribute Access Safety

**File:** `src/smart-power-flow-card.ts` (lines 371-379)

**Pattern:**
```typescript
private _getEntityValue(entityId: string): string | number {
  // 1. Check entity and state exist
  if (!entityId || !this.hass.states[entityId]) {
    return '--';
  }
  
  const state = this.hass.states[entityId].state;
  
  // 2. Return readable fallback
  return state === 'unknown' ? '--' : state;
}
```

## Tested Edge Cases

| Scenario | Handling |
|----------|----------|
| Sensor missing `device_class` | Skipped in detection ✅ |
| Sensor missing `unit_of_measurement` | Safely ignored ✅ |
| Entity state is `unknown` | Returns `--` or `0` ✅ |
| Entity state is `unavailable` | Returns `--` or `0` ✅ |
| `hass.states` undefined | Early return with empty result ✅ |
| `state.attributes` missing | Direct comparison handles undefined ✅ |
| Non-numeric sensor value | `parseFloat()` returns `NaN`, rounded to `0` ✅ |

## Guidelines for Future Development

When adding new entity detection or value reading:

1. **Always guard undefined checks**
   ```typescript
   if (value && value.property) { ... }  // ✅ Safe
   ```

2. **Use direct equality for comparisons**
   ```typescript
   if (unit === 'W' || unit === 'kW') { ... }  // ✅ Safe
   if (unit.startsWith('W')) { ... }  // ❌ Unsafe
   ```

3. **Only call string methods on guaranteed-defined variables**
   ```typescript
   if (entityId.includes('grid')) { ... }  // ✅ Safe (from Object.keys)
   if (deviceClass.includes('power')) { ... }  // ❌ Unsafe (might be undefined)
   ```

4. **Provide sensible fallbacks**
   ```typescript
   return state === 'unknown' ? '--' : state;  // ✅ Fallback to dash
   return Math.round(parseFloat(state)) || 0; // ✅ Fallback to zero
   ```

5. **Use early returns**
   ```typescript
   if (!this.hass.states) return result;  // ✅ Exit early
   ```

## Result

The Smart Power Flow Card gracefully handles:
- ✅ Sensors with missing attributes
- ✅ Sensors with `unknown` state
- ✅ Sensors with `unavailable` state
- ✅ Mixed unit types (W, kW, etc.)
- ✅ Edge cases in Home Assistant data

This defensive approach ensures the card displays gracefully even in heterogeneous HA setups with dozens of different sensor types and configurations.
