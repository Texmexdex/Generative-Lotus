# Audio Triggers Guide

## Overview
Audio Triggers let you execute discrete actions (like changing shapes or randomizing colors) based on audio events, rather than continuous modulation.

## Trigger Types

### Beat-Based Triggers
- **On Beat** - Triggers every time a beat is detected
- **Every N Beats** - Triggers every 2nd, 4th, 8th beat, etc.

### Volume-Based Triggers
- **Volume Peak** - Triggers on sudden volume spikes
- **Threshold Above** - Triggers when audio variable stays above threshold
- **Threshold Below** - Triggers when audio variable stays below threshold

### Crossing Triggers
- **Crosses Up** - Triggers when audio crosses above threshold
- **Crosses Down** - Triggers when audio crosses below threshold

## Available Actions

### Shape Actions
- **Next Shape** - Cycle to next shape in list
- **Random Shape** - Pick a random shape

### Color Actions
- **Random Palette** - Generate new random color palette
- **Next Drawing Mode** - Cycle through single/sequence/RGB/LCH
- **Toggle Fill/Stroke** - Switch between fill and stroke styling
- **Toggle Color Shift** - Enable/disable color shift animation

### Transform Actions
- **Next Split Mask** - Cycle through none/horizontal/vertical/quad
- **Random Split Mask** - Pick random split mask
- **Increase Sequence** - Add 100 shapes
- **Decrease Sequence** - Remove 100 shapes

### Animation Actions
- **Next Animation Mode** - Cycle through off/sin/noise
- **Random Animation Mode** - Pick random animation type

### Camera Actions
- **Reset Camera** - Return camera to default position/zoom

## How to Use

### Creating a Trigger

1. **Enable Audio** - Make sure audio input is active
2. **Click "Add Trigger"** - Creates a new trigger with defaults
3. **Configure the trigger:**
   - **When:** Select trigger type (beat, threshold, etc.)
   - **Do:** Select action to execute
   - **Additional settings:** Depends on trigger type

### Trigger Settings

**For "Every N Beats":**
- Set beat interval (2, 4, 8, 16, etc.)
- Example: Every 4 beats → Random Palette

**For Threshold Triggers:**
- Choose audio variable (volume, bass, mids, etc.)
- Set threshold value (0-1)
- Example: Bass > 0.7 → Next Shape

**For Volume Peak:**
- Adjust sensitivity (50-100%)
- Higher = only triggers on big peaks
- Lower = triggers on smaller peaks

**Cooldown:**
- Minimum time (ms) between triggers
- Prevents rapid re-triggering
- Default: 200ms

### Managing Triggers

- **Checkbox** - Enable/disable trigger
- **× Button** - Delete trigger
- **Edit inline** - Change settings anytime
- **Multiple triggers** - Create as many as you want

## Example Setups

### Beat-Synced Visuals
```
Trigger 1: On Beat → Random Palette
Trigger 2: Every 4 Beats → Next Shape
Trigger 3: Every 8 Beats → Random Split Mask
```

### Bass-Reactive
```
Trigger 1: Bass > 0.7 → Next Shape
Trigger 2: Bass crosses up 0.8 → Random Palette
Trigger 3: Bass < 0.3 → Reset Camera
```

### Dynamic Complexity
```
Trigger 1: Volume > 0.6 → Increase Sequence
Trigger 2: Volume < 0.4 → Decrease Sequence
Trigger 3: On Beat → Toggle Color Shift
```

### Frequency-Based
```
Trigger 1: Treble > 0.7 → Next Drawing Mode
Trigger 2: Bass > 0.8 → Toggle Fill/Stroke
Trigger 3: Mids crosses up 0.6 → Random Animation Mode
```

### Progressive Build
```
Trigger 1: Every 4 Beats → Increase Sequence
Trigger 2: Every 16 Beats → Next Shape
Trigger 3: Volume Peak → Random Palette
```

## Tips & Tricks

### Beat Counting
- Beat count starts at 0 when audio is enabled
- Use "Reset Beat Count" to restart counting
- Useful for syncing with song structure

### Cooldown Settings
- Short cooldown (100-200ms): Responsive but might trigger too often
- Medium cooldown (500-1000ms): Balanced
- Long cooldown (2000ms+): Occasional dramatic changes

### Combining with Parameter Mappings
- Use triggers for discrete changes
- Use parameter mappings for continuous modulation
- Example: Bass modulates scale + beat triggers palette change

### Threshold Strategy
- **Low thresholds (0.3-0.5)**: Triggers often
- **Medium thresholds (0.5-0.7)**: Balanced
- **High thresholds (0.7-0.9)**: Only on intense moments

### Crossing vs. Above/Below
- **Crosses Up/Down**: Triggers once when crossing
- **Above/Below**: Triggers continuously while condition is true
- Use crossing for one-time events
- Use above/below with longer cooldowns for sustained effects

## Audio Variables for Thresholds

- **volume** - Overall loudness
- **bass** - Low frequencies (kick drums)
- **mids** - Mid frequencies (vocals, guitars)
- **treble** - High frequencies (cymbals, hi-hats)
- **subBass** - Very low frequencies
- **lowMids** - Lower mid range
- **highMids** - Upper mid range
- **presence** - Vocal clarity range
- **brilliance** - Air and sparkle
- **rms** - Average energy
- **peak** - Peak amplitude

## Common Patterns

### Verse/Chorus Structure
```
Quiet verse:
- Bass < 0.5 → Simple shapes (circle, square)
- Every 8 beats → Subtle palette change

Loud chorus:
- Bass > 0.7 → Complex shapes (dodecahedron, torus)
- Every 2 beats → Random palette
- Volume peak → Increase sequence
```

### Build-Up Effect
```
1. Start with low sequence count
2. Every 4 beats → Increase Sequence
3. Volume peak → Random Shape + Random Palette
4. Creates growing complexity
```

### Call and Response
```
1. Bass > 0.7 → Next Shape (bass hits)
2. Treble > 0.7 → Random Palette (hi-hat/cymbal)
3. Creates visual conversation
```

### Controlled Chaos
```
1. On Beat → Random Palette (frequent)
2. Every 8 Beats → Random Shape (occasional)
3. Volume Peak → Random Split Mask (rare)
4. Cooldowns prevent overwhelming changes
```

## Troubleshooting

**Triggers not firing?**
- Check that audio is enabled (green status)
- Verify trigger is enabled (checkbox checked)
- Adjust threshold if using threshold triggers
- Check cooldown isn't too long

**Triggering too often?**
- Increase cooldown time
- Raise threshold value
- Use "Crosses Up" instead of "Above"
- Increase beat interval

**Triggering too rarely?**
- Decrease cooldown time
- Lower threshold value
- Use "Above" instead of "Crosses Up"
- Decrease beat interval

**Beat detection not working?**
- Increase input volume/gain
- Try different audio source
- Check that music has clear beats
- Adjust beat sensitivity in AudioAnalyzer (code)

**Actions not visible?**
- Some actions are subtle (like animation mode changes)
- Try more obvious actions first (Random Palette, Next Shape)
- Check that the parameter is actually being used

## Performance Notes

- Triggers have minimal performance impact
- Each trigger checks once per frame (~60fps)
- Cooldowns prevent excessive state updates
- Safe to have 10+ triggers active

## Exporting & Importing

Triggers are saved when you:
- Export JSON presets
- Save your work

Triggers are restored when you:
- Import JSON presets
- Load saved work

Share your trigger setups with others!

## Advanced: Custom Actions

Want to add your own actions? Edit `AudioTriggerSystem.js`:

1. Add action to `this.actions` array
2. Add case to `executeAction()` method
3. Implement your custom behavior

Example actions you could add:
- Rotate camera
- Change background color
- Export frame as image
- Toggle specific animations
- Randomize all settings
- Load specific preset

## Summary

Audio Triggers give you:
- ✅ Event-based control (not just continuous)
- ✅ Beat-synced visuals
- ✅ Threshold-based reactions
- ✅ Discrete state changes
- ✅ Combine with parameter mappings
- ✅ Create dynamic, evolving visuals

Experiment with different combinations to create unique audio-reactive experiences!
