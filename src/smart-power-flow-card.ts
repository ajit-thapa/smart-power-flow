import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('smart-power-flow-card')
export class SmartPowerFlowCard extends LitElement {
  @property({ type: Object }) hass: any;
  @property({ type: Object }) config: any;

  static getConfigElement() {
    return document.createElement('smart-power-flow-card-editor');
  }

  static getStubConfig() {
    return {
      solar_power_entity: '',
      battery_power_entity: '',
      grid_power_entity: '',
      load_power_entity: '',
    };
  }

  setConfig(config: any) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
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
      }

      .power-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        border-radius: 8px;
        background: var(--ha-card-background, #fff);
        border: 1px solid var(--divider-color);
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
    `;
  }

  protected render() {
    if (!this.hass || !this.config) {
      return html`<div class="card">Configuration missing</div>`;
    }

    const solarPower = this.getEntityValue(this.config.solar_power_entity);
    const batteryPower = this.getEntityValue(this.config.battery_power_entity);
    const gridPower = this.getEntityValue(this.config.grid_power_entity);
    const loadPower = this.getEntityValue(this.config.load_power_entity);

    return html`
      <div class="card">
        <div class="title">Power Flow</div>
        <div class="flow-container">
          <div class="power-box">
            <div class="power-label">Solar</div>
            <div class="power-value">
              ${solarPower}<span class="power-unit">W</span>
            </div>
          </div>
          <div class="power-box">
            <div class="power-label">Battery</div>
            <div class="power-value">
              ${batteryPower}<span class="power-unit">W</span>
            </div>
          </div>
          <div class="power-box">
            <div class="power-label">Grid</div>
            <div class="power-value">
              ${gridPower}<span class="power-unit">W</span>
            </div>
          </div>
          <div class="power-box">
            <div class="power-label">Load</div>
            <div class="power-value">
              ${loadPower}<span class="power-unit">W</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getEntityValue(entityId: string): string | number {
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
