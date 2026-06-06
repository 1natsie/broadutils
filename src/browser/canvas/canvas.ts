import type { Vector2 } from "../types/types.ts";
import type { ContextSnapshot, ExtendedImageSource, RenderingContext } from "./types.ts";

import { base64, convertToDataUrl } from "../data/data.ts";
import { fetch } from "../network/network.ts";
import { nonNullable } from "../validate/validate.ts";

const sharedCanvas = new OffscreenCanvas(1, 1);
const sharedContext = nonNullable(sharedCanvas.getContext("2d", { willReadFrequently: true }));

/**
 * Resizes a canvas element, offscreen canvas, or rendering context to the specified dimensions.
 *
 * @param target The canvas element or rendering context to resize.
 * @param dimensions The new dimensions for the canvas.
 * @returns The resized canvas element or rendering context.
 */
export const resize = <
  T extends
    | HTMLCanvasElement
    | OffscreenCanvas
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D,
>(
  target: T,
  dimensions: Vector2 | Partial<Record<"width" | "height", number>>,
): T => {
  let canvas: HTMLCanvasElement | OffscreenCanvas;

  if (target instanceof HTMLCanvasElement) canvas = target;
  else if (target instanceof OffscreenCanvas) canvas = target;
  else canvas = target.canvas;

  if (Array.isArray(dimensions)) ((canvas.width = dimensions[0]), (canvas.height = dimensions[1]));
  else {
    canvas.width = dimensions.width ?? canvas.width;
    canvas.height = dimensions.height ?? canvas.height;
  }

  return target;
};

/**
 * Creates a snapshot of the canvas rendering context's state.
 *
 * @param context The canvas rendering context to create a snapshot of.
 * @returns A snapshot of the canvas rendering context's state, including its properties and
 * transformation matrix.
 */
export const createContextSnapshot = (context: CanvasRenderingContext2D): ContextSnapshot => {
  return {
    direction: context.direction,
    fillStyle: context.fillStyle,
    filter: context.filter,
    font: context.font,
    fontKerning: context.fontKerning,
    fontStretch: context.fontStretch,
    fontVariantCaps: context.fontVariantCaps,
    globalAlpha: context.globalAlpha,
    globalCompositeOperation: context.globalCompositeOperation,
    imageSmoothingEnabled: context.imageSmoothingEnabled,
    imageSmoothingQuality: context.imageSmoothingQuality,
    letterSpacing: context.letterSpacing,
    lineCap: context.lineCap,
    lineDashOffset: context.lineDashOffset,
    lineJoin: context.lineJoin,
    lineWidth: context.lineWidth,
    miterLimit: context.miterLimit,
    shadowBlur: context.shadowBlur,
    shadowColor: context.shadowColor,
    shadowOffsetX: context.shadowOffsetX,
    shadowOffsetY: context.shadowOffsetY,
    strokeStyle: context.strokeStyle,
    textAlign: context.textAlign,
    textBaseline: context.textBaseline,
    textRendering: context.textRendering,
    wordSpacing: context.wordSpacing,

    transform: context.getTransform(),
  };
};

/**
 * Applies a snapshot of the canvas rendering context's state to the context.
 *
 * @param context The canvas rendering context to apply the snapshot to.
 * @param snapshot The snapshot of the canvas rendering context's state.
 * @returns The updated canvas rendering context.
 */
export const applyContextSnapshot = (
  context: CanvasRenderingContext2D,
  snapshot: Partial<ContextSnapshot>,
): CanvasRenderingContext2D => {
  context.direction = snapshot.direction ?? context.direction;
  context.fillStyle = snapshot.fillStyle ?? context.fillStyle;
  context.filter = snapshot.filter ?? context.filter;
  context.font = snapshot.font ?? context.font;
  context.fontKerning = snapshot.fontKerning ?? context.fontKerning;
  context.fontStretch = snapshot.fontStretch ?? context.fontStretch;
  context.fontVariantCaps = snapshot.fontVariantCaps ?? context.fontVariantCaps;
  context.globalAlpha = snapshot.globalAlpha ?? context.globalAlpha;
  context.globalCompositeOperation =
    snapshot.globalCompositeOperation ?? context.globalCompositeOperation;
  context.imageSmoothingEnabled = snapshot.imageSmoothingEnabled ?? context.imageSmoothingEnabled;
  context.imageSmoothingQuality = snapshot.imageSmoothingQuality ?? context.imageSmoothingQuality;
  context.letterSpacing = snapshot.letterSpacing ?? context.letterSpacing;
  context.lineCap = snapshot.lineCap ?? context.lineCap;
  context.lineDashOffset = snapshot.lineDashOffset ?? context.lineDashOffset;
  context.lineJoin = snapshot.lineJoin ?? context.lineJoin;
  context.lineWidth = snapshot.lineWidth ?? context.lineWidth;
  context.miterLimit = snapshot.miterLimit ?? context.miterLimit;
  context.shadowBlur = snapshot.shadowBlur ?? context.shadowBlur;
  context.shadowColor = snapshot.shadowColor ?? context.shadowColor;
  context.shadowOffsetX = snapshot.shadowOffsetX ?? context.shadowOffsetX;
  context.shadowOffsetY = snapshot.shadowOffsetY ?? context.shadowOffsetY;
  context.strokeStyle = snapshot.strokeStyle ?? context.strokeStyle;
  context.textAlign = snapshot.textAlign ?? context.textAlign;
  context.textBaseline = snapshot.textBaseline ?? context.textBaseline;
  context.textRendering = snapshot.textRendering ?? context.textRendering;
  context.wordSpacing = snapshot.wordSpacing ?? context.wordSpacing;
  snapshot.transform && context.setTransform(snapshot.transform);

  return context;
};

/**
 * Creates a clone of the given ImageData object.
 *
 * @param imageData The ImageData object to clone.
 * @returns A new ImageData object with the same data and dimensions.
 */
export const cloneImageData = (imageData: ImageData): ImageData => {
  return new ImageData(imageData.data.slice(), imageData.width, imageData.height, {
    colorSpace: imageData.colorSpace,
  });
};

/**
 * Gets the dimensions of the given image source.
 *
 * @param source The image source to get the dimensions of.
 * @returns The dimensions of the image source as a Vector2 [width, height].
 */
export const getDimensions = (source: ImageData | CanvasImageSource): Vector2 => {
  if (source instanceof VideoFrame) return [source.displayWidth, source.displayHeight];
  if (!(source instanceof SVGImageElement)) return [source.width, source.height];

  const widthUnit = source.width.baseVal.unitType;
  const heightUnit = source.height.baseVal.unitType;

  source.width.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
  source.height.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);

  const dimensions: Vector2 = [
    source.width.baseVal.valueInSpecifiedUnits,
    source.height.baseVal.valueInSpecifiedUnits,
  ];

  source.width.baseVal.convertToSpecifiedUnits(widthUnit);
  source.height.baseVal.convertToSpecifiedUnits(heightUnit);

  return dimensions;
};

/**
 * Mirrors an image to a canvas.
 *
 * @param context The rendering context to use.
 * @param image The image to mirror.
 * @returns The rendering context.
 */
export const mirrorImageToCanvas = <T extends RenderingContext>(
  context: T,
  image: ImageData | CanvasImageSource,
): T => {
  const canvas = context.canvas;
  const imageSmoothingEnabled = context.imageSmoothingEnabled;

  context.imageSmoothingEnabled = false;
  resize(canvas, getDimensions(image));
  if (image instanceof ImageData) context.putImageData(image, 0, 0);
  else context.drawImage(image, 0, 0);

  context.imageSmoothingEnabled = imageSmoothingEnabled;
  return context;
};

/**
 * Converts an image source to an HTMLImageElement.
 *
 * @param source The image source to convert to an HTMLImageElement. Can be a URL string, an
 * ArrayBuffer, a Blob, an ImageData object, or any CanvasImageSource.
 * @returns A Promise that resolves to an HTMLImageElement representing the image source.
 */
export const getImage = async (source: ExtendedImageSource): Promise<HTMLImageElement> => {
  if (typeof source === "string") return fetch.image(source);
  if (source instanceof ArrayBuffer || ArrayBuffer.isView(source) || source instanceof Blob) {
    const blob = new Blob([source]);
    const bytes = await blob.bytes();
    const image = document.createElement("img");
    image.src = `data:application/octet-stream;base64,${base64.encode(bytes)}`;
    await image.decode();
    return image;
  }

  mirrorImageToCanvas(sharedContext, source);
  const image = document.createElement("img");
  const blob = await sharedCanvas.convertToBlob({ type: "image/webp", quality: 1 });
  const dataUrl = await convertToDataUrl(blob);

  image.src = dataUrl;
  await image.decode();

  return image;
};

/**
 * Converts an image source to ImageData.
 *
 * @param source The image source to convert to ImageData. Can be a URL string, an ArrayBuffer,
 * a Blob, an ImageData object, or any CanvasImageSource.
 * @returns A Promise that resolves to an ImageData object representing the image source.
 */
export const getImageData = async (source: ExtendedImageSource): Promise<ImageData> => {
  let imageSource: CanvasImageSource;

  if (typeof source === "string") imageSource = await fetch.image(source);
  else if (source instanceof ImageData) return cloneImageData(source);
  else if (source instanceof ArrayBuffer || ArrayBuffer.isView(source) || source instanceof Blob) {
    imageSource = await getImage(source);
  } else imageSource = source;

  mirrorImageToCanvas(sharedContext, imageSource);
  return sharedContext.getImageData(0, 0, sharedCanvas.width, sharedCanvas.height);
};

export * from "./types.ts";
