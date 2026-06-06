import type { Vector2 } from "../types/types.ts";
import type { ContextSnapshot, ExtendedImageSource, RenderingContext } from "./types.ts";
/**
 * Resizes a canvas element, offscreen canvas, or rendering context to the specified dimensions.
 *
 * @param target The canvas element or rendering context to resize.
 * @param dimensions The new dimensions for the canvas.
 * @returns The resized canvas element or rendering context.
 */
export declare const resize: <T extends HTMLCanvasElement | OffscreenCanvas | CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D>(target: T, dimensions: Vector2 | Partial<Record<"width" | "height", number>>) => T;
/**
 * Creates a snapshot of the canvas rendering context's state.
 *
 * @param context The canvas rendering context to create a snapshot of.
 * @returns A snapshot of the canvas rendering context's state, including its properties and
 * transformation matrix.
 */
export declare const createContextSnapshot: (context: CanvasRenderingContext2D) => ContextSnapshot;
/**
 * Applies a snapshot of the canvas rendering context's state to the context.
 *
 * @param context The canvas rendering context to apply the snapshot to.
 * @param snapshot The snapshot of the canvas rendering context's state.
 * @returns The updated canvas rendering context.
 */
export declare const applyContextSnapshot: (context: CanvasRenderingContext2D, snapshot: Partial<ContextSnapshot>) => CanvasRenderingContext2D;
/**
 * Creates a clone of the given ImageData object.
 *
 * @param imageData The ImageData object to clone.
 * @returns A new ImageData object with the same data and dimensions.
 */
export declare const cloneImageData: (imageData: ImageData) => ImageData;
/**
 * Gets the dimensions of the given image source.
 *
 * @param source The image source to get the dimensions of.
 * @returns The dimensions of the image source as a Vector2 [width, height].
 */
export declare const getDimensions: (source: ImageData | CanvasImageSource) => Vector2;
/**
 * Mirrors an image to a canvas.
 *
 * @param context The rendering context to use.
 * @param image The image to mirror.
 * @returns The rendering context.
 */
export declare const mirrorImageToCanvas: <T extends RenderingContext>(context: T, image: ImageData | CanvasImageSource) => T;
/**
 * Converts an image source to an HTMLImageElement.
 *
 * @param source The image source to convert to an HTMLImageElement. Can be a URL string, an
 * ArrayBuffer, a Blob, an ImageData object, or any CanvasImageSource.
 * @returns A Promise that resolves to an HTMLImageElement representing the image source.
 */
export declare const getImage: (source: ExtendedImageSource) => Promise<HTMLImageElement>;
/**
 * Converts an image source to ImageData.
 *
 * @param source The image source to convert to ImageData. Can be a URL string, an ArrayBuffer,
 * a Blob, an ImageData object, or any CanvasImageSource.
 * @returns A Promise that resolves to an ImageData object representing the image source.
 */
export declare const getImageData: (source: ExtendedImageSource) => Promise<ImageData>;
export * from "./types.ts";
//# sourceMappingURL=canvas.d.ts.map