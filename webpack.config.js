const path = require('path');

module.exports = {
  mode: 'production',
  entry: './dist/smart-power-flow-card.js',
  output: {
    filename: 'smart-power-flow-card.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'SmartPowerFlowCard',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: {
    lit: 'lit',
    'home-assistant-js-websocket': 'homeAssistantJsWebsocket',
  },
};
