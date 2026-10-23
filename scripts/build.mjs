import { build } from "esbuild";
import { readFileSync } from "node:fs";
await build({
  entryPoints: ["src/card.js"],
  bundle: true,
  outfile: "magical-family-clock.js",
  format: "iife",
  target: ["es2018", "safari12"],
  minify: true,
  loader: { ".png": "dataurl", ".webp": "dataurl", ".ttf": "dataurl" },
  legalComments: "inline",
  banner: {
    js: "/*! Includes SunCalc, copyright 2014 Vladimir Agafonkin, BSD-2-Clause. See the license notice appended below. */",
  },
  footer: {
    js:
      "/*\n" +
      readFileSync("docs/SUNCALC-LICENSE.txt", "utf8") +
      "\nPirata One font:\n" +
      readFileSync("docs/PIRATA-ONE-OFL.txt", "utf8") +
      "\nCaveat font:\n" +
      readFileSync("docs/CAVEAT-OFL.txt", "utf8") +
      "\n*/",
  },
});
