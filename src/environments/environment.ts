// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

const serverConfigs = {
  staging: {
    host: 'https://notify-messenger-notify-server-staging.lavanote.com/',
    client_id: 'OBHAOsPqcRsHd6fxd5TlVj9AtDnbg9hdDDOpbHl5'
  },
  local: {
    host: 'http://127.0.0.1:8000/',
    client_id: 'vf6Ecy2UY6CCrHED5J2EnBUgAQWTx9OQz45Ca5Aa'
  }
};

export const environment = {
  production: false,
  serverConfig: serverConfigs.staging,
};
