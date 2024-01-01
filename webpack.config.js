const path = require("path");

module.exports = {
  mode: "production",
  entry: "./index.ts",
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/",
    filename: "main.js",
  },
  use: {
    test: /\.ts?$/,
    loader: "babel-loader",
    options: {
      presets: [["@babel/preset-env", { targets: "defaults" }]],
    },
  },
  target: "node",
};
