import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('smart-power-flow-card-editor')
export class SmartPowerFlowCardEditor extends LitElement {
  @property({ type: Object }) hass: any;
  @property({ type: Object }) config: any;
  @state() private _config: any = {};

  setConfig(config: any) {
    this._config = { ...config };
  }

  protected render() {
    return html`
      <ha-form
        .data=${this._config}
        .schema=${[
          {
            name: 'auto_detect',
            type: 'boolean',
            label: 'Auto-detect entities',
            default: true,
          },
          {
            name: 'grid_entity',
            type: 'entity',
            label: 'Grid Power Entity',
            selector: {
              entity: {
                domain: 'sensor',
                device_class: 'power',
              },
            },
          },
          {
            name: 'solar_entity',
            type: 'entity',
            label: 'Solar Power Entity',
            selector: {
              entity: {
                domain: 'sensor',
                device_class: 'power',
              },
            },
          },
          {
            name: 'home_consumption_entity',
            type: 'entity',
            label: 'Home Consumption Entity',
            selector: {
              entity: {
                domain: 'sensor',
                device_class: 'power',
              },
            },
          },
          {
            name: 'battery_power_entity',
            type: 'entity',
            label: 'Battery Power Entity',
            selector: {
              entity: {
                domain: 'sensor',
                device_class: 'power',
              },
            },
          },
          {
            name: 'battery_level_entity',
            type: 'entity',
            label: 'Battery Level Entity',
            selector: {
              entity: {
                domain: 'sensor',
                device_class: 'battery',
              },
            },
          },
        ]}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: any) {
    this._config = ev.detail.value;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'smart-power-flow-card-editor': SmartPowerFlowCardEditor;
  }
}
