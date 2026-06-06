import { assert } from "../validate/validate.ts";
import type { ExtendedFetch, FetchParams, LoadMetadata } from "./types.ts";

const loadMetadata: LoadMetadata = (mediaElement) =>
  new Promise((resolve, reject) => {
    const cleanup = (...args: any[]) => {
      mediaElement.onloadedmetadata = mediaElement.onerror = null;
      return null;
    };
    mediaElement.onloadedmetadata = () => cleanup(resolve(mediaElement));
    mediaElement.onerror = () => cleanup(reject(new Error("Failed to load metadata")));
  });

export const fetch: ExtendedFetch = Object.assign(
  (...params: FetchParams) => globalThis.fetch(...params),
  {
    ok: async (...params: FetchParams) => {
      const response = await fetch(...params);
      assert.true(response.ok, "The response was not okay.");
      return response as Response & { ok: true };
    },

    arraybuffer: async (...params: FetchParams) => {
      const response = await fetch(...params);
      return [response, await response.arrayBuffer()] as const;
    },

    blob: async (...params: FetchParams) => {
      const response = await fetch.ok(...params);
      return [response, await response.blob()] as const;
    },

    bytes: async (...params: FetchParams) => {
      const response = await fetch.ok(...params);
      return [response, await response.bytes()] as const;
    },

    headers: async (...params: FetchParams) => {
      const response = await fetch(...params);
      return [response, Object.fromEntries(response.headers.entries())] as const;
    },

    json: async (...params: FetchParams) => {
      const response = await fetch.ok(...params);
      return [response, await response.json()] as const;
    },

    stream: async (...params: FetchParams) => {
      const response = await fetch.ok(...params);
      const body = response.body;

      if (!body) throw new Error("No response body.");
      return [response, body] as const;
    },

    text: async (...params: FetchParams) => {
      const response = await fetch.ok(...params);
      return [response, await response.text()] as const;
    },

    audio: async (...params: FetchParams) => {
      let url: string;
      if (typeof params[0] === "string") url = params[0];
      else if (params[0] instanceof URL) url = params[0].href;
      else url = params[0].url;

      const audio = new Audio(url);
      return loadMetadata(audio);
    },

    image: async (...params: FetchParams) => {
      let url: string;
      if (typeof params[0] === "string") url = params[0];
      else if (params[0] instanceof URL) url = params[0].href;
      else url = params[0].url;

      const image = document.createElement("img");
      image.src = url;

      await image.decode();
      return image;
    },

    video: async (...params: FetchParams) => {
      let url: string;
      if (typeof params[0] === "string") url = params[0];
      else if (params[0] instanceof URL) url = params[0].href;
      else url = params[0].url;

      const video = document.createElement("video");
      video.src = url;
      return loadMetadata(video);
    },
  },
);

export * from "./types.ts";
