const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const rootPath = process.cwd()
const distPath = path.join(rootPath, 'easyar-dist')
const srcPath = path.join(rootPath, 'src', 'ar-easyar')

module.exports = {
  entry: path.join(srcPath, 'main.ts'),
  output: {
    filename: 'bundle.js',
    path: distPath,
    publicPath: './',
    clean: false,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(srcPath, 'index.html'),
      filename: 'index.html',
      scriptLoading: 'blocking',
      inject: false,
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: path.join(rootPath, 'tsconfig.easyar.json'),
        },
      },
    ],
  },
  mode: 'production',
  performance: { hints: false },
}
