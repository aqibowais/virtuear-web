const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const rootPath = process.cwd()
const distPath = path.join(rootPath, 'alpharas-dist')
const srcPath = path.join(rootPath, 'src', 'ar-alpharas')

module.exports = {
  entry: path.join(srcPath, 'main.ts'),
  output: {
    filename: 'bundle.js',
    path: distPath,
    publicPath: './',
    clean: true,
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
          from: path.join(srcPath, 'assets', 'videos'),
          to: path.join(distPath, 'videos'),
          noErrorOnMissing: true,
        },
        {
          from: path.join(srcPath, 'assets', 'image-targets'),
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
          configFile: path.join(rootPath, 'tsconfig.alpharas.json'),
        },
      },
    ],
  },
  externals: {
    three: 'THREE',
  },
  mode: 'production',
  performance: {
    maxAssetSize: 512000,
    maxEntrypointSize: 512000,
    hints: false,
  },
}
