# Audio Reactive System Guide

## Overview
The audio reactive system allows you to map audio input (microphone or system audio) to any visual parameter in real-time.

## Audio Variables Available

### Basic Metrics
- **volume** - Overall loudness (0-1)
- **rms** - Root Mean Square energy (average power)
- **peak** - Peak amplitude in current frame

### Frequency Bands
- **subBass** - 20-60 Hz (deep rumble)
- **bass** - 60-250 Hz (kick drums, bass guitar)
- **lowMids** - 250-500 Hz (low vocals, guitars)
- **mids** - 500-2000 Hz (vocals, most instruments)
- **highMids** - 2000-4000 Hz (clarity, presence)
- **presence** - 4000-6000 Hz (vocal clarity)
- **brilliance** - 6000-20000 Hz (cymbals, air)
- **treble** - Combined high frequencies (presence + brilliance)

### Special
- **beat** - Beat detection (triggers on rhythmic hits)

## Parameters You Can Control

### Transform
- Scale
- Rotation
- Rotation Speed
- X Position
- Y Position
- Scale Transition

### Shape
- Shape Size
- Sequence Count

### Camera
- Camera Zoom

### Color
- Color Shift Speed

### Opacity
- Start Opacity
- End Opacity

### Animations
- Scale Animation Amplitude
- Scale Animation Speed
- X Animation Amplitude
- Y Animation Amplitude
- Rotate Animation Amplitude

## How to Use

1. **Enable Audio**
   - Click "Enable Audio Input" in the AUDIO REACTIVE section
   - Grant microphone permissions when prompted
   - Select a different input device if needed

2. **Configure Mappings**
   - Click "Configure Mappings"
   - For each parameter you want to control:
     - Select an audio variable from the dropdown
     - Adjust the "Influence" slider (0-100%)
       - 0% = no effect
       - 100% = full range modulation

3. **Watch the Visualizer**
   - The bars show current audio levels
   - Helps you understand which frequencies are active

## Example Mappings

### Pulsing to Bass
- **Scale** → bass (50% influence)
- **Shape Size** → bass (30% influence)

### Dancing to Beat
- **Rotation** → beat (100% influence)
- **Camera Zoom** → beat (20% influence)

### Frequency Spectrum
- **X Position** → bass (50%)
- **Y Position** → treble (50%)
- **Rotation** → mids (30%)

### Color Shifting
- **Color Shift Speed** → volume (80%)

### Smooth Breathing
- **Scale** → rms (40%)
- **Start Opacity** → volume (30%)

## Tips

- Start with low influence (20-40%) and increase gradually
- Bass frequencies work great for scale/size
- Treble works well for rotation/position
- Beat detection is perfect for sudden changes
- Combine multiple mappings for complex effects
- Use the visualizer to understand your audio source

## Performance Notes

- Audio analysis runs at 60fps
- Minimal performance impact
- FFT size: 2048 (adjustable in code)
- Smoothing: 0.8 (adjustable in code)

## Troubleshooting

**No audio detected?**
- Check microphone permissions
- Try a different input device
- Increase system volume/input gain

**Mappings not working?**
- Make sure audio is enabled (green status)
- Check that influence is > 0%
- Verify audio variable is not "none"

**Too sensitive/not sensitive enough?**
- Adjust the influence slider
- Try a different audio variable
- Adjust your input gain

## Advanced: Editing Code

Want to customize further? Check these files:

- `src/audio/AudioAnalyzer.js` - Audio capture and analysis
- `src/audio/AudioReactiveController.js` - Parameter mapping logic
- `src/ui/AudioControlPanel.js` - UI controls

You can adjust:
- FFT size (frequency resolution)
- Smoothing (responsiveness)
- Beat detection sensitivity
- Frequency band ranges
- Add custom audio variables
