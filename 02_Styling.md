# Styling

* [Loading Styles](#loading-styles)
* [Separating CSS](#separating-css)
* [Autoprefixing](#autoprefixing)
* [Eliminating Unused CSS](#eliminating-unused-css)
* [Linting CSS](#linting-css)

## Loading Styles

Webpack doesn't handle styling out of the box.

### Loading CSS

To load CSS, you need:
* css-loader: goes through `@import` and `url()` lookups and treat them like regular ES6 imports. (only for internal files)
* style-loader: injects the styling through a `style` element. It also implements the Hot Module Replacement interface.

Since inlining CSS isn't a good idea, we use `ExtractTextPlugin` to generate a separated CSS file.

```
$ npm i css-loader style-loader --save-dev
```

webpack.parts.js
```javascript
exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        include,
        exclude,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});
```

webpack.config.js
```javascript
const commonConfig = merge([
  {
    entry: {
      app: PATHS.app,
    },
    output: {
      path: PATHS.build,
      filename: '[name].js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Webpack demo',
      }),
    ],
  },
  parts.loadCSS(),
]);
```

### Setting up the initial CSS

```
$ touch app/main.css
```

app/main.css
```css
body {
    background: cornsilk;
}
```

You need to make webpack aware of it.

app/index.js
```javascript
import './main.css';
```

Now, if you try `npm run start` you should see the different background color on localhost:8080.

### Understanding CSS scoping and CSS modules


## Separating CSS

## Autoprefixing

## Eliminating Unused CSS

## Linting CSS
