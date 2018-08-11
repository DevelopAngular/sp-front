import { Pipe, PipeTransform } from '@angular/core';

// This is webpack's publicPath and Angular's deployUrl
declare var __webpack_public_path__: string;

function joinPaths(paths: string[]): string {
  return paths
    .map(p => p.replace(/\/$/, ''))
    .filter(p => p !== '')
    .join('/')
    .replace(/\/(\.\/)+/, '/');
}

@Pipe({
  name: 'resolveAsset'
})
export class ResolveAssetPipe implements PipeTransform {

  transform(value: string, args?: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    if (value.indexOf('../') === 0) {
      throw new Error(`Asset path must not use parent directory path segments: ${value}`);
    }

    if (value.indexOf('http://') === 0 || value.indexOf('https://') === 0) {
      return value;
    }

    return joinPaths([__webpack_public_path__, value]);
  }

}
