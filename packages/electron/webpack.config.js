const { resolve, join } = require("path");
const { EnvironmentPlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const rootDir = resolve(__dirname, "../..");
const assetsDir = resolve(rootDir, process.env.PL_ASSETS_DIR || "assets");
const { version } = require(resolve(__dirname, "package.json"));
const { name, description, author, scheme, terms_of_service } = require(join(assetsDir, "manifest.json"));

module.exports = [
    // Main process configuration
    {
        target: "electron-main",
        entry: {
            main: resolve(__dirname, "src/main.ts"),
        },
        output: {
            path: resolve(__dirname, "app"),
            filename: "[name].js",
            chunkFilename: "[name].chunk.js",
        },
        mode: "development",
        devtool: "source-map",
        stats: "minimal",
        resolve: {
            extensions: [".ts", ".js"],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                },
            ],
        },
        plugins: [
            new EnvironmentPlugin({
                PL_PWA_URL: process.env.PL_PWA_URL || "file://",  // Use file:// for bundled app
                PL_USE_BUNDLED_APP: "true",  // Flag to use bundled app
                PL_APP_SCHEME: scheme,
                PL_APP_NAME: name,
                PL_VENDOR_VERSION: version,
                PL_TERMS_OF_SERVICE: terms_of_service,
                PL_SERVER_URL: process.env.PL_SERVER_URL || "https://api.padloc.app",
            }),
            {
                apply(compiler) {
                    const package = JSON.stringify({
                        name,
                        description,
                        version: process.env.PL_VENDOR_VERSION || version,
                        author,
                        main: "main.js",
                    });
                    compiler.hooks.emit.tapPromise("InjectAppPackage", async (compilation) => {
                        // Use the new webpack 5 API to emit assets
                        compilation.emitAsset("package.json", {
                            source: () => package,
                            size: () => package.length,
                        });
                    });
                },
            },
        ],
    },
    // Renderer process configuration (PWA)
    {
        target: "electron-renderer",
        entry: {
            app: resolve(__dirname, "src/index.ts"),
        },
        output: {
            path: resolve(__dirname, "app"),
            filename: "[name].js",
            chunkFilename: "[name].chunk.js",
            publicPath: "",
        },
        mode: "development",
        devtool: "source-map",
        stats: "minimal",
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
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    type: "asset/resource",
                    generator: {
                        filename: "fonts/[name][ext]",
                    },
                },
                {
                    test: /\.(svg|png|jpg|jpeg|gif)$/,
                    type: "asset/resource",
                    generator: {
                        filename: "images/[name][ext]",
                    },
                },
                {
                    test: /\.txt$/,
                    type: "asset/source",
                },
                {
                    test: /\.md$/,
                    type: "asset/source",
                },
            ],
        },
        plugins: [
            // CleanWebpackPlugin removed from here to prevent cleaning main.js from the first config
            new HtmlWebpackPlugin({
                title: name,
                template: resolve(__dirname, "src/index.html"),
                filename: "index.html",
                chunks: ["app"],
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: resolve(assetsDir, "fonts/FontAwesome"),
                        to: "fonts",
                    },
                    {
                        from: assetsDir,
                        to: "assets",
                        globOptions: {
                            ignore: ["**/fonts/**"],  // Avoid duplicating fonts
                        },
                    },
                ],
            }),
            new EnvironmentPlugin({
                PL_APP_NAME: name,
                PL_VENDOR_VERSION: version,
                PL_TERMS_OF_SERVICE: terms_of_service,
                PL_SERVER_URL: process.env.PL_SERVER_URL || "http://localhost:3000",  // Default to local server
                PL_BILLING_ENABLED: process.env.PL_BILLING_ENABLED || "false",
                PL_BILLING_DISABLE_PAYMENT: process.env.PL_BILLING_DISABLE_PAYMENT || "false",
                PL_BILLING_STRIPE_PUBLIC_KEY: process.env.PL_BILLING_STRIPE_PUBLIC_KEY || "",
                PL_SUPPORT_EMAIL: process.env.PL_SUPPORT_EMAIL || "support@padloc.app",
                PL_DISABLE_SW: "true",  // Disable service worker for Electron
            }),
        ],
    },
];
