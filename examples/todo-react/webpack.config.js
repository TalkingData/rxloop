const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: {
    main: './src/index.js',
    vendor: ['react', 'react-dom'],
  },
  output: {
    filename: `[name].[${process.env.NODE_ENV === 'production' ? 'chunkhash' : 'hash'}:16].js`,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        // webpack 3 loader: 'babel-loader',
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: 'index.html',
        inject: 'body',
        minify: {
            html5: true
        },
        hash: false
    })
  ],
  optimization: {
    splitChunks: {
        chunks: "all",
        minChunks: 1,
        minSize: 0,
        cacheGroups: {
            vendor: {
                test: "vendor",
                name: "vendor"
            }
        }
    }
  }
};