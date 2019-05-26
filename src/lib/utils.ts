import * as yaml from 'js-yaml';

export namespace Utils {

  /***************************************************************************************************************************/
  /* HTML DOM functions
  /***************************************************************************************************************************/

  export function hasClass(element: Element, className: string): boolean {
    return (element.classList) ?
      element.classList.contains(className) :
      new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
  }

  export function removeClass(element: Element, className: string) {
    (element.classList) ?
      element.classList.remove(className) :
      element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }

  export function addClass(element: Element, className: string) {
    (element.classList) ?
      element.classList.add(className) :
      element.className += ' ' + className;
  }

  /***************************************************************************************************************************/
  /* General helper functions
  /***************************************************************************************************************************/

  export function formatDate(date: Date): string {
    if (!date) return '';

    return (typeof date === 'string') ?
      new Date(date).toLocaleString() : date.toLocaleString();
  }

  export function parseYaml(yamlText: string): any {
    return yaml.safeLoad(yamlText);
  }

  export async function fetchText(resourceUrl: string, useCache: boolean = true): Promise<string> {
    /*
    resourceUrl = (process.env.NODE_ENV === 'production') ?
      resourceUrl.replace(/^\/local\/floorplan/g, "/static/local/floorplan") :
      resourceUrl = resourceUrl.replace(/^\/local\/floorplan/g, "./local/floorplan");
    */
    resourceUrl = resourceUrl.replace(/^\/local\/floorplan/g, "./local/floorplan");

    resourceUrl = useCache ? resourceUrl : cacheBuster(resourceUrl);

    const request = new Request(resourceUrl, {
      cache: useCache ? 'reload' : 'no-cache',
    });

    try {
      const response = await fetch(request);
      if (response.ok) {
        const text = await response.text();
        return text;
      }
      else {
        throw new Error(`Error fetching resource`); //`
      }
    }
    catch (error) {
      throw new URIError(`${resourceUrl}: ${error.message}`); //`
    }
  }

  export async function fetchImage(resourceUrl: string, useCache: boolean = true): Promise<string> {
    /*
    resourceUrl = (process.env.NODE_ENV === 'production') ?
      resourceUrl.replace(/^\/local\/floorplan/g, "/static/local/floorplan") :
      resourceUrl = resourceUrl.replace(/^\/local\/floorplan/g, "./local/floorplan");
    */
    resourceUrl = resourceUrl.replace(/^\/local\/floorplan/g, "./local/floorplan");

    resourceUrl = useCache ? resourceUrl : cacheBuster(resourceUrl);

    const request = new Request(resourceUrl, {
      cache: useCache ? 'reload' : 'no-cache',
      headers: new Headers({ 'Content-Type': 'text/plain; charset=x-user-defined' }),
    });

    try {
      const response = await fetch(request);
      if (response.ok) {
        const result = await response.arrayBuffer();
        return `data:image/jpeg;base64,${arrayBufferToBase64(result)}`; //`
      }
      else {
        throw new Error(`Error fetching resource`); //`
      }
    }
    catch (error) {
      throw new URIError(`${resourceUrl}: ${error.message}`); //`
    }
  }

  /***************************************************************************************************************************/
  /* Utility functions
  /***************************************************************************************************************************/

  export function getArray(list: any): Array<any> {
    return Array.isArray(list) ? list : Object.keys(list).map(key => list[key]);
  }

  export function arrayBufferToBase64(buffer: ArrayBufferLike): string {
    let binary = '';
    const bytes = [].slice.call(new Uint8Array(buffer));

    bytes.forEach((b) => binary += String.fromCharCode(b));

    let base64 = window.btoa(binary);

    // IOS / Safari will not render base64 images unless length is divisible by 4
    while ((base64.length % 4) > 0) {
      base64 += '=';
    }

    return base64;
  }

  export function cacheBuster(url: string): string {
    return `${url}${(url.indexOf('?') >= 0) ? '&' : '?'}_=${new Date().getTime()}`; //`
  }

  export function equal(a: any, b: any): boolean {
    if (a === b) return true;

    let arrA = Array.isArray(a)
      , arrB = Array.isArray(b)
      , i;

    if (arrA && arrB) {
      if (a.length != b.length) return false;
      for (i = 0; i < a.length; i++)
        if (!equal(a[i], b[i])) return false;
      return true;
    }

    if (arrA != arrB) return false;

    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const keys = Object.keys(a);
      if (keys.length !== Object.keys(b).length) return false;

      const dateA = a instanceof Date
        , dateB = b instanceof Date;
      if (dateA && dateB) return a.getTime() == b.getTime();
      if (dateA != dateB) return false;

      const regexpA = a instanceof RegExp
        , regexpB = b instanceof RegExp;
      if (regexpA && regexpB) return a.toString() == b.toString();
      if (regexpA != regexpB) return false;

      for (i = 0; i < keys.length; i++)
        if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

      for (i = 0; i < keys.length; i++)
        if (!equal(a[keys[i]], b[keys[i]])) return false;

      return true;
    }

    return false;
  }

}