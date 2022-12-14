// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/jest/fileTransform.js
import * as path from 'path';
import * as camelcase from '@builder/pack/deps/camelcase';

export default {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));

    if (filename.match(/\.svg$/)) {
      const pascalCaseFileName = camelcase(path.parse(filename).name, {
        pascalCase: true,
      });
      const componentName = `Svg${pascalCaseFileName}`;
      return `const React = require('react');
      module.exports = {
        __esModule: true,
        default: ${assetFilename},
        ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
          return {
            $$typeof: Symbol.for('react.element'),
            type: 'svg',
            ref: ref,
            key: null,
            props: Object.assign({}, props, {
              children: ${assetFilename}
            })
          };
        }),
      };`;
    }

    return `module.exports = ${assetFilename};`;
  },
};
