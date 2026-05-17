# Smart Power Flow Card

A Home Assistant custom card for displaying power flow between grid, solar, battery, and loads.

## Features

- Real-time power flow visualization
- Support for solar, battery, and grid integration
- Customizable entity mappings
- Responsive design
- Dark mode support

## Installation

### HACS
1. Add this repository to HACS
2. Search for "Smart Power Flow Card"
3. Install and restart Home Assistant

### Manual
1. Clone this repository
2. Copy the `dist/smart-power-flow-card.js` to your Home Assistant config directory
3. Add the custom element to your dashboard

## Configuration

```yaml
type: custom:smart-power-flow-card
solar_power_entity: sensor.solar_power
battery_power_entity: sensor.battery_power
grid_power_entity: sensor.grid_power
load_power_entity: sensor.load_power
```

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

## License

Apache License 2.0
