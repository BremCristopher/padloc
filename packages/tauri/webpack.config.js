require("dotenv").config();
const { resolve, join } = require("path");
const { EnvironmentPlugin, optimize } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { version } = require("./package.json");

const out = process.env.PL_PWA_DIR || resolve(__dirname, "dist");
const serverUrl = process.env.PL_SERVER_URL || `http://0.0.0.0:${process.env.PL_SERVER_PORT || 3000}`;
const pwaUrl = process.env.PL_PWA_URL || `http://localhost:${process.env.PL_PWA_PORT || 8080}`;
const rootDir = resolve(__dirname, "../..");
const assetsDir = resolve(rootDir, process.env.PL_ASSETS_DIR || "assets");
const { name, terms_of_service } = require(join(assetsDir, "manifest.json"));

module.exports = {
    entry: resolve(__dirname, "src/index.ts"),
    output: {
        path: out,
        filename: "[name].js",
        chunkFilename: "[name].chunk.js",
        publicPath: "/",
    },
    mode: process.env.TAURI_DEBUG ? "development" : "production",
    devtool: process.env.TAURI_DEBUG ? "source-map" : false,
    stats: "minimal",
    performance: {
        hints: false, // Disable performance warnings for Tauri app
        maxEntrypointSize: 5000000, // 5MB
        maxAssetSize: 5000000 // 5MB
    },
    resolve: {
        extensions: [".ts", ".js", ".css", ".svg", ".png", ".jpg"],
        alias: {
            assets: assetsDir,
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                options: {
                    transpileOnly: true,
                    compilerOptions: {
                        skipLibCheck: true
                    }
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: "asset/resource",
                generator: {
                    filename: "fonts/[name][ext]"
                }
            },
            {
                test: /\.svg$/,
                type: "asset/resource",
            },
            {
                test: /\.txt|md$/i,
                use: "raw-loader",
            },
        ],
    },
    plugins: [
        new EnvironmentPlugin({
            PL_APP_NAME: name,
            PL_SERVER_URL: process.env.PL_SERVER_URL || `http://0.0.0.0:${process.env.PL_SERVER_PORT || 3000}`,
            PL_SUPPORT_EMAIL: "support@padloc.app",
            PL_VERSION: version,
            PL_VENDOR_VERSION: version,
            PL_DISABLE_SW: true,
            PL_CLIENT_SUPPORTED_AUTH_TYPES: "email",
            PL_TERMS_OF_SERVICE: terms_of_service,
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: name,
            template: resolve(__dirname, "src/index.html"),
            meta: {
                "Content-Security-Policy": {
                    "http-equiv": "Content-Security-Policy",
                    content: `default-src 'self' ${serverUrl} https://api.pwnedpasswords.com blob:; style-src 'self' 'unsafe-inline'; object-src 'self' blob:; frame-src 'self'; img-src 'self' blob: data: https:;`,
                },
            },
        }),
        // NOTE: Tauri needs a single chunk to properly inject the invoke key
        new optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
        // Copy FontAwesome fonts to dist
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: resolve(assetsDir, "fonts/FontAwesome"),
                    to: "fonts",
                },
            ],
        }),
    ],
    devServer: {
        historyApiFallback: true,
        host: "0.0.0.0",
        port: process.env.PL_PWA_PORT || 8080,
        // hot: false,
        // liveReload: false,
        client: { overlay: false },
        static: {
            directory: resolve(assetsDir, "fonts/FontAwesome"),
            publicPath: "/fonts",
        },
    },
};
