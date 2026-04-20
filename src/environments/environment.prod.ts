/*"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ],
  }
}*/

export const environment = {
  production: true,
  local: {
    urlHost: 'http://backend:8080/',
    urlApi: 'http://backend:8080/',
    userId: 1,
  },
};
