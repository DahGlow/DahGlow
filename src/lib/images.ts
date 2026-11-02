
export function optimizedImage(source:string,width=650){if(!source)return '';const url=new URL(source);if(url.hostname==='cdn.shopify.com'||url.hostname.endsWith('.shopify.com'))url.searchParams.set('width',String(width));return url.toString();}
