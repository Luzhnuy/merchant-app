// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // apiUrlV2: 'http://localhost:3000/',
  // wsUrl: 'ws://localhost:3001',
  // imageHost: 'http://localhost:3000/',
  // trackingUrlBaseUrl: 'http://localhost:4200/track/',
  //
  // apiUrlV2: 'http://192.168.0.102:3000/',
  // wsUrl: 'ws://192.168.0.102:3001',
  // imageHost: 'http://192.168.0.102:3000/',
  // trackingUrlBaseUrl: 'http://192.168.0.102:4200/track/',

  apiUrlV2: 'https://sg-swift-test.snapgrabdelivery.com/api/',
  wsUrl: 'wss://sg-swift-test-ws.snapgrabdelivery.com',
  imageHost: 'https://sg-swift-test.snapgrabdelivery.com/api/',
  trackingUrlBaseUrl: 'https://sg-swift-test.snapgrabdelivery.com/track/',
  //
  oneSignal: {
    appId: 'b8959365-ea50-4c25-82fa-cb371c03fcb8',
    googleProjectNumber: '313369182389',
    safariWebId: 'web.onesignal.auto.639febc2-a356-4a97-8e69-81281557724a',
  },

  // apiUrlV2: 'https://sg-swift-test.snapgrabdelivery.com/api/',
  // wsUrl: 'wss://sg-swift-test-ws.snapgrabdelivery.com',
  // imageHost: 'https://sg-swift-test.snapgrabdelivery.com/api/',
  // trackingUrlBaseUrl: 'https://sg-swift-test.snapgrabdelivery.com/track/',

  wsSource: 'merchant',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
