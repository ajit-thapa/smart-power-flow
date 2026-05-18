import { LitElement, html, css, svg } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface PowerValues {
  grid: number;
  solar: number;
  home: number;
  battery: number;
  batteryLevel: number;
}

@customElement('smart-power-flow-card')
export class SmartPowerFlowCard extends LitElement {
  @property({ type: Object }) hass: any;
  @property({ type: Object }) config: any;
  @state() private _entities: any = {};
  @state() private _powerValues: PowerValues = {
    grid: 0,
    solar: 0,
    home: 0,
    battery: 0,
    batteryLevel: 0,
  };

  static getConfigElement() {
    return document.createElement('smart-power-flow-card-editor');
  }

  static getStubConfig() {
    return {
      auto_detect: true,
      grid_entity: '',
      solar_entity: '',
      home_consumption_entity: '',
      battery_power_entity: '',
      battery_level_entity: '',
    };
  }

  static getGridOptions() {
    return { columns: 12, rows: 'auto' };
  }

  setConfig(config: any) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
    this._updateEntities();
  }

  updated(changedProperties: any) {
    super.updated(changedProperties);
    if (changedProperties.has('hass')) {
      this._updateEntities();
      this._updatePowerValues();
    }
  }

  private _updateEntities() {
    if (!this.hass || !this.config) return;

    if (this.config.auto_detect) {
      this._entities = this._findEnergyEntities();
    } else {
      this._entities = {
        grid: this.config.grid_entity,
        solar: this.config.solar_entity,
        home: this.config.home_consumption_entity,
        battery_power: this.config.battery_power_entity,
        battery_level: this.config.battery_level_entity,
      };
    }
  }

  private _updatePowerValues() {
    if (!this.hass) return;

    this._powerValues = {
      grid: this._getNumericValue(this._entities.grid),
      solar: this._getNumericValue(this._entities.solar),
      home: this._getNumericValue(this._entities.home),
      battery: this._getNumericValue(this._entities.battery_power),
      batteryLevel: this._getNumericValue(this._entities.battery_level),
    };
  }

  private _findEnergyEntities() {
    const result = {
      grid: null,
      solar: null,
      home: null,
      battery_power: null,
      battery_level: null,
    };

    if (!this.hass.states) return result;

    Object.keys(this.hass.states).forEach((entityId) => {
      const state = this.hass.states[entityId];
      const deviceClass = state.attributes.device_class;
      const unit = state.attributes.unit_of_measurement;

      if (
        deviceClass === 'power' &&
        (unit === 'W' || unit === 'kW') &&
        !result.grid
      ) {
        if (
          entityId.includes('grid') ||
          (entityId.includes('inverter') && !entityId.includes('solar'))
        ) {
          result.grid = entityId;
        }
      }

      if (
        deviceClass === 'power' &&
        (unit === 'W' || unit === 'kW') &&
        !result.solar
      ) {
        if (
          entityId.includes('solar') ||
          entityId.includes('pv') ||
          entityId.includes('sun')
        ) {
          result.solar = entityId;
        }
      }

      if (
        deviceClass === 'power' &&
        (unit === 'W' || unit === 'kW') &&
        !result.home
      ) {
        if (
          entityId.includes('house') ||
          entityId.includes('home') ||
          entityId.includes('consumption') ||
          entityId.includes('load')
        ) {
          result.home = entityId;
        }
      }

      if (
        deviceClass === 'power' &&
        (unit === 'W' || unit === 'kW') &&
        !result.battery_power
      ) {
        if (entityId.includes('battery')) {
          result.battery_power = entityId;
        }
      }

      if (deviceClass === 'battery' && unit === '%' && !result.battery_level) {
        result.battery_level = entityId;
      }
    });

    return result;
  }

  static get styles() {
    return css`
      :host {
        --power-flow-grid-color: #ff9800;
        --power-flow-solar-color: #fdd835;
        --power-flow-home-color: #42a5f5;
        --power-flow-battery-color: #4caf50;
      }

      .card {
        padding: 16px;
      }

      .title {
        font-size: 24px;
        font-weight: 500;
        margin-bottom: 16px;
      }

      .svg-container {
        width: 100%;
        aspect-ratio: 16 / 9;
        max-width: 100%;
      }

      svg {
        width: 100%;
        height: 100%;
      }

      .node-circle {
        transition: all 0.3s ease;
      }

      .node-circle:hover {
        filter: brightness(1.1);
      }

      .node-label {
        font-size: 14px;
        font-weight: 600;
        fill: var(--primary-text-color);
        text-anchor: middle;
      }

      .node-value {
        font-size: 18px;
        font-weight: 700;
        fill: var(--primary-text-color);
        text-anchor: middle;
      }

      .node-unit {
        font-size: 10px;
        fill: var(--secondary-text-color);
        text-anchor: middle;
      }

      .flow-line {
        stroke-width: 2;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .no-entities {
        padding: 20px;
        text-align: center;
        color: var(--secondary-text-color);
      }
    `;
  }

  protected render() {
    if (!this.hass || !this.config) {
      return html`<div class="card no-entities">Configuration missing</div>`;
    }

    if (
      !this._entities.grid &&
      !this._entities.solar &&
      !this._entities.home &&
      !this._entities.battery_power
    ) {
      return html`
        <div class="card no-entities">
          No energy entities detected. Please configure the card manually.
        </div>
      `;
    }

    return html`
      <div class="card">
        <div class="title">Power Flow</div>
        <div class="svg-container">${this._renderSVG()}</div>
      </div>
    `;
  }

  private _renderSVG() {
    const vb = '0 0 400 300';

    return svg`
      <svg viewBox=${vb} xmlns="http://www.w3.org/2000/svg">
        <!-- Connection lines -->
        ${this._renderFlowLines()}

        <!-- Grid Node (Left) -->
        ${this._entities.grid
          ? svg`
              <circle
                class="node-circle"
                cx="50"
                cy="150"
                r="35"
                fill="var(--power-flow-grid-color)"
                opacity="0.8"
              />
              <text class="node-label" x="50" y="140">Grid</text>
              <text class="node-value" x="50" y="160">
                ${this._powerValues.grid}
              </text>
              <text class="node-unit" x="50" y="175">W</text>
            `
          : ''}

        <!-- Solar Node (Top Center) -->
        ${this._entities.solar
          ? svg`
              <circle
                class="node-circle"
                cx="200"
                cy="50"
                r="35"
                fill="var(--power-flow-solar-color)"
                opacity="0.8"
              />
              <text class="node-label" x="200" y="40">Solar</text>
              <text class="node-value" x="200" y="60">
                ${this._powerValues.solar}
              </text>
              <text class="node-unit" x="200" y="75">W</text>
            `
          : ''}

        <!-- Home Node (Right) -->
        ${this._entities.home
          ? svg`
              <circle
                class="node-circle"
                cx="350"
                cy="150"
                r="35"
                fill="var(--power-flow-home-color)"
                opacity="0.8"
              />
              <text class="node-label" x="350" y="140">Home</text>
              <text class="node-value" x="350" y="160">
                ${this._powerValues.home}
              </text>
              <text class="node-unit" x="350" y="175">W</text>
            `
          : ''}

        <!-- Battery Node (Bottom Center) -->
        ${this._entities.battery_power
          ? svg`
              <circle
                class="node-circle"
                cx="200"
                cy="250"
                r="35"
                fill="var(--power-flow-battery-color)"
                opacity="0.8"
              />
              <text class="node-label" x="200" y="240">Battery</text>
              <text class="node-value" x="200" y="260">
                ${this._powerValues.battery}
              </text>
              <text class="node-unit" x="200" y="275">W</text>
              ${this._powerValues.batteryLevel > 0
                ? svg`<text class="node-unit" x="200" y="287">${this._powerValues.batteryLevel}%</text>`
                : ''}
            `
          : ''}
      </svg>
    `;
  }

  private _renderFlowLines() {
    const paths = [];

    if (this._entities.solar && this._entities.home) {
      paths.push(
        svg`<line class="flow-line" x1="235" y1="85" x2="315" y2="115" stroke="var(--power-flow-solar-color)" />`
      );
    }

    if (this._entities.solar && this._entities.battery_power) {
      paths.push(
        svg`<line class="flow-line" x1="200" y1="85" x2="200" y2="215" stroke="var(--power-flow-solar-color)" opacity="0.6" />`
      );
    }

    if (this._entities.solar && this._entities.grid) {
      paths.push(
        svg`<line class="flow-line" x1="165" y1="85" x2="85" y2="115" stroke="var(--power-flow-solar-color)" opacity="0.6" />`
      );
    }

    if (this._entities.grid && this._entities.home) {
      paths.push(
        svg`<line class="flow-line" x1="85" y1="150" x2="315" y2="150" stroke="var(--power-flow-grid-color)" stroke-dasharray="5,5" />`
      );
    }

    if (this._entities.battery_power && this._entities.home) {
      paths.push(
        svg`<line class="flow-line" x1="235" y1="215" x2="315" y2="185" stroke="var(--power-flow-battery-color)" opacity="0.6" />`
      );
    }

    if (this._entities.battery_power && this._entities.grid) {
      paths.push(
        svg`<line class="flow-line" x1="165" y1="215" x2="85" y2="185" stroke="var(--power-flow-battery-color)" opacity="0.6" />`
      );
    }

    return paths;
  }

  private _getEntityValue(entityId: string): string | number {
    if (!entityId || !this.hass.states[entityId]) {
      return '--';
    }
    const state = this.hass.states[entityId].state;
    return state === 'unknown' ? '--' : state;
  }

  private _getNumericValue(entityId: string): number {
    if (!entityId || !this.hass.states[entityId]) {
      return 0;
    }
    const state = this.hass.states[entityId].state;
    if (state === 'unknown' || state === '--') {
      return 0;
    }
    return Math.round(parseFloat(state));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'smart-power-flow-card': SmartPowerFlowCard;
  }
}
