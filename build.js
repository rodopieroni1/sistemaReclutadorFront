const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/main.ts"], // Cambia 'app.js' por el nombre de tu archivo principal
    bundle: true, // Activa el empaquetado
    platform: "node", // Indica que el entorno es Node.js
    outfile: "output.js", // Especifica el nombre del archivo de salida
  })
  .catch(() => process.exit(1));
