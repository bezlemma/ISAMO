import { build } from 'esbuild';
import { builtinModules } from 'node:module';
await build({ entryPoints: ['community/worker.mjs'], outfile: 'tmp/community-worker.mjs', bundle: true, minify: true, format: 'esm', platform: 'node', target: 'es2022', external: [...builtinModules, ...builtinModules.map(x => 'node:' + x)], banner: { js: "import { createRequire } from 'node:module'; const require = createRequire('/worker.mjs');" } });
