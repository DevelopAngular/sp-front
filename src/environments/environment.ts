// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  serverConfig: {
    host: 'https://notify-messenger-notify-server-staging.lavanote.com/',
    client_id: 'Wmr9cRCU97i8Clp2oaN7Pek8I3C7U7uXLGsJTqPN',
    host_ws: 'wss://notify-messenger-notify-server-staging.lavanote.com/',
    auth_method: null,
  },
};
