const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const rootPath = process.cwd()
const distPath = path.join(rootPath, 'easyar-dist')
const srcPath = path.join(rootPath, 'src', 'ar-easyar')
const assetSrc = path.join(rootPath, 'src', 'ar-alpharas', 'assets')

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
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(assetSrc, 'videos'),
          to: path.join(distPath, 'videos'),
          noErrorOnMissing: true,
        },
        {
          from: path.join(assetSrc, 'image-targets'),
          to: path.join(distPath, 'image-targets'),
          noErrorOnMissing: true,
        },
      ],
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
