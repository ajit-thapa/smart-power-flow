import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('smart-power-flow-card-editor')
export class SmartPowerFlowCardEditor extends LitElement {
  @property({ type: Object }) hass: any;
  @property({ type: Object }) config: any;
  @state() private _config: any = {};

  static get styles() {
    return css`
      .editor-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      label {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      input[type='text'] {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        font-family: monospace;
      }
    `;
  }

  setConfig(config: any) {
    this._config = { ...config };
  }

  protected render() {
    return html`
      <div class="editor-form">
        <div class="form-group">
          <label>Solar Power Entity</label>
          <input
            type="text"
            .value="${this._config.solar_power_entity || ''}"
            @change="${this._updateConfig}"
            data-field="solar_power_entity"
            placeholder="sensor.solar_power"
          />
        </div>
        <div class="form-group">
          <label>Battery Power Entity</label>
          <input
            type="text"
            .value="${this._config.battery_power_entity || ''}"
            @change="${this._updateConfig}"
            data-field="battery_power_entity"
            placeholder="sensor.battery_power"
          />
        </div>
        <div class="form-group">
          <label>Grid Power Entity</label>
          <input
            type="text"
            .value="${this._config.grid_power_entity || ''}"
            @change="${this._updateConfig}"
            data-field="grid_power_entity"
            placeholder="sensor.grid_power"
          />
        </div>
        <div class="form-group">
          <label>Load Power Entity</label>
          <input
            type="text"
            .value="${this._config.load_power_entity || ''}"
            @change="${this._updateConfig}"
            data-field="load_power_entity"
            placeholder="sensor.load_power"
          />
        </div>
      </div>
    `;
  }

  private _updateConfig(e: any) {
    const field = e.target.dataset.field;
    this._config = {
      ...this._config,
      [field]: e.target.value,
    };
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
