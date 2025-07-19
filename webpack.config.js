// cookinggame/webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development', // or 'production' for optimized builds
    entry: './src/2d-game.ts', // Your main game entry file (TypeScript)
    output: {
        filename: 'game.bundle.js',
        path: path.resolve(__dirname, 'dist/client') // Output to dist/client
    },
    resolve: {
        extensions: ['.ts', '.js'] // Resolve .ts and .js files
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html', // Use your existing index.html as a template
            filename: 'index.html'           // Output to dist/client/index.html
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'assets', // Copy your assets folder
                    to: 'assets'           // To assets in the dist/client folder
                }
            ]
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'), // Serve files from dist/client
        },
        compress: true,
        port: 8080,
        open: true // Open browser automatically
    }
};