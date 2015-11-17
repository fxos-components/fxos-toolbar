module.exports = {
  entry: './src/fxos-toolbar.js',
  output: {
    filename: 'fxos-toolbar.js',
    library: 'fxosToolbar',
    libraryTarget: 'umd'
  },

  externals: {
    'fxos-component': {
      root: 'fxosComponent',
      commonjs: 'fxos-component',
      commonjs2: 'fxos-component',
      amd: 'fxos-component'
    },
    'fxos-dialog-menu': {
      root: 'FXOSDialogMenu',
      commonjs: 'fxos-dialog-menu',
      commonjs2: 'fxos-dialog-menu',
      amd: 'fxos-dialog-menu'
    }
  }
};
