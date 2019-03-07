const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

const {
  prod_Path,
  src_Path
} = require('./path');
const {
  selectedPreprocessor
} = require('./loader');

function getVendorEntries(basePath, dependencies) {
  return dependencies.reduce((prev, dependency) => {
    const depPath = path.join(basePath, 'node_modules', dependency);

    const files = fs
      .readdirSync(depPath)
      .filter(file => {
        return (
          (path.extname(file) === '.js' || path.extname(file) === '.css') &&
          file !== path.basename(basePath)
        );
      })
      .map(file => path.join(dependency, file));

    return [...prev, ...files];
  }, []);
}

const packageJSON = path.join(__dirname, '/../package.json');
console.log({packageJSON})
const dependencies = Object.keys(JSON.parse(fs.readFileSync(packageJSON).toString()).dependencies);
const vendors = [...dependencies, ...getVendorEntries(path.join(__dirname, '/../'), dependencies)];

module.exports = {
  // entry: {
  //   main: './' + src_Path + '/index.js'
  // },
  entry: vendors,
  output: {
    path: path.resolve(__dirname, prod_Path),
    filename: '[name].[chunkhash].js'
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: selectedPreprocessor.fileRegexp,
        use: [{
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: selectedPreprocessor.loaderName
          }
        ]
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(path.resolve(__dirname, prod_Path), {
      root: process.cwd()
    }),
    new MiniCssExtractPlugin({
      filename: 'style.[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: './' + src_Path + '/index.html',
      filename: 'index.html'
    }),
    new WebpackMd5Hash(),
    new ManifestPlugin()
  ]
};