# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2025-05-18

### Added

- **Auto-Entity Detection** - Heuristic discovery of solar, grid, battery, and home consumption entities via `hass.states`
- **Native ha-form Editor** - Entity selection via Home Assistant's built-in dropdowns, filtered by device class
- **Real-Time SVG Visualization** - Power flow diagram with 4 color-coded nodes (Grid, Solar, Home, Battery)
- **Live Power Display** - Real-time watts and battery SOC% within each node
- **Dynamic Flow Lines** - Automatic connection rendering based on configured entities
- **Diagnostics Panel** - Modal overlay showing raw entity values, entity IDs, and per-entity debugging
- **Sign Normalization** - Per-entity sign flip controls for inverter convention mismatches
- **Persistent Sign Config** - Sign flips saved to card config for persistence across reloads
- **Responsive SVG** - 16:9 aspect ratio scaling for mobile, tablet, desktop
- **Dark Mode Support** - Automatic theme detection respecting Home Assistant colors
- **Zero-Config Mode** - 80% of setups work without manual configuration
- **Manual Fallback** - Full entity-by-entity override for custom setups
- **HACS Compatibility** - Production-ready bundled output (24 KB)

### Technical Details

- Built with **Lit** for efficient reactive rendering
- **esbuild** bundling for fast, optimized output
- TypeScript for type safety
- External Lit dependency (not bundled) for size optimization
- GitHub Actions CI/CD for automated builds on tag

### Known Limitations

- 4-node layout is fixed (customization in v0.2)
- No animated flows yet (coming in v0.2)
- No control mode (read-only display)
- No custom sensors support yet (planned for v0.3)

## Roadmap

- **v0.2** - Animated flow lines, battery animations, custom sensor positioning
- **v0.3** - Custom sensors array (EV chargers, heat pumps, generators)
- **v0.4** - More-info entity popups, unit conversion toggles
- **v1.0** - Stable release, comprehensive docs, community templates
