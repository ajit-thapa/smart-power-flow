import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('smart-power-flow-card')
export class SmartPowerFlowCard extends LitElement {
  @property({ type: Object }) hass: any;
  @property({ type: Object }) config: any;
  @state() private _entities: any = {};

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

      // Grid detection
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

      // Solar detection
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

      // Home consumption detection
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

      // Battery power detection
      if (
        deviceClass === 'power' &&
        (unit === 'W' || unit === 'kW') &&
        !result.battery_power
      ) {
        if (entityId.includes('battery')) {
          result.battery_power = entityId;
        }
      }

      // Battery level detection
      if (deviceClass === 'battery' && unit === '%' && !result.battery_level) {
        result.battery_level = entityId;
      }
    });

    return result;
  }

  static get styles() {
    return css`
      :host {
        --mdc-theme-primary: #03a9f4;
      }

      .card {
        padding: 16px;
      }

      .title {
        font-size: 24px;
        font-weight: 500;
        margin-bottom: 16px;
      }

      .flow-container {
        display: flex;
        justify-content: space-around;
        align-items: center;
        gap: 16px;
        margin: 24px 0;
        flex-wrap: wrap;
      }

      .power-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        border-radius: 8px;
        background: var(--ha-card-background, #fff);
        border: 1px solid var(--divider-color);
        min-width: 100px;
      }

      .power-label {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 8px;
        text-transform: uppercase;
      }

      .power-value {
        font-size: 28px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .power-unit {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-left: 4px;
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

    const gridPower = this._getEntityValue(this._entities.grid);
    const solarPower = this._getEntityValue(this._entities.solar);
    const homePower = this._getEntityValue(this._entities.home);
    const batteryPower = this._getEntityValue(this._entities.battery_power);
    const batteryLevel = this._getEntityValue(this._entities.battery_level);

    return html`
      <div class="card">
        <div class="title">Power Flow</div>
        <div class="flow-container">
          ${this._entities.solar
            ? html`
                <div class="power-box">
                  <div class="power-label">Solar</div>
                  <div class="power-value">
                    ${solarPower}<span class="power-unit">W</span>
                  </div>
                </div>
              `
            : ''}
          ${this._entities.grid
            ? html`
                <div class="power-box">
                  <div class="power-label">Grid</div>
                  <div class="power-value">
                    ${gridPower}<span class="power-unit">W</span>
                  </div>
                </div>
              `
            : ''}
          ${this._entities.home
            ? html`
                <div class="power-box">
                  <div class="power-label">Home</div>
                  <div class="power-value">
                    ${homePower}<span class="power-unit">W</span>
                  </div>
                </div>
              `
            : ''}
          ${this._entities.battery_power
            ? html`
                <div class="power-box">
                  <div class="power-label">Battery</div>
                  <div class="power-value">
                    ${batteryPower}<span class="power-unit">W</span>
                  </div>
                  ${this._entities.battery_level
                    ? html`<div class="power-unit">${batteryLevel}%</div>`
                    : ''}
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _getEntityValue(entityId: string): string | number {
    if (!entityId || !this.hass.states[entityId]) {
      return '--';
    }
    const state = this.hass.states[entityId].state;
    return state === 'unknown' ? '--' : Math.round(parseFloat(state));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'smart-power-flow-card': SmartPowerFlowCard;
  }
}
