import { defineConfig, type Options } from "tsup";

let config: Options = {
  entry: ["lib/**/*"],
  outDir: "dist",
  splitting: true,
  sourcemap: false,
  bundle: true,
  clean: true,
  dts: true,
  target: "node20"
};

export default defineConfig(config);
