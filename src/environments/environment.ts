// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  // appVersion: require('../../package.json').version + '-dev',
  appVersion: require("../../package.json").version,
  recaptcha: {
    siteKey: "6Ldk110oAAAAACkHBSY93L06izm_IE2TKa1fnmkB",
  },
  production: false,
  url: "",
  api_url: "https://bestinform.eu",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
