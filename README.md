# hall-pass-web

This is the frontend for the SmartPass system. It is an Angular web app. 
It is used on Chromebooks primarily, but also as a PWA for Android devices.

## Setting up

To run the project, follow the below instructions:

- Install `nvm` by following this doc [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)
    If you get any issues on macOS, follow this instructions [https://github.com/nvm-sh/nvm#macos-troubleshooting](https://github.com/nvm-sh/nvm#macos-troubleshooting)
- cd into the root project directory
- `nvm use`
- `npm install -g yarn`
- `yarn install`
- `yarn run start`

## Gitlab CI

### testing_build

This pipeline clones the repo and builds the Angular project to ensure there are no compilation errors. The scripts for this section installs `nvm` and installs the node version specified in the `.
nvmrc` file. Any other pipeline requiring the Angular application to be built will also include the code to install `nvm` and lock the node version.

<b>Why use the unofficial node.js build for nvm?</b>

Currently, it seems that the node.js team hasn't provided node binaries for Alpine Linux (which is what our current docker container runs on). We need to use the unofficial binaries build agains 
`musl` since this is what Alpine OS uses.

<b>Why is `bash` called after installing `nvm`?</b>

When `nvm` is installed during a terminal session, it isn't available until the terminal is restarted. When the terminal restarts, it re-reads all the exported paths and the `nvm` becomes 
available. `nvm -v` is called to make sure its installed properly.

<b>Why doesn't `nvm install` work as intended?</b>

This behaviour may work in the future, but at the time of writing these docs, there seems to be a problem downloading the archives through `nvm`. The package is downloaded manually using `wget` 
and places into a folder where `nvm` can look for the binary locally.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.
