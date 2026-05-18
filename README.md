# Smart Power Flow Card

[![GitHub Release](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com/ajit-thapa/smart-power-flow/releases)
[![License](https://img.shields.io/badge/license-Apache%202.0-green)](LICENSE)
[![HACS](https://img.shields.io/badge/HACS-Custom-green)](https://hacs.xyz)

A beautiful, real-time Home Assistant custom card for visualizing power flow between solar generation, battery storage, grid connection, and home consumption.

## Features

✨ **Auto-Detection** - Automatically discovers your solar, grid, battery, and home consumption sensors (works out-of-the-box for 80% of setups)

📊 **Real-Time Visualization** - SVG-based power flow diagram shows live watts flowing through your energy system

🔧 **Diagnostics Panel** - Built-in debugging: view raw sensor values, flip sign conventions, verify entity mappings

⚙️ **Manual Configuration** - Full fallback to entity-by-entity manual config via Home Assistant's native form editor

🌙 **Dark Mode Support** - Respects your Home Assistant theme automatically

📱 **Responsive Design** - Scales beautifully on mobile, tablet, and desktop

## Installation

### Via HACS (Recommended)

1. Go to **HACS** → **Custom repositories**
2. Add: `https://github.com/ajit-thapa/smart-power-flow`
3. Category: `Lovelace`
4. Click **Create** and then **Install**
5. Restart Home Assistant
6. Add to your dashboard as a new card: `Custom: Smart Power Flow Card`

### Manual Installation

1. Download `dist/smart-power-flow-card.js`
2. Place in `www/` folder of your Home Assistant config
3. Add to Lovelace resources:
   ```yaml
   resources:
     - url: /local/smart-power-flow-card.js
       type: module
   ```
4. Restart Home Assistant and add the card to your dashboard

## Quick Start

### Zero-Config (Auto-Detection)

Add this to your dashboard, and the card will auto-detect entities:

```yaml
type: custom:smart-power-flow-card
```

That's it! The card looks for entities with:
- Device class: `power` (for solar, grid, home, battery power)
- Device class: `battery` (for battery percentage)
- Matching names: "grid", "solar", "pv", "home", "consumption", "battery"

### Manual Configuration

If auto-detection doesn't find your entities, configure them explicitly:

```yaml
type: custom:smart-power-flow-card
auto_detect: false
grid_entity: sensor.grid_power
solar_entity: sensor.pv_power
home_consumption_entity: sensor.house_consumption
battery_power_entity: sensor.battery_power
battery_level_entity: sensor.battery_soc
```

### Entity Selection UI

1. Click the **Edit card** button in dashboard edit mode
2. Select entities from native dropdowns (filtered by device class)
3. Toggle **Auto-detect entities** to switch modes
4. Save

## Understanding the Diagram

```
                    ☀️ Solar (Yellow)
                         ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
    🔌 Grid          🔋 Battery          🏠 Home
    (Orange)         (Green)             (Blue)
        ↑                 ↑                 ↓
        └─────────────────┼─────────────────┘
```

**Node Colors:**
- **☀️ Yellow (Solar)** - Photovoltaic generation in watts
- **🔌 Orange (Grid)** - Grid import/export in watts (positive = import, negative = export)
- **🏠 Blue (Home)** - Current consumption in watts
- **🔋 Green (Battery)** - Power flow in watts + state of charge %

**Connection Lines:**
- Solid lines = DC flows (solar → battery/home, battery → home)
- Dashed line = AC coupling (grid ↔ home)

## Sign Conventions (Battery Charging/Discharging)

Different inverters report battery power with opposite signs. The card handles this transparently:

### Debugging Sign Issues

1. Click the **⚙️ gear icon** in the card header
2. Open the **Diagnostics Panel**
3. View raw sensor values for each entity
4. Click **Flip Sign** to correct any backwards readings
5. Changes persist automatically

**Example:**
- Raw battery sensor: `-2500` W (discharging)
- Looks backwards in your system? Click **Flip Sign**
- Card now displays: `+2500` W (correct direction)

## Supported Integrations

The card works with any power sensor, but has been tested with:

- **Solaredge Modbus** - Solar + battery monitoring
- **Fronius Gen24** - Hybrid inverter
- **Tesla Powerwall** - Battery storage
- **SMA Sunny Boy** - Solar inverter
- **Huawei LUNA2000** - Battery system
- **Sunsynk/Deye Inverters** - Popular in Africa/Asia
- **Shelly 3EM** - Grid metering
- **Custom Templates** - Any power sensor works

## Configuration Examples

### Typical Residential PV + Battery System

```yaml
type: custom:smart-power-flow-card
grid_entity: sensor.grid_import_export_power
solar_entity: sensor.pv_total_power
home_consumption_entity: sensor.ac_consumption
battery_power_entity: sensor.battery_power
battery_level_entity: sensor.battery_soc_percentage
```

### Grid-Only (No Battery)

```yaml
type: custom:smart-power-flow-card
auto_detect: true
# Card automatically hides battery node if not configured
```

### Solaredge + Tesla

```yaml
type: custom:smart-power-flow-card
solar_entity: sensor.solaredge_pv_power
grid_entity: sensor.solaredge_grid_power
battery_power_entity: sensor.tesla_battery_power
battery_level_entity: sensor.tesla_battery_soc
home_consumption_entity: sensor.solaredge_load_power
```

## Troubleshooting

### Card doesn't appear after adding it

- Clear browser cache (Ctrl+Shift+R)
- Restart Home Assistant (Settings → System → Restart)
- Check browser console for errors (F12)

### Entities not auto-detected

- Verify your sensors have `device_class: power` or `device_class: battery`
- Ensure unit is `W` (watts) or `kW` (kilowatts)
- Use diagnostics panel (⚙️) to see what the card detected
- Switch to manual config if sensors don't match naming conventions

### Battery value looks backwards

- Open diagnostics (⚙️) → look at raw value
- Click **Flip Sign** for the battery power entity
- This corrects the sign convention for your inverter

### Some nodes show as empty/zero

- Make sure all entities exist in Home Assistant (Developer Tools → States)
- Check that device classes are set correctly
- Use diagnostics panel to verify entity IDs

## Advanced

### Custom CSS Variables

Override card colors:

```yaml
type: custom:smart-power-flow-card
  style:
    --power-flow-grid-color: '#ff6b6b'
    --power-flow-solar-color: '#ffd93d'
    --power-flow-home-color: '#6bcf7f'
    --power-flow-battery-color: '#4d96ff'
```

### Dashboard YAML Example

```yaml
views:
  - title: Energy
    cards:
      - type: custom:smart-power-flow-card
        auto_detect: true
        title: Real-Time Power Flow
      
      - type: energy-date-selection
      
      - type: energy-sources-table
```

## FAQ

**Q: Will this work with my inverter?**
A: Yes, if you have power sensors for grid, solar, battery, or load. The card works with any sensor reporting watts.

**Q: Can I hide the battery node?**
A: Yes, just don't configure `battery_power_entity`. The card renders only entities you've set.

**Q: Does it control my inverter?**
A: No, it's read-only. It displays power data only.

**Q: Can I customize the layout?**
A: Future versions will support custom sensor positions. For now, the 4-node layout is fixed.

**Q: How often does it update?**
A: As fast as your Home Assistant state updates (typically 1–5 seconds).

## Development

### Build Locally

```bash
npm install
npm run build
```

Output: `dist/smart-power-flow-card.js`

### Watch Mode

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

## Roadmap

- **v0.2** - Animated flow lines, battery charge/discharge animations
- **v0.3** - Custom sensors (EV chargers, heat pumps, generators)
- **v0.4** - More-info popups on node click, unit conversion UI
- **v1.0** - Stable release, comprehensive docs, community templates

## Support

- 🐛 Found a bug? [Open an issue](https://github.com/ajit-thapa/smart-power-flow/issues)
- 💡 Feature request? [Start a discussion](https://github.com/ajit-thapa/smart-power-flow/discussions)
- 📖 Need help? Check [Home Assistant Community](https://community.home-assistant.io/)

## License

Apache License 2.0 — See [LICENSE](LICENSE) for details.

## Credits

Built with ❤️ using [Lit](https://lit.dev) and SVG for crisp, scalable power flow visualization.

---

**Made for Home Automation Enthusiasts** | Smart Energy, Beautifully Visualized

