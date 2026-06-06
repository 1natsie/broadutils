type Constructor<T = object> = new (...args: any[]) => T;

const toBase64 = (bytes: Uint8Array): string => {
  if (typeof btoa === "function") {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  return Buffer.from(bytes).toString("base64");
};

export const installFileReaderMock = () => {
  class MockFileReader {
    error: Error | null = null;
    result: string | ArrayBuffer | null = null;
    onerror: (() => void) | null = null;
    onloadend: (() => void) | null = null;

    readAsDataURL(blob: Blob) {
      void blob
        .arrayBuffer()
        .then((buffer) => {
          const bytes = new Uint8Array(buffer);
          const mimeType = blob.type || "application/octet-stream";
          this.result = `data:${mimeType};base64,${toBase64(bytes)}`;
          this.onloadend?.();
        })
        .catch((error: Error) => {
          this.error = error;
          this.onerror?.();
        });
    }
  }

  Object.defineProperty(globalThis, "FileReader", {
    value: MockFileReader,
    configurable: true,
  });
};

export class MockDOMMatrix {
  constructor(public readonly marker = "matrix") {}
}

export class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  colorSpace: PredefinedColorSpace;

  constructor(data: Uint8ClampedArray, width: number, height: number, options?: ImageDataSettings) {
    this.data = data;
    this.width = width;
    this.height = height;
    this.colorSpace = options?.colorSpace ?? "srgb";
  }
}

export class MockCanvasRenderingContext2D {
  canvas: MockCanvas;
  direction: CanvasDirection = "inherit";
  fillStyle: string | CanvasGradient | CanvasPattern = "#000000";
  filter = "none";
  font = "10px sans-serif";
  fontKerning: CanvasFontKerning = "auto";
  fontStretch: CanvasFontStretch = "normal";
  fontVariantCaps: CanvasFontVariantCaps = "normal";
  globalAlpha = 1;
  globalCompositeOperation: GlobalCompositeOperation = "source-over";
  imageSmoothingEnabled = true;
  imageSmoothingQuality: ImageSmoothingQuality = "low";
  letterSpacing = "0px";
  lineCap: CanvasLineCap = "butt";
  lineDashOffset = 0;
  lineJoin: CanvasLineJoin = "miter";
  lineWidth = 1;
  miterLimit = 10;
  shadowBlur = 0;
  shadowColor = "rgba(0, 0, 0, 0)";
  shadowOffsetX = 0;
  shadowOffsetY = 0;
  strokeStyle: string | CanvasGradient | CanvasPattern = "#000000";
  textAlign: CanvasTextAlign = "start";
  textBaseline: CanvasTextBaseline = "alphabetic";
  textRendering: CanvasTextRendering = "auto";
  wordSpacing = "0px";
  drawnImage: unknown = null;
  placedImageData: ImageData | null = null;
  private transform = new MockDOMMatrix();

  constructor(canvas: MockCanvas) {
    this.canvas = canvas;
  }

  getTransform() {
    return this.transform;
  }

  setTransform(transform: DOMMatrix) {
    this.transform = transform as unknown as MockDOMMatrix;
  }

  putImageData(imageData: ImageData) {
    this.placedImageData = imageData;
  }

  drawImage(image: CanvasImageSource) {
    this.drawnImage = image;
  }

  getImageData(_x: number, _y: number, width: number, height: number) {
    return new MockImageData(new Uint8ClampedArray(width * height * 4), width, height);
  }
}

export class MockCanvas {
  width: number;
  height: number;
  readonly context: MockCanvasRenderingContext2D;

  constructor(width = 300, height = 150) {
    this.width = width;
    this.height = height;
    this.context = new MockCanvasRenderingContext2D(this);
  }

  getContext() {
    return this.context;
  }

  async convertToBlob(options?: { type?: string }) {
    return new Blob([new Uint8Array([1, 2, 3])], {
      type: options?.type ?? "application/octet-stream",
    });
  }
}

export class MockVideoFrame {
  constructor(
    public readonly displayWidth: number,
    public readonly displayHeight: number,
  ) {}
}

class MockSVGAnimatedLength {
  baseVal: {
    unitType: number;
    valueInSpecifiedUnits: number;
    convertToSpecifiedUnits: (unit: number) => void;
  };

  constructor(value: number) {
    this.baseVal = {
      unitType: 1,
      valueInSpecifiedUnits: value,
      convertToSpecifiedUnits: (unit: number) => {
        this.baseVal.unitType = unit;
      },
    };
  }
}

export class MockSVGImageElement {
  width: MockSVGAnimatedLength;
  height: MockSVGAnimatedLength;

  constructor(width: number, height: number) {
    this.width = new MockSVGAnimatedLength(width);
    this.height = new MockSVGAnimatedLength(height);
  }
}

export class MockImageElement {
  src = "";
  width = 16;
  height = 8;

  async decode() {
    return undefined;
  }
}

class MockMediaElement {
  onloadedmetadata: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private _src = "";

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    queueMicrotask(() => this.onloadedmetadata?.());
  }
}

export class MockAudioElement extends MockMediaElement {
  constructor(src = "") {
    super();
    this.src = src;
  }
}

export class MockVideoElement extends MockMediaElement {}

export const installCanvasMocks = () => {
  installFileReaderMock();

  const define = (name: string, value: Constructor | object) => {
    Object.defineProperty(globalThis, name, {
      value,
      configurable: true,
    });
  };

  define("DOMMatrix", MockDOMMatrix);
  define("ImageData", MockImageData);
  define("HTMLCanvasElement", MockCanvas);
  define("CanvasRenderingContext2D", MockCanvasRenderingContext2D);
  define("OffscreenCanvas", MockCanvas);
  define("VideoFrame", MockVideoFrame);
  define("SVGImageElement", MockSVGImageElement);
  define("SVGLength", { SVG_LENGTHTYPE_PX: 5 });
  define("Audio", MockAudioElement);
  define("HTMLImageElement", MockImageElement);
  define("HTMLVideoElement", MockVideoElement);
  define("document", {
    createElement: (tagName: string) => {
      if (tagName === "img") return new MockImageElement();
      if (tagName === "video") return new MockVideoElement();
      if (tagName === "canvas") return new MockCanvas();
      throw new Error(`Unsupported element: ${tagName}`);
    },
  });
};
