# Custom Slider Range Guide

## Overview
Every slider now has advanced controls that let you:
1. **View and edit values directly** - Green value display box
2. **Customize slider ranges** - Set your own min/max values (⚙ button)
3. **Audio reactive integration** - Custom ranges automatically apply to audio mappings

## Interface Components

### Value Display (Green Box)
- Shows the current exact value
- Click to type a specific value
- Turns orange if value is outside current slider range
- Syncs bidirectionally with the slider

### Range Controls (⚙ Gear Button)
- Click to reveal min/max controls
- **Min box** - Set the slider's minimum value
- **Max box** - Set the slider's maximum value
- **Reset (↺)** - Return to default range
- Changes apply immediately

### The Slider
- Operates within your custom min/max range
- Smooth control across your defined range
- Visual feedback as you adjust

## How to Use

### Basic Usage
1. Find any slider (e.g., Scale, Rotation, etc.)
2. Click the **⚙** button next to the value display
3. Enter your desired **Min** and **Max** values
4. The slider now operates in your custom range
5. Click **↺** to reset to defaults

### Setting Custom Ranges

**Example 1: Extreme Scale**
- Default range: 0.1 to 3
- Custom range: 0.01 to 10
- Result: Slider can now go from tiny (0.01) to huge (10)

**Example 2: Precise Control**
- Default: Scale Transition 0.9 to 1.1
- Custom: 0.98 to 1.02
- Result: Fine-grained adjustments for subtle effects

**Example 3: Centered Rotation**
- Default: 0 to 360
- Custom: -180 to 180
- Result: Rotation centered around 0°

**Example 4: High Sequence Counts**
- Default: 10 to 2000
- Custom: 500 to 5000
- Result: Work with higher shape counts

## Audio Reactive Integration

**Custom ranges automatically apply to audio mappings!**

When you set a custom range:
- Audio variables modulate within YOUR range
- Not the default range
- Gives you precise control over audio effects

**Example:**
1. Set Scale range to 0.5 - 2.0
2. Map Bass → Scale (50% influence)
3. Bass now modulates scale between 0.5 and 2.0
4. Not the default 0.1 to 3

**Benefits:**
- Prevent extreme values from audio
- Create more controlled audio reactions
- Fine-tune the intensity of audio effects
- Different ranges for different parameters

## Use Cases

### Precision Work
- Narrow ranges for fine control
- Example: Scale 0.95 to 1.05 for subtle breathing
- Example: Rotation -5 to 5 for gentle wobble

### Extreme Effects
- Wide ranges for dramatic results
- Example: Scale 0.01 to 20 for massive variation
- Example: Position -1000 to 1000 for wild movement

### Audio Performance
- Set ranges that match your music
- Quiet music: Narrow ranges
- Loud music: Wide ranges
- Prevents audio from pushing values too far

### Workflow Optimization
- Set ranges that match your creative style
- Save time by not fighting default limits
- Export presets with your custom ranges

## Parameters That Can Go Negative

These parameters allow negative values:
- **X Position** - Move left
- **Y Position** - Move up
- **Rotation Transition** - Reverse direction
- **Camera X/Y** - Pan camera

All other parameters are constrained to 0 or above.

## Tips & Tricks

1. **Start with defaults** - Understand the parameter first
2. **Adjust gradually** - Make small range changes
3. **Test with audio** - See how ranges affect audio reactivity
4. **Save presets** - Custom ranges are saved in JSON exports
5. **Reset if needed** - The ↺ button is always there
6. **Narrow for precision** - Smaller ranges = finer control
7. **Wide for drama** - Larger ranges = more extreme effects
8. **Match your music** - Set ranges based on your audio source

## Keyboard Shortcuts

In value display or range inputs:
- **Arrow Up/Down** - Increment/decrement
- **Page Up/Down** - Larger steps
- **Tab** - Move to next input
- **Enter** - Apply and close

## Exporting & Importing

Custom ranges are saved when you:
- Export JSON presets
- Save your work

Custom ranges are restored when you:
- Import JSON presets
- Load saved work

This means you can share your custom ranges with others!

## Performance Notes

**High sequence counts:**
- Default max: 2000
- Custom max: Can go higher (5000+)
- Watch FPS - reduce if performance drops

**Extreme values:**
- Very large scales can cause rendering issues
- Very small values might be invisible
- Test and adjust as needed

## Troubleshooting

**Value not changing?**
- Make sure you pressed Enter or clicked outside
- Check if parameter has a hard limit (like 0 for scale)

**Slider not moving?**
- If value is outside range, slider stays at endpoint
- Orange highlight shows this is happening
- Adjust range or value

**Audio not working with custom range?**
- Custom ranges apply automatically
- Try clicking "Configure Mappings" to refresh
- Check that audio is enabled

**Can't set negative value?**
- Some parameters don't allow negatives
- Check the "Parameters That Can Go Negative" section
- Min input will prevent values below 0 for these

## Advanced: Range Strategy

### For Subtle Effects
```
Scale: 0.9 - 1.1
Rotation: -10 - 10
Position: -50 - 50
```

### For Dramatic Effects
```
Scale: 0.1 - 5
Rotation: -180 - 180
Position: -500 - 500
```

### For Audio Reactive
```
Bass → Scale: 0.5 - 2.0 (controlled)
Treble → Rotation: -45 - 45 (smooth)
Volume → Zoom: 1.0 - 3.0 (safe range)
```

### For Precision Animation
```
Scale Transition: 0.98 - 1.02
Rotation Transition: -1 - 1
Animation Amplitude: 0 - 0.5
```

## Summary

Custom slider ranges give you:
- ✅ Complete control over parameter limits
- ✅ Precision for fine adjustments
- ✅ Extreme values for dramatic effects
- ✅ Audio reactive integration
- ✅ Workflow optimization
- ✅ Exportable/importable settings

Experiment and find the ranges that work for your creative vision!
