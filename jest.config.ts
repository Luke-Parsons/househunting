  module.exports = {
    globals: {
      "ts-jest": {
          useESM: true,
          tsconfig: "tsconfig-esm.json",
          extensionsToTreatAsEsm: [".js",".jsx",".ts",".tsx"],
      },
    },
    preset: "ts-jest/presets/default-esm",
    verbose: true,
    extensionsToTreatAsEsm: [".jsx",".ts",".tsx"],
    moduleDirectories: ["node_modules", "src"],
    moduleFileExtensions: ["js","jsx","ts","tsx"],
};
