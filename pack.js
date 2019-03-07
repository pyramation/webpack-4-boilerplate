const config = require('./webpack/webpack.prod');

const webpack = require('webpack');

const compiler = webpack(config);

compiler.run(err => {
    console.log(err);
    console.log('done!');
});
