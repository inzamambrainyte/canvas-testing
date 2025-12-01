const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: response.statusText,
      }));
      throw new Error(error.error || `API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // Projects
  async getProjects() {
    return this.request("/projects");
  }

  async createProject(data: { title?: string; aspectRatio?: string; zoom?: number }) {
    return this.request("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`);
  }

  async updateProject(id: string, data: Partial<{ title: string; aspectRatio: string; zoom: number }>) {
    return this.request(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: "DELETE",
    });
  }

  // Scenes
  async getScenes(projectId: string) {
    return this.request(`/projects/${projectId}/scenes`);
  }

  async createScene(projectId: string, data: any) {
    return this.request(`/projects/${projectId}/scenes`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getScene(id: string) {
    return this.request(`/scenes/${id}`);
  }

  async updateScene(id: string, data: any) {
    return this.request(`/scenes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteScene(id: string) {
    return this.request(`/scenes/${id}`, {
      method: "DELETE",
    });
  }

  async duplicateScene(id: string) {
    return this.request(`/scenes/${id}/duplicate`, {
      method: "POST",
    });
  }

  // Elements
  async getElements(sceneId: string) {
    return this.request(`/scenes/${sceneId}/elements`);
  }

  async createElement(sceneId: string, data: any) {
    return this.request(`/scenes/${sceneId}/elements`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getElement(id: string) {
    return this.request(`/elements/${id}`);
  }

  async updateElement(id: string, data: any) {
    return this.request(`/elements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteElement(id: string) {
    return this.request(`/elements/${id}`, {
      method: "DELETE",
    });
  }

  async reorderElements(elementIds: string[]) {
    return this.request("/elements/reorder", {
      method: "PUT",
      body: JSON.stringify({ elementIds }),
    });
  }

  // Media
  async getImages(query: string, page: number = 1, perPage: number = 20) {
    return this.request(
      `/media/images?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
    );
  }

  async getVideos(query: string, page: number = 1, perPage: number = 20) {
    return this.request(
      `/media/videos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
    );
  }

  async getAudio(query: string, page: number = 1, pageSize: number = 20) {
    return this.request(
      `/media/audio?query=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
    );
  }

  // TTS
  async generateTTS(data: {
    text: string;
    provider: "openai" | "elevenlabs";
    voice?: string;
    model?: string;
    voice_id?: string;
    model_id?: string;
  }) {
    return this.request("/tts/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // AI
  async generateScript(prompt: string, aspectRatio: "16:9" | "9:16" | "1:1") {
    return this.request("/ai/generate-script", {
      method: "POST",
      body: JSON.stringify({ prompt, aspectRatio }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

