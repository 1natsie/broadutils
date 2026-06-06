import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  installCanvasMocks,
  MockCanvas,
  MockCanvasRenderingContext2D,
  MockDOMMatrix,
  MockImageData,
  MockImageElement,
  MockSVGImageElement,
  MockVideoFrame,
} from "./browser-apis.ts";

let canvasUtils: typeof import("../../src/browser/canvas/canvas.ts");

describe("browser/canvas", () => {
  beforeAll(async () => {
    installCanvasMocks();
    canvasUtils = await import("../../src/browser/canvas/canvas.ts");
  });

  beforeEach(() => {
    installCanvasMocks();
  });

  describe("resize", () => {
    it("resizes canvas elements and rendering contexts", () => {
      const canvas = new MockCanvas();
      expect(canvasUtils.resize(canvas as any, [20, 10])).to.equal(canvas);
      expect([canvas.width, canvas.height]).to.deep.equal([20, 10]);

      const context = canvas.getContext();
      expect(canvasUtils.resize(context as any, { height: 30 })).to.equal(context);
      expect([canvas.width, canvas.height]).to.deep.equal([20, 30]);
    });
  });

  describe("createContextSnapshot and applyContextSnapshot", () => {
    it("captures and applies context state", () => {
      const context = new MockCanvas().getContext();
      context.fillStyle = "red";
      context.lineWidth = 5;
      const transform = new MockDOMMatrix("captured");
      context.setTransform(transform as any);

      const snapshot = canvasUtils.createContextSnapshot(context as any);
      expect(snapshot.fillStyle).to.equal("red");
      expect(snapshot.lineWidth).to.equal(5);
      expect(snapshot.transform).to.equal(transform);

      const target = new MockCanvas().getContext();
      expect(canvasUtils.applyContextSnapshot(target as any, snapshot)).to.equal(target);
      expect(target.fillStyle).to.equal("red");
      expect(target.lineWidth).to.equal(5);
      expect(target.getTransform()).to.equal(transform);
    });
  });

  describe("cloneImageData", () => {
    it("copies pixels and metadata into a new ImageData", () => {
      const source = new MockImageData(new Uint8ClampedArray([1, 2, 3, 4]), 1, 1, {
        colorSpace: "srgb",
      });
      const result = canvasUtils.cloneImageData(source as any);

      expect(result).to.not.equal(source);
      expect([...result.data]).to.deep.equal([1, 2, 3, 4]);
      expect(result.data).to.not.equal(source.data);
      expect(result.width).to.equal(1);
      expect(result.height).to.equal(1);
      expect(result.colorSpace).to.equal("srgb");
    });
  });

  describe("getDimensions", () => {
    it("reads dimensions from image data, canvas sources, video frames, and SVG images", () => {
      expect(
        canvasUtils.getDimensions(new MockImageData(new Uint8ClampedArray(16), 2, 2) as any),
      ).to.deep.equal([2, 2]);
      expect(canvasUtils.getDimensions(new MockCanvas(8, 4) as any)).to.deep.equal([8, 4]);
      expect(canvasUtils.getDimensions(new MockVideoFrame(12, 6) as any)).to.deep.equal([12, 6]);
      expect(canvasUtils.getDimensions(new MockSVGImageElement(5, 7) as any)).to.deep.equal([5, 7]);
    });
  });

  describe("mirrorImageToCanvas", () => {
    it("mirrors ImageData into a context and restores smoothing state", () => {
      const context = new MockCanvasRenderingContext2D(new MockCanvas());
      context.imageSmoothingEnabled = true;
      const imageData = new MockImageData(new Uint8ClampedArray(16), 2, 2);

      expect(canvasUtils.mirrorImageToCanvas(context as any, imageData as any)).to.equal(context);
      expect([context.canvas.width, context.canvas.height]).to.deep.equal([2, 2]);
      expect(context.placedImageData).to.equal(imageData);
      expect(context.imageSmoothingEnabled).to.equal(true);
    });

    it("draws CanvasImageSource values into a context", () => {
      const context = new MockCanvasRenderingContext2D(new MockCanvas());
      const image = new MockImageElement();
      image.width = 3;
      image.height = 4;

      canvasUtils.mirrorImageToCanvas(context as any, image as any);
      expect([context.canvas.width, context.canvas.height]).to.deep.equal([3, 4]);
      expect(context.drawnImage).to.equal(image);
    });
  });

  describe("getImage", () => {
    it("loads strings through the network image helper", async () => {
      expect(await canvasUtils.getImage("image.png")).to.be.instanceOf(MockImageElement);
    });

    it("converts binary and image data sources into image elements", async () => {
      const fromBytes = await canvasUtils.getImage(new Uint8Array([1, 2, 3]));
      expect(fromBytes).to.be.instanceOf(MockImageElement);
      expect(fromBytes.src).to.contain("data:application/octet-stream;base64,");

      const fromImageData = await canvasUtils.getImage(
        new MockImageData(new Uint8ClampedArray(16), 2, 2) as any,
      );
      expect(fromImageData).to.be.instanceOf(MockImageElement);
      expect(fromImageData.src).to.contain("data:image/webp;base64,");
    });
  });

  describe("getImageData", () => {
    it("clones ImageData sources", async () => {
      const source = new MockImageData(new Uint8ClampedArray([1, 2, 3, 4]), 1, 1);
      const result = await canvasUtils.getImageData(source as any);

      expect(result).to.not.equal(source);
      expect([...result.data]).to.deep.equal([1, 2, 3, 4]);
    });

    it("extracts image data from string and canvas sources", async () => {
      expect(await canvasUtils.getImageData("image.png")).to.be.instanceOf(MockImageData);
      expect(await canvasUtils.getImageData(new MockCanvas(2, 3) as any)).to.deep.include({
        width: 2,
        height: 3,
      });
    });
  });
});
