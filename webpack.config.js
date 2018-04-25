/**
 * @author stack fizz <huangchaolin@xylink.com>
 */

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

// 获取node环境变量
let env = process.env.NODE_ENV || "local";
//const conf = require(`./config/config.${env}.js`);

env = "development";

// todo: 使用react外部cdn
const config = {
  devtool: "source-map",

  devServer: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  },

  entry: {
    index: [path.resolve(__dirname, "./src/todomvc/index.tsx")],
    vendors: [
      "es5-shim",
      "es5-shim/es5-sham",
      "console-polyfill",
      "babel-polyfill",
      "es6-promise",
      "fetch-ie8",
      "qs"
    ]
    // , webpack: "webpack/hot/dev-server"
  },

  output: {
    path: path.resolve(__dirname, "build", env),
    filename: "js/[name].[chunkhash:8].js"
    //publicPath: conf.staticResource
  },

  resolve: {
    enforceExtension: false,
    extensions: ["", ".tsx", ".ts", ".jsx", ".js", ".css", ".scss"]
  },

  module: {
    loaders: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loaders: ["ts-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: "url-loader?limit=8096&name=img/[name].[hash:8].[ext]&publicPath=./"
      },

      {
        test: /\.(css|scss)$/,
        // include: [path.resolve(__dirname, 'src')],
        // 这里的loaders 如果是 env === development 应该取loaders
        // ExtractTextPlugin 需要为loader
        // issue here:
        // https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/30
        loaders:
          env !== "production"
            ? [
                "style",
                "typings-for-css-modules-loader?namedExport=true&modules&localIdentName=[name]-[local]-[hash:base64:5]&importLoaders=1",
                // "postcss",
                "sass"
              ]
            : ExtractTextPlugin.extract(
                // 卧槽，看了源码，第一个参数为before， 后面才是loaders, 经过多次试验，
                // 终于在把后面三个loaders放在一个数组里，postcss-loader 生效了。。。。
                // 代码在此处：并没有参数说明，放飞自我吧~
                // https://github.com/webpack-contrib/extract-text-webpack-plugin/blob/webpack-1/index.js#L128
                "style",
                ["css?modules", "postcss", "sass"]

                // {
                //   fallbackLoader: 'style-loader',
                //   loader: [
                //     {
                //       loader: 'css-loader',
                //       query: {
                //         modules: true,
                //         sourceMaps: true,
                //         importLoaders: 1
                //       }
                //     },
                //     'postcss-loader',
                //     "sass-loader"
                //   ]
                // }

                // [ "style-loader",
                //  {
                //    loader: "css-loader",
                //    options: {
                //      sourceMap: true,
                //      modules: true,
                //      importLoaders: 1
                //    }
                //  },
                //  {
                //    loader: "postcss-loader"
                //  },
                //  "sass-loader"
                // ]
              )
      }
    ],

    preLoaders: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loaders: ["tslint-loader"]
      }
    ],

    postLoaders: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        loaders: ["es3ify-loader"]
      }
    ]
  },

  // tslint-loader 的配置项
  // https://github.com/wbuchwalter/tslint-loader#loader-options
  tslint: {
    fix: true // 自动根据 prettier 的配置去fix代码风格
  },

  // externals: {
  //   react: 'React',
  //   'react-dom': 'ReactDOM'
  // },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: ["vendors", "manifest"],
      minChunks: Infinity,
      filename: "js/[name].[hash:8].js"
    }),

    new ExtractTextPlugin("main.[hash:8].css"),

    new HtmlWebpackPlugin({
      template: "./public/index.html",
      chunks: ["index", "vendors", "manifest"],
      filename: "index.html"
    })
  ]
};

// 开发环境和本地环境
if (env === "dev" || env === "local") {
  config.devtool = "source-map";

  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development")
    })
  );
}

// 生产环境和预发布环境
if (env === "prd" || env === "pre") {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: false
      },
      mangle: {
        screw_ie8: false
      },
      output: {
        screw_ie8: false //
      }
    })
  );

  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    })
  );
}

module.exports = config;
