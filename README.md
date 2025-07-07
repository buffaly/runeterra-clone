# Runeterra Map Clone

An interactive 3D map clone inspired by Legends of Runeterra, featuring immersive visual effects, dynamic interactions, and multi-language support powered by AI translation.

## Getting Started

### How to Open the Project
1. Install dependencies using your preferred package manager
2. Start the development server
```
pnpm dev
```

### Environment Setup (Optional for use LLM (Anthropic) to translate content)
- use .env.example to setup env

### Translation System
- Run the LLM-powered translation script using `node generate-translations.cjs` or `pnpm translation`
- use `node generate-translations.cjs --help` to see all command

## Core Features

### Visual Components
- **Base Map**: Interactive 3D representation of the Runeterra world
- **Cloud Layers**: Dynamic atmospheric effects with realistic cloud rendering
- **Vignette Effect**: CSS-powered visual enhancement for immersive borders
- **Regional Icons**: Detailed markers and symbols (currently featuring Noxus region)
- **Shader-based Waves**: Real-time water simulation using custom shaders
- **Displacement Mapping**: Advanced depth mapping for realistic terrain elevation

### User Interface
- **Responsive UI Components**: Modern interface elements optimized for both desktop and mobile
- **Mobile Support**: Touch-friendly controls and responsive design
- **Cross-platform Compatibility**: Seamless experience across different devices

## Interactive Features

### Navigation & Controls
- **Side Bar Integration**: Expandable information panels with smooth animations
- **Region Highlighting**: Dynamic color changes on hover for visual feedback
- **Camera System**: 
  - Frustum clamping for bounded exploration
  - Smooth zoom controls with momentum
  - "Zoom to" functionality for quick region navigation
- **Dynamic Textures**: Automatic texture switching based on zoom level for optimal detail

### Advanced Interactions
- **Multi-language Support**: Real-time translation API integration
- **Context-aware UI**: Adaptive interface based on user interactions
- **Smooth Transitions**: Fluid animations between different map states

## Technical Stack

This project leverages modern web technologies including:
- 3D rendering with WebGL
- Shader programming for visual effects
- Responsive CSS frameworks
- AI-powered translation services
