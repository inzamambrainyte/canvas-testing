import { config } from "../config/env";

export interface FreesoundAudio {
  id: number;
  name: string;
  username: string;
  duration: number;
  previews: {
    "preview-hq-mp3": string;
    "preview-hq-ogg": string;
    "preview-lq-mp3": string;
    "preview-lq-ogg": string;
  };
  images: {
    waveform_m: string;
    waveform_l: string;
    spectral_m: string;
    spectral_l: string;
  };
}

export interface FreesoundResponse {
  count: number;
  next?: string;
  previous?: string;
  results: FreesoundAudio[];
}

export class FreesoundService {
  private apiKey: string;

  constructor() {
    this.apiKey = config.freesoundApiKey || "";
    if (!this.apiKey) {
      console.warn("⚠️ Freesound API key not configured");
    }
  }

  async searchAudio(
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<FreesoundResponse> {
    if (!this.apiKey) {
      throw new Error("Freesound API key is not configured");
    }

    const response = await fetch(
      `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(
        query
      )}&page=${page}&page_size=${pageSize}&fields=id,name,username,duration,previews,images`,
      {
        headers: {
          Authorization: `Token ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as any;
      throw new Error(
        errorData.detail ||
          errorData.error ||
          `Failed to fetch audio from Freesound: ${response.statusText}`
      );
    }

    return response.json() as Promise<FreesoundResponse>;
  }
}
