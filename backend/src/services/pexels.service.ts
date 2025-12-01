import { config } from "../config/env";

export interface PexelsImage {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  image: string;
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }>;
  video_pictures: Array<{
    id: number;
    picture: string;
    nr: number;
  }>;
}

export interface PexelsResponse {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  photos?: PexelsImage[];
  videos?: PexelsVideo[];
}

export class PexelsService {
  private apiKey: string;

  constructor() {
    this.apiKey = config.pexelsApiKey || "";
    if (!this.apiKey) {
      console.warn("⚠️ Pexels API key not configured");
    }
  }

  async searchImages(
    query: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<PexelsResponse> {
    if (!this.apiKey) {
      throw new Error("Pexels API key is not configured");
    }

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        query
      )}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: this.apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as any;
      throw new Error(
        errorData.error ||
          `Failed to fetch images from Pexels: ${response.statusText}`
      );
    }

    return response.json() as Promise<PexelsResponse>;
  }

  async searchVideos(
    query: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<PexelsResponse> {
    if (!this.apiKey) {
      throw new Error("Pexels API key is not configured");
    }

    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(
        query
      )}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: this.apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as any;
      throw new Error(
        errorData.error ||
          `Failed to fetch videos from Pexels: ${response.statusText}`
      );
    }

    return response.json() as Promise<PexelsResponse>;
  }
}
