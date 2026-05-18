"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };

  // src/smart-power-flow-card.ts
  var import_lit = __require("lit");
  var import_decorators = __require("lit/decorators.js");
  var SmartPowerFlowCard = class extends import_lit.LitElement {
    constructor() {
      super(...arguments);
      this._entities = {};
    }
    static getConfigElement() {
      return document.createElement("smart-power-flow-card-editor");
    }
    static getStubConfig() {
      return {
        auto_detect: true,
        grid_entity: "",
        solar_entity: "",
        home_consumption_entity: "",
        battery_power_entity: "",
        battery_level_entity: ""
      };
    }
    setConfig(config) {
      if (!config) {
        throw new Error("Invalid configuration");
      }
      this.config = config;
      this._updateEntities();
    }
    updated(changedProperties) {
      super.updated(changedProperties);
      if (changedProperties.has("hass")) {
        this._updateEntities();
      }
    }
    _updateEntities() {
      if (!this.hass || !this.config)
        return;
      if (this.config.auto_detect) {
        this._entities = this._findEnergyEntities();
      } else {
        this._entities = {
          grid: this.config.grid_entity,
          solar: this.config.solar_entity,
          home: this.config.home_consumption_entity,
          battery_power: this.config.battery_power_entity,
          battery_level: this.config.battery_level_entity
        };
      }
    }
    _findEnergyEntities() {
      const result = {
        grid: null,
        solar: null,
        home: null,
        battery_power: null,
        battery_level: null
      };
      if (!this.hass.states)
        return result;
      Object.keys(this.hass.states).forEach((entityId) => {
        const state3 = this.hass.states[entityId];
        const deviceClass = state3.attributes.device_class;
        const unit = state3.attributes.unit_of_measurement;
        if (deviceClass === "power" && (unit === "W" || unit === "kW") && !result.grid) {
          if (entityId.includes("grid") || entityId.includes("inverter") && !entityId.includes("solar")) {
            result.grid = entityId;
          }
        }
        if (deviceClass === "power" && (unit === "W" || unit === "kW") && !result.solar) {
          if (entityId.includes("solar") || entityId.includes("pv") || entityId.includes("sun")) {
            result.solar = entityId;
          }
        }
        if (deviceClass === "power" && (unit === "W" || unit === "kW") && !result.home) {
          if (entityId.includes("house") || entityId.includes("home") || entityId.includes("consumption") || entityId.includes("load")) {
            result.home = entityId;
          }
        }
        if (deviceClass === "power" && (unit === "W" || unit === "kW") && !result.battery_power) {
          if (entityId.includes("battery")) {
            result.battery_power = entityId;
          }
        }
        if (deviceClass === "battery" && unit === "%" && !result.battery_level) {
          result.battery_level = entityId;
        }
      });
      return result;
    }
    static get styles() {
      return import_lit.css`
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
    render() {
      if (!this.hass || !this.config) {
        return import_lit.html`<div class="card no-entities">Configuration missing</div>`;
      }
      if (!this._entities.grid && !this._entities.solar && !this._entities.home && !this._entities.battery_power) {
        return import_lit.html`
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
      return import_lit.html`
      <div class="card">
        <div class="title">Power Flow</div>
        <div class="flow-container">
          ${this._entities.solar ? import_lit.html`
                <div class="power-box">
                  <div class="power-label">Solar</div>
                  <div class="power-value">
                    ${solarPower}<span class="power-unit">W</span>
                  </div>
                </div>
              ` : ""}
          ${this._entities.grid ? import_lit.html`
                <div class="power-box">
                  <div class="power-label">Grid</div>
                  <div class="power-value">
                    ${gridPower}<span class="power-unit">W</span>
                  </div>
                </div>
              ` : ""}
          ${this._entities.home ? import_lit.html`
                <div class="power-box">
                  <div class="power-label">Home</div>
                  <div class="power-value">
                    ${homePower}<span class="power-unit">W</span>
                  </div>
                </div>
              ` : ""}
          ${this._entities.battery_power ? import_lit.html`
                <div class="power-box">
                  <div class="power-label">Battery</div>
                  <div class="power-value">
                    ${batteryPower}<span class="power-unit">W</span>
                  </div>
                  ${this._entities.battery_level ? import_lit.html`<div class="power-unit">${batteryLevel}%</div>` : ""}
                </div>
              ` : ""}
        </div>
      </div>
    `;
    }
    _getEntityValue(entityId) {
      if (!entityId || !this.hass.states[entityId]) {
        return "--";
      }
      const state3 = this.hass.states[entityId].state;
      return state3 === "unknown" ? "--" : Math.round(parseFloat(state3));
    }
  };
  __decorateClass([
    (0, import_decorators.property)({ type: Object })
  ], SmartPowerFlowCard.prototype, "hass", 2);
  __decorateClass([
    (0, import_decorators.property)({ type: Object })
  ], SmartPowerFlowCard.prototype, "config", 2);
  __decorateClass([
    (0, import_decorators.state)()
  ], SmartPowerFlowCard.prototype, "_entities", 2);
  SmartPowerFlowCard = __decorateClass([
    (0, import_decorators.customElement)("smart-power-flow-card")
  ], SmartPowerFlowCard);

  // src/editor.ts
  var import_lit2 = __require("lit");
  var import_decorators2 = __require("lit/decorators.js");
  var SmartPowerFlowCardEditor = class extends import_lit2.LitElement {
    constructor() {
      super(...arguments);
      this._config = {};
    }
    setConfig(config) {
      this._config = { ...config };
    }
    render() {
      return import_lit2.html`
      <ha-form
        .data=${this._config}
        .schema=${[
        {
          name: "auto_detect",
          type: "boolean",
          label: "Auto-detect entities",
          default: true
        },
        {
          name: "grid_entity",
          type: "entity",
          label: "Grid Power Entity",
          selector: {
            entity: {
              domain: "sensor",
              device_class: "power"
            }
          }
        },
        {
          name: "solar_entity",
          type: "entity",
          label: "Solar Power Entity",
          selector: {
            entity: {
              domain: "sensor",
              device_class: "power"
            }
          }
        },
        {
          name: "home_consumption_entity",
          type: "entity",
          label: "Home Consumption Entity",
          selector: {
            entity: {
              domain: "sensor",
              device_class: "power"
            }
          }
        },
        {
          name: "battery_power_entity",
          type: "entity",
          label: "Battery Power Entity",
          selector: {
            entity: {
              domain: "sensor",
              device_class: "power"
            }
          }
        },
        {
          name: "battery_level_entity",
          type: "entity",
          label: "Battery Level Entity",
          selector: {
            entity: {
              domain: "sensor",
              device_class: "battery"
            }
          }
        }
      ]}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
    }
    _valueChanged(ev) {
      this._config = ev.detail.value;
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true,
          composed: true
        })
      );
    }
  };
  __decorateClass([
    (0, import_decorators2.property)({ type: Object })
  ], SmartPowerFlowCardEditor.prototype, "hass", 2);
  __decorateClass([
    (0, import_decorators2.property)({ type: Object })
  ], SmartPowerFlowCardEditor.prototype, "config", 2);
  __decorateClass([
    (0, import_decorators2.state)()
  ], SmartPowerFlowCardEditor.prototype, "_config", 2);
  SmartPowerFlowCardEditor = __decorateClass([
    (0, import_decorators2.customElement)("smart-power-flow-card-editor")
  ], SmartPowerFlowCardEditor);
})();
