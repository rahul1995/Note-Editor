const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: ['babel-regenerator-runtime', 'babel-polyfill','./src/index.js'],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node-modules/,
                loaders: ["babel-loader"]
            },
            {
                test: /\.js$/,
                exclude: /node-modules/,
                loaders: ["source-map-loader"],
                enforce: 'pre'
            },
            {
                test: /\.css$/,
                loaders: ["style-loader", "css-loader"],
            }
        ]
    },
    devServer: {
        contentBase: "./dist/"
    },
    devtool: "inline-source-map",
    plugins: [
        new webpack.DefinePlugin({
          'process.env.SCALE_MEDIUM': 'true',
          'process.env.SCALE_LARGE': 'false',
          'process.env.THEME_LIGHT': 'true',
          'process.env.THEME_LIGHTEST': 'false',
          'process.env.THEME_DARK': 'false',
          'process.env.THEME_DARKEST': 'false'
        })
      ]
}