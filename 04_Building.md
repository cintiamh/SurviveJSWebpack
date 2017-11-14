# Building

* [Source Maps](#source-maps)
* [Bundle Splitting](#bundle-splitting)
* [Code Splitting](#code-splitting)
* [Tidying Up](#tidying-up)

## Source Maps

Source maps provides a mapping between the original and the transformed source code. (JavaScript and Styling)

### Inline source maps and separate source maps

* inline source maps: development - better performance.
* separate source maps: production - keeps bundle size smaller (loading source maps is optional).

### Enabling source maps

#### Enabling source maps in webpack

webpack.parts.js
```javascript
exports.generateSourceMaps = ({ type }) => ({
  devtool: type,
});
```

Webpack supports several types of source maps (they differ on quality and build speed).

* `eval-source-map` for development.
* `source-map` for production.

webpack.config.js
```javascript
const productionConfig = () => merge([
  parts.generateSourceMaps({ type: 'source-map' }),
  // ...
]);

const developmentConfig = () => merge([
  {
    output: {
      devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
  },
  parts.generateSourceMaps({ type: 'cheap-module-eval-source-map' }),
  // ...
]);
```

Note that source map is on top because it is one of the last things to do.

Now you should be able to get maps when running `npm run build`, these files end with `.map`.

#### Enabling source maps in browsers

## Bundle Splitting

## Code Splitting

## Tidying Up
