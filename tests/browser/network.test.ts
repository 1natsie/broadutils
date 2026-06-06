import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetch } from "../../src/browser/network/network.ts";
import {
  installCanvasMocks,
  MockAudioElement,
  MockImageElement,
  MockVideoElement,
} from "./browser-apis.ts";

const originalFetch = globalThis.fetch;

const withBytes = (response: Response) =>
  Object.assign(response, {
    bytes: async () => new Uint8Array(await response.arrayBuffer()),
  });

describe("browser/network fetch", () => {
  beforeEach(() => {
    installCanvasMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("delegates the base call to globalThis.fetch", async () => {
    const response = withBytes(new Response("ok"));
    const mock = vi.fn(async () => response);
    globalThis.fetch = mock as any;

    expect(await fetch("/resource")).to.equal(response);
    expect(mock).to.have.property("mock");
    expect(mock.mock.calls[0]).to.deep.equal(["/resource"]);
  });

  it("returns ok responses and rejects non-ok responses", async () => {
    globalThis.fetch = vi.fn(async () => withBytes(new Response("ok", { status: 200 }))) as any;
    expect((await fetch.ok("/ok")).ok).to.equal(true);

    globalThis.fetch = vi.fn(async () => withBytes(new Response("no", { status: 500 }))) as any;
    try {
      await fetch.ok("/no");
      throw new Error("Expected fetch.ok to reject");
    } catch (error) {
      expect((error as Error).message).to.equal("The response was not okay.");
    }
  });

  it("reads array buffers, blobs, bytes, json, streams, text, and headers", async () => {
    globalThis.fetch = vi.fn(async () => withBytes(new Response("Hi", { status: 201 }))) as any;
    expect(new TextDecoder().decode((await fetch.arraybuffer("/arraybuffer"))[1])).to.equal("Hi");

    globalThis.fetch = vi.fn(async () => withBytes(new Response("Hi"))) as any;
    expect(await (await fetch.blob("/blob"))[1].text()).to.equal("Hi");

    globalThis.fetch = vi.fn(async () => withBytes(new Response("Hi"))) as any;
    expect([...(await fetch.bytes("/bytes"))[1]]).to.deep.equal([72, 105]);

    globalThis.fetch = vi.fn(async () =>
      withBytes(
        new Response(JSON.stringify({ ok: true }), {
          headers: { "content-type": "application/json" },
        }),
      ),
    ) as any;
    expect((await fetch.json("/json"))[1]).to.deep.equal({ ok: true });

    globalThis.fetch = vi.fn(async () => withBytes(new Response("Hi"))) as any;
    expect((await fetch.text("/text"))[1]).to.equal("Hi");

    globalThis.fetch = vi.fn(async () => withBytes(new Response("Hi"))) as any;
    expect((await fetch.stream("/stream"))[1]).to.be.an.instanceOf(ReadableStream);

    globalThis.fetch = vi.fn(async () =>
      withBytes(new Response("Hi", { status: 202, statusText: "Accepted", headers: { x: "y" } })),
    ) as any;
    const [response, headers] = await fetch.headers("/headers");
    expect(headers["x"]).to.equal("y");
    expect(response.ok).to.equal(true);
    expect(response.status).to.equal(202);
    expect(response.statusText).to.equal("Accepted");
  });

  it("throws when a stream response has no body", async () => {
    globalThis.fetch = vi.fn(async () => withBytes(new Response(null))) as any;

    try {
      await fetch.stream("/empty");
      throw new Error("Expected fetch.stream to reject");
    } catch (error) {
      expect((error as Error).message).to.equal("No response body.");
    }
  });

  it("creates media elements for audio, image, and video helpers", async () => {
    expect(await fetch.audio("audio.mp3")).to.be.instanceOf(MockAudioElement);
    expect((await fetch.audio(new URL("https://example.com/audio.mp3"))).src).to.equal(
      "https://example.com/audio.mp3",
    );
    expect(await fetch.image("image.png")).to.be.instanceOf(MockImageElement);
    expect(await fetch.video(new Request("https://example.com/video.mp4"))).to.be.instanceOf(
      MockVideoElement,
    );
  });
});
