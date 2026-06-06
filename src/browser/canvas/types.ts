/** A type that represents various sources for images that can be used by the canvas utilities. */
export type ExtendedImageSource =
  | string
  | ArrayBuffer
  | ArrayBufferView<ArrayBuffer>
  | Blob
  | ImageData
  | CanvasImageSource;

/** A type that represents the rendering context for a canvas. */
export type RenderingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** An interface representing a snapshot of a rendering context's state. */
export interface ContextSnapshot {
  direction: CanvasRenderingContext2D["direction"];
  fillStyle: CanvasRenderingContext2D["fillStyle"];
  filter: CanvasRenderingContext2D["filter"];
  font: CanvasRenderingContext2D["font"];
  fontKerning: CanvasRenderingContext2D["fontKerning"];
  fontStretch: CanvasRenderingContext2D["fontStretch"];
  fontVariantCaps: CanvasRenderingContext2D["fontVariantCaps"];
  globalAlpha: CanvasRenderingContext2D["globalAlpha"];
  globalCompositeOperation: CanvasRenderingContext2D["globalCompositeOperation"];
  imageSmoothingEnabled: CanvasRenderingContext2D["imageSmoothingEnabled"];
  imageSmoothingQuality: CanvasRenderingContext2D["imageSmoothingQuality"];
  letterSpacing: CanvasRenderingContext2D["letterSpacing"];
  lineCap: CanvasRenderingContext2D["lineCap"];
  lineDashOffset: CanvasRenderingContext2D["lineDashOffset"];
  lineJoin: CanvasRenderingContext2D["lineJoin"];
  lineWidth: CanvasRenderingContext2D["lineWidth"];
  miterLimit: CanvasRenderingContext2D["miterLimit"];
  shadowBlur: CanvasRenderingContext2D["shadowBlur"];
  shadowColor: CanvasRenderingContext2D["shadowColor"];
  shadowOffsetX: CanvasRenderingContext2D["shadowOffsetX"];
  shadowOffsetY: CanvasRenderingContext2D["shadowOffsetY"];
  strokeStyle: CanvasRenderingContext2D["strokeStyle"];
  textAlign: CanvasRenderingContext2D["textAlign"];
  textBaseline: CanvasRenderingContext2D["textBaseline"];
  textRendering: CanvasRenderingContext2D["textRendering"];
  wordSpacing: CanvasRenderingContext2D["wordSpacing"];

  transform: DOMMatrix;
}
