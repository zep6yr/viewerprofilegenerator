export default class PNGDownloadLink extends HTMLElement {
  private link: HTMLAnchorElement | null = null;
  private blobURL: string | null = null;
  private resolveLink: CallableFunction | null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    document.addEventListener('beforeunload', (_event) => this.deleteBlob());
    
    let slot = this.shadowRoot?.querySelector('slot') as HTMLSlotElement;
    slot.addEventListener('slotchange', () => this.slotted());
  }
  
  slotted() {
    let slot = this.shadowRoot?.querySelector('slot') as HTMLSlotElement;
    this.link = slot.assignedNodes()[0] as HTMLAnchorElement;
    if(this.resolveLink) this.resolveLink(this.link);
    this.resolveLink = null;
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <!--
      <style>
        a::part(a) {
          color: inherit;
          text-decoration: inherit;
        }
      </style>
      <a id="link"></a>
      -->
      <slot></slot>
    `;
  }
  
  deleteBlob() {
    if(this.blobURL) URL.revokeObjectURL(this.blobURL);
  }
  
  getLink() {
    return new Promise((resolve, _reject) => {
      if(this.link) {
        resolve(this.link);
      } else {
        this.resolveLink = resolve;
      }
    });
  }
  
  public setCanvasDownloadData(canvas: HTMLCanvasElement, name: string) {
    this.getLink().then((_link) => {
      const link = _link as HTMLAnchorElement;
      link.setAttribute('download', name + '.png');
      canvas.toBlob((blob) => {
        this.deleteBlob();
        this.blobURL = URL.createObjectURL(blob as Blob);
        link.setAttribute('href', this.blobURL);
        link.textContent = 'Download ' + name + '.png';
      });
    });
  }
}
