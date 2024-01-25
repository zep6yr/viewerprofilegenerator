import QRCode from 'qrcode';
import protobuf from 'protobufjs/minimal';
import CardboardDevice from './CardboardDevice';
import Cardboard from './cardboard';
import PNGDownloadLink from './PNGDownloadLink';

customElements.define('png-download-link', PNGDownloadLink);

class Context {
    public deviceparam: CardboardDevice.DeviceParams;
}

function load(): CardboardDevice.DeviceParams {
    const searchParams = new URLSearchParams(window.location.search);
    if(searchParams.has('p')) {
        try {
            const p = searchParams.get('p');
            if(p) {
                let decodedMessage = CardboardDevice.DeviceParams.decode(Cardboard.decode(p));
                return decodedMessage;
            }
        } catch (e) {
            if (e instanceof protobuf.util.ProtocolError) {
                console.error(e);
            } else {
                console.error("invalid format");
            }
        }
    }
    let deviceparam = CardboardDevice.DeviceParams.create();
    deviceparam.vendor = "Google";
    deviceparam.model = "Cardboard v1";
    deviceparam.screenToLensDistance = 0.0393;
    deviceparam.interLensDistance = 0.0639;
    deviceparam.leftEyeFieldOfViewAngles = [40.0, 40.0, 40.0, 40.0];
    deviceparam.trayToLensDistance = 0.035;
    deviceparam.primaryButton = CardboardDevice.DeviceParams.ButtonType.NONE;
    deviceparam.verticalAlignment = CardboardDevice.DeviceParams.VerticalAlignmentType.BOTTOM;
    deviceparam.distortionCoefficients = [0.33583, 0.55349];
    deviceparam.hasMagnet = false;
    return deviceparam;
}

let getValueFromInputTextElement = (name: string): string => (document.querySelector(`input[name="${name}"]`) as HTMLInputElement)?.value

function setValueToInputTextElement(name: string, value: string) {
    let input = document.querySelector(`input[name='${name}']`) as HTMLInputElement
    if(input) {
        input.value = value;
    }
}

function getFloatValueFromInputElement(leftEyeFieldOfViewAngles: NodeList, idx: number): number {
    let val = (leftEyeFieldOfViewAngles[idx] as HTMLInputElement).value;
    return parseFloat(val);
}

let millimeter2Meter = (cm: number): number => cm / 1000.0
let meter2Millimeter = (m: number): number => m * 1000.0

function setArrayElement(selector: string, numbers: number[], length: number, fixedNumberLength: number) {
    let elements = document.querySelectorAll(selector);
    if(elements.length != length) return;
    if(numbers.length != length) return;
    for(let i = 0; i < length; i++) {
        let elem = elements[i] as HTMLInputElement;
        if(elem) {
            elem.value = Number(numbers[i]).toFixed(fixedNumberLength);
        }
    }
}

class DeviceParamsViewModel implements CardboardDevice.IDeviceParams {

    get leftEyeFieldOfViewAngles() { 
        let leftEyeFieldOfViewAngles = document.querySelectorAll(`input[name='leftEyeFieldOfViewAngles[]']`);
        return [
            getFloatValueFromInputElement(leftEyeFieldOfViewAngles, 0),
            getFloatValueFromInputElement(leftEyeFieldOfViewAngles, 1),
            getFloatValueFromInputElement(leftEyeFieldOfViewAngles, 2),
            getFloatValueFromInputElement(leftEyeFieldOfViewAngles, 3),
        ]
    }

    set leftEyeFieldOfViewAngles(numbers: number[]) {
        setArrayElement("input[name='leftEyeFieldOfViewAngles[]']", numbers, 4, 1)
    }

    get distortionCoefficients() { 
        let distortionCoefficients = document.querySelectorAll(`input[name='distortionCoefficients[]']`);
        return [
            getFloatValueFromInputElement(distortionCoefficients, 0),
            getFloatValueFromInputElement(distortionCoefficients, 1),
        ]
    }

    set distortionCoefficients(numbers: number[]) {
        setArrayElement("input[name='distortionCoefficients[]']", numbers, 2, 5)
    }

    set vendor(value: string) { setValueToInputTextElement('vendor', value) }
    
    get vendor() { return getValueFromInputTextElement("vendor") }

    set model(value: string) { setValueToInputTextElement('model', value) }
    
    get model() { return getValueFromInputTextElement("model") }

    set screenToLensDistance(value: number) {
        setValueToInputTextElement('screenToLensDistance', Number(meter2Millimeter(value)).toFixed(1));
    }
    
    get screenToLensDistance() {
        return millimeter2Meter(parseFloat(getValueFromInputTextElement("screenToLensDistance")));
    }

    set interLensDistance(value: number) {
        setValueToInputTextElement('interLensDistance', Number(meter2Millimeter(value)).toFixed(1));
    }
    
    get interLensDistance() {
        return millimeter2Meter(Number(getValueFromInputTextElement("interLensDistance")));
    }

    set trayToLensDistance(value: number) {
        setValueToInputTextElement('trayToLensDistance', Number(meter2Millimeter(value)).toFixed(1));
    }
    
    get trayToLensDistance() {
        return millimeter2Meter(parseFloat(getValueFromInputTextElement("trayToLensDistance")));
    }

    set hasMagnet(value: boolean) {
        let elem = document.querySelector(`input[name="hasMagnet"]`) as HTMLInputElement;
        elem.checked = value;
    }
    
    get hasMagnet() {
        let elem = document.querySelector(`input[name="hasMagnet"]`) as HTMLInputElement;
        return elem.checked;
    }

    set verticalAlignment(value: number) {
        let elem = document.querySelector(`select[name="verticalAlignment"]`) as HTMLSelectElement;
        elem.selectedIndex = value;
    }
    
    get verticalAlignment() {
        let elem = document.querySelector(`select[name="verticalAlignment"]`) as HTMLSelectElement;
        let selectionElem = elem.options[elem.selectedIndex];
        return parseInt(selectionElem.value);
    }

    set primaryButton(value: number) {
        let elem = document.querySelector(`select[name="primaryButton"]`) as HTMLSelectElement;
        elem.selectedIndex = value;
    }
    
    get primaryButton() {
        let elem = document.querySelector(`select[name="primaryButton"]`) as HTMLSelectElement;
        let selectionElem = elem.options[elem.selectedIndex];
        return parseInt(selectionElem.value);
    }
}

function restore(deviceparam: CardboardDevice.DeviceParams): void {
    let mmv = new DeviceParamsViewModel();
    mmv.vendor = deviceparam.vendor;
    mmv.model = deviceparam.model;
    mmv.screenToLensDistance = deviceparam.screenToLensDistance;
    mmv.interLensDistance = deviceparam.interLensDistance;
    mmv.leftEyeFieldOfViewAngles = deviceparam.leftEyeFieldOfViewAngles;
    mmv.trayToLensDistance = deviceparam.trayToLensDistance;
    mmv.distortionCoefficients = deviceparam.distortionCoefficients;
    mmv.hasMagnet = deviceparam.hasMagnet;
    mmv.verticalAlignment = deviceparam.verticalAlignment;
    mmv.primaryButton = deviceparam.primaryButton;
}

function update(_event: Event |  null, ctx: Context) {
    let mmv = new DeviceParamsViewModel();
    ctx.deviceparam.vendor = mmv.vendor;
    ctx.deviceparam.model = mmv.model;
    ctx.deviceparam.screenToLensDistance = mmv.screenToLensDistance;
    ctx.deviceparam.interLensDistance = mmv.interLensDistance;
    ctx.deviceparam.leftEyeFieldOfViewAngles = mmv.leftEyeFieldOfViewAngles;
    ctx.deviceparam.trayToLensDistance = mmv.trayToLensDistance;
    ctx.deviceparam.distortionCoefficients = mmv.distortionCoefficients;
    ctx.deviceparam.hasMagnet = mmv.hasMagnet;
    ctx.deviceparam.verticalAlignment = mmv.verticalAlignment;
    ctx.deviceparam.primaryButton = mmv.primaryButton;
    
    let data = CardboardDevice.DeviceParams.encode(ctx.deviceparam).finish();
    let p = Cardboard.encode(data)
    let qr = Cardboard.encode_uri(CardboardDevice.DeviceParams.encode(ctx.deviceparam).finish());
    
    // static notify observer(URI)
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('p', p);
    history.replaceState(null, '', "?"+urlParams.toString());
    
    // static notify observer(canvas)
    var canvas = document.getElementById('canvas') as HTMLCanvasElement;
    QRCode.toCanvas(canvas, qr, { errorCorrectionLevel: 'M', scale: 8 }, function (error: any) {
        if (error) console.error(error);
        var downloadLink = document.getElementById('png-download-link') as PNGDownloadLink;
        downloadLink?.setCanvasDownloadData(canvas, `${ctx.deviceparam.vendor} ${ctx.deviceparam.model}`);
    });
}

function navbarBurgerMenu() {
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  $navbarBurgers.forEach( (el: HTMLBaseElement) => {
    el.addEventListener('click', () => {
      const target = el.dataset.target as string;
      const $target = document.getElementById(target) as HTMLAnchorElement;
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');
    });
  });
}

document.addEventListener("DOMContentLoaded", (_event) => {
    let ctx = new Context();
    ctx.deviceparam = load();
    restore(ctx.deviceparam);
    update(null, ctx);
    
    let viewModelLinks = [
        "input[name='vendor']",
        "input[name='model']",
        "input[name='screenToLensDistance']",
        "input[name='interLensDistance']",
        "input[name='leftEyeFieldOfViewAngles[]']",
        "input[name='trayToLensDistance']",
        "input[name='distortionCoefficients[]']",
        "input[name='hasMagnet']",
        "select[name='verticalAlignment']",
        "select[name='primaryButton']",
    ];
    
    for(let name of viewModelLinks) {
        let inputs = document.querySelectorAll(name);
        for(let input of inputs) {
            input?.addEventListener('change', (event) => update(event, ctx));
            input?.addEventListener('input', (event) => update(event, ctx));
        }
    }
    
    navbarBurgerMenu();
});
