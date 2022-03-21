# Hallpass

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.5.4.

## Cloning the repo

After cloning, run: 

- `npm ci` 
- `npm install firebase@^5.1.0` (You might need this if you run into grpc 1.20.0 install errors from previous command)
- `npm run start`

<b>Why use `npm ci` and not `npm install` for a newly clone repo?</b>

The current repo version of Firebase requires gRPC 1.20.0, which isn't supported by the current version of Node. `npm ci`  seems to work without problems but `npm install` catches the 
incompatibility between the node version and gRPC. It's unclear why this happens now, but when packages are updated, this should go away.

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

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
