var webpack = require("webpack");
var path = require("path");

module.exports = {
    entry: "./src/app/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: "babel-loader",
            exclude: /node_modules/,
            query: {
                presets: ["react", "es2015", "stage-2"]
            }
        }]
    },
    devServer: {
        historyApiFallback: true
    }
}