# Custom Slider Range Guide

## Overview
Every slider now has:
1. **Value display** - Shows and allows direct entry of the current value
2. **Range controls** - Customize the slider's min/max range (click the ⚙ button)
3. **Audio integration** - Custom ranges automatically apply to audio reactive mappings

## How It Works

### Using the Number Boxes
1. **Type any value** - Enter values directly, even beyond the slider limits
2. **Slider updates** - If your value is within the slider range, the slider moves to match
3. **Orange highlight** - Values outside the slider range are highlighted in orange
4. **No upper limit** - Most parameters have no maximum (except where it doesn't make sense)

### Negative Values
Some parameters can go negative:
- **X Position** - Move left off-screen
- **Y Position** - Move up off-screen  
- **Rotation Transition** - Reverse rotation direction
- **Camera X/Y** - Pan camera in any direction

Other parameters are clamped at 0 (like Scale, Opacity, Size, etc.)

## Examples

### Extreme Scale Range
- **Default**: 0.1 to 3
- **Custom**: Set min=0.01, max=10
- **Result**: Slider now operates from 0.01 to 10
- **Audio**: Bass can now modulate scale from 0.01 to 10

### Huge Sequence Count
- **Default**: 10 to 2000
- **Custom**: Set min=100, max=5000
- **Result**: Slider operates in higher range
- **Audio**: Beat detection can trigger 100-5000 shapes

### Precise Rotation Control
- **Default**: 0 to 360
- **Custom**: Set min=-180, max=180
- **Result**: Centered rotation range
- **Audio**: Smoother audio-reactive rotation

### Micro Adjustments
- **Default**: Scale Transition 0.9 to 1.1
- **Custom**: Set min=0.98, max=1.02
- **Result**: Fine-grained control
- **Audio**: Subtle audio modulation

### Extreme Camera Zoom
- **Default**: 0.1 to 5
- **Custom**: Set min=0.01, max=20
- **Result**: Extreme zoom range
- **Audio**: Dramatic zoom effects with audio

## Tips

1. **Customize for your workflow** - Set ranges that match your creative needs
2. **Audio reactive ranges** - Custom ranges automatically apply to audio mappings
3. **Narrow ranges for precision** - Smaller ranges give finer control
4. **Wide ranges for drama** - Larger ranges create more extreme effects
5. **Reset anytime** - Use the ↺ button to return to defaults
6. **Export with ranges** - Custom ranges are saved in preset JSON files

## Parameter Ranges

### Default Slider Ranges (can be exceeded):
- **Camera Zoom**: 0.1 - 5
- **Stroke Width**: 0.01 - 1
- **Color Shift Speed**: 0.1 - 5
- **Sequence Count**: 10 - 2000
- **Shape Size**: 10 - 200
- **Scale**: 0.1 - 3
- **Scale Transition**: 0.9 - 1.1
- **Rotation**: 0 - 360
- **Rotation Transition**: -10 - 10
- **X/Y Position**: -200 - 200
- **Opacity**: 0 - 1
- **Fade Rate**: 0.1 - 3
- **Animation Amplitude**: varies by type
- **Animation Frequency**: 0.01 - 2
- **Animation Speed**: 0.01 - 2

### Hard Limits (cannot go below):
- **Opacity**: 0 (can't be negative)
- **Scale**: 0 (can't be negative)
- **Shape Size**: 0 (can't be negative)
- **Sequence Count**: 0 (can't be negative)
- **Stroke Width**: 0 (can't be negative)

## Keyboard Shortcuts in Number Boxes
- **Arrow Up/Down** - Increment/decrement by step value
- **Page Up/Down** - Larger increments
- **Tab** - Move to next input
- **Enter** - Apply value and move focus

## Troubleshooting

**Value not applying?**
- Make sure you pressed Enter or clicked outside the box
- Check if the parameter has a hard limit (like 0 for scale)

**Performance issues?**
- Very high sequence counts (>5000) can be slow
- Extreme zoom values might cause rendering issues
- Try reducing the value if things get sluggish

**Slider not moving?**
- This is normal if your value is outside the slider range
- The orange highlight shows you're beyond the slider limits
- The value is still being applied to the visualization

## Advanced Uses

### Creating Presets with Extreme Values
1. Set extreme values using number boxes
2. Export as JSON preset
3. Share with others or save for later

### Combining with Audio Reactive
- Set extreme base values
- Let audio modulate from there
- Creates more dramatic effects

### Animation Experiments
- Try amplitude values > 1 for wild scale animations
- Use frequency > 2 for rapid oscillations
- Combine with extreme base values for chaos
