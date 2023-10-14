import typescript from "@rollup/plugin-typescript";
import cjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

/** @type {import('rollup').RollupOptions} */
const themeConfig = {
  input: "src/back-end/index.ts",
  output: [
    {
      file: "src/base/index.js",
      format: "cjs",
      sourcemap: false
    }
  ],
  plugins: [
    nodeResolve(),
    cjs({
      include: /node_modules/gm
    }),
    typescript({ tsconfig: "./tsconfig.json", sourceMap: false }),
    terser()
  ]
};
export default themeConfig;
