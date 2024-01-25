import {base64FromUrl, base64ToUrl} from './cardboardBase64';

export default class Cardboard {
  public static decode(str: string): Uint8Array {
    return Buffer.from(base64FromUrl(str), 'base64');
  }

  public static encode(data: Uint8Array): string {
    return base64ToUrl(Buffer.from(data).toString('base64'));
  }
  
  public static encode_uri(data: Uint8Array): string {
    return 'http://google.com/cardboard/cfg?p=' + Cardboard.encode(data);
  }
};
