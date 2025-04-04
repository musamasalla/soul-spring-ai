// This file is a shim to fix JSX runtime issues
import * as React from 'react';

export {
  Fragment,
  jsx,
  jsxs,
  jsxDEV
} from 'react/jsx-runtime';

export default React; 