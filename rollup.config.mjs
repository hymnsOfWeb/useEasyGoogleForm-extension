import typescript from "@rollup/plugin-typescript";
import cjs from "@rollup/plugin-commonjs";

/** @type {import('rollup').RollupOptions} */
const themeConfig = {
  input: "src/back-end/index.ts",
  output: [
    {
      file: "src/back-end/index.js",
      format: "cjs",
      sourcemap: false
    },
    {
      file: "src/back-end/index.mjs",
      format: "esm",
      sourcemap: false
    }
  ],
  plugins: [
    cjs({
      include: /node_modules/gm
    }),
    typescript({ tsconfig: "./tsconfig.json" })
  ]
};
export default themeConfig;
