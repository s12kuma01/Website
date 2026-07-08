// @material/material-color-utilities 0.4.0 ships ESM with extensionless
// internal imports (bundler-style). Node's ESM resolver rejects those, so the
// token generators register a resolve hook that retries with `.js` appended —
// scoped to that package only. Vite/esbuild resolve the same imports natively,
// so the client bundle needs nothing.
import { register } from 'node:module';

register('./mcu-ext-hook.mjs', import.meta.url);
