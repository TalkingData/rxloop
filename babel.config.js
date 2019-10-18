// const { NODE_ENV } = process.env;

module.exports = {
  babelrcRoots: [
    ".",
    "packages/*",
  ],
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          // node: 'current',
          "browsers": [ "ie >= 11" ],
        },
        "exclude": ["transform-async-to-generator", "transform-regenerator"],
        "modules": false,
        "loose": true
      }
    ]
  ],
  "plugins": [
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-transform-runtime"
  ],
  "env": {
    "test": {
      "presets": [
        [ "@babel/preset-env", { "modules": "cjs" } ]
      ]
    },
  }
}