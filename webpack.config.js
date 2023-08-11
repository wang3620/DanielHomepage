const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    // 1
    entry: './src/index.js',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/, // Match .css files
                use: ['style-loader', 'css-loader'], // Use style-loader and css-loader to handle CSS files
            }
        ]
    },
    resolve: {
        extensions: ['.*', '.js', '.jsx'],
        fallback: {
            "fs": false,
            "net": false,
            "tls": false,
        }
    },
    plugins: [
        new NodePolyfillPlugin()
    ],
    // 2
    output: {
        path: __dirname + '/home/dist',
        publicPath: '/',
        filename: 'bundle.js'
    },
    // 3
    devServer: {
        contentBase: './dist',
        port: 9000
    }
};