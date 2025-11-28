"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import Image from "next/image";
import AssetCard from "./AssetCard";
import { assetLibrary, brandKit } from "@/lib/mockData";
import type { AssetCategory, AssetItem } from "@/lib/types";

const tabConfig: { id: AssetCategory; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "fonts", label: "Fonts" },
  { id: "shapes", label: "Shapes" },
  { id: "images", label: "Images" },
  { id: "videos", label: "Videos" },
  { id: "audio", label: "Audio" },
  { id: "brand", label: "Brand Kit" }
];

type AssetTabsProps = {
  onAssetClick: (item: AssetItem, category: AssetCategory) => void;
};

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
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

interface PexelsVideo {
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

interface PexelsResponse {
  photos?: PexelsPhoto[];
  videos?: PexelsVideo[];
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
}

const AssetTabs = ({ onAssetClick }: AssetTabsProps) => {
  const [activeTab, setActiveTab] = useState<AssetCategory>("text");
  const [searchQuery, setSearchQuery] = useState("");
  const [pexelsImages, setPexelsImages] = useState<AssetItem[]>([]);
  const [pexelsVideos, setPexelsVideos] = useState<AssetItem[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchPexelsImages = useCallback(
    async (query: string, page: number = 1, append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingImages(true);
        setImagesError(null);
      }

      try {
        const perPage = page === 1 ? 10 : 20; // First page: 10, subsequent: 20
        const response = await fetch(
          `/api/pexels?query=${encodeURIComponent(query || "nature")}&page=${page}&per_page=${perPage}&type=images`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch images");
        }

        const data: PexelsResponse = await response.json();

        // Transform Pexels photos to AssetItem format
        const transformedImages: AssetItem[] = (data.photos || []).map((photo) => ({
          id: `pexels-img-${photo.id}`,
          title: photo.photographer,
          description: `${photo.width} × ${photo.height}`,
          preview: photo.src.medium,
          meta: "Pexels",
          assetUrl: photo.src.large2x, // Use high-res image for canvas
        }));

        if (append) {
          setPexelsImages((prev) => [...prev, ...transformedImages]);
        } else {
          setPexelsImages(transformedImages);
        }

        setHasMore(!!data.next_page);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching Pexels images:", error);
        setImagesError(
          error instanceof Error ? error.message : "Failed to load images"
        );
        if (!append) {
          setPexelsImages([]);
        }
      } finally {
        setIsLoadingImages(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  const fetchPexelsVideos = useCallback(
    async (query: string, page: number = 1, append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingVideos(true);
        setVideosError(null);
      }

      try {
        const perPage = page === 1 ? 10 : 20; // First page: 10, subsequent: 20
        const response = await fetch(
          `/api/pexels?query=${encodeURIComponent(query || "nature")}&page=${page}&per_page=${perPage}&type=videos`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch videos");
        }

        const data: PexelsResponse = await response.json();

        // Transform Pexels videos to AssetItem format
        const transformedVideos: AssetItem[] = (data.videos || []).map((video) => {
          // Find the best quality video file (prefer hd or high quality)
          const videoFile =
            video.video_files.find((f) => f.quality === "hd") ||
            video.video_files.find((f) => f.quality === "high") ||
            video.video_files[0];

          return {
            id: `pexels-vid-${video.id}`,
            title: `Video ${video.id}`,
            description: `${video.width} × ${video.height} • ${Math.round(video.duration)}s`,
            preview: video.image || video.video_pictures[0]?.picture,
            meta: "Pexels",
            assetUrl: videoFile?.link || video.video_files[0]?.link,
          };
        });

        if (append) {
          setPexelsVideos((prev) => [...prev, ...transformedVideos]);
        } else {
          setPexelsVideos(transformedVideos);
        }

        setHasMore(!!data.next_page);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching Pexels videos:", error);
        setVideosError(
          error instanceof Error ? error.message : "Failed to load videos"
        );
        if (!append) {
          setPexelsVideos([]);
        }
      } finally {
        setIsLoadingVideos(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Fetch images/videos when tab is activated
  useEffect(() => {
    if (activeTab === "images") {
      setCurrentPage(1);
      setHasMore(true);
      fetchPexelsImages(searchQuery, 1, false);
    } else if (activeTab === "videos") {
      setCurrentPage(1);
      setHasMore(true);
      fetchPexelsVideos(searchQuery, 1, false);
    } else {
      setPexelsImages([]);
      setPexelsVideos([]);
      setImagesError(null);
      setVideosError(null);
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [activeTab, fetchPexelsImages, fetchPexelsVideos]);

  // Debounce search for Images/Videos tabs
  useEffect(() => {
    if (activeTab === "images") {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
        setHasMore(true);
        fetchPexelsImages(searchQuery, 1, false);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    } else if (activeTab === "videos") {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
        setHasMore(true);
        fetchPexelsVideos(searchQuery, 1, false);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, activeTab, fetchPexelsImages, fetchPexelsVideos]);

  // Infinite scroll handler
  useEffect(() => {
    const isMediaTab = activeTab === "images" || activeTab === "videos";
    const isLoading = activeTab === "images" ? isLoadingImages : isLoadingVideos;

    if (!isMediaTab || !hasMore || isLoadingMore || isLoading) {
      return;
    }

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      // Load more when user is 200px from bottom
      if (scrollHeight - scrollTop - clientHeight < 200) {
        if (hasMore && !isLoadingMore && !isLoading) {
          if (activeTab === "images") {
            fetchPexelsImages(searchQuery, currentPage + 1, true);
          } else if (activeTab === "videos") {
            fetchPexelsVideos(searchQuery, currentPage + 1, true);
          }
        }
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [
    activeTab,
    hasMore,
    isLoadingMore,
    isLoadingImages,
    isLoadingVideos,
    currentPage,
    searchQuery,
    fetchPexelsImages,
    fetchPexelsVideos,
  ]);

  const filteredItems =
    activeTab === "images"
      ? pexelsImages
      : activeTab === "videos"
      ? pexelsVideos
      : assetLibrary[activeTab].filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap gap-2">
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative rounded-full px-4 py-1.5 text-xs font-semibold ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-brand-start to-brand-end text-white shadow-soft"
                : "bg-white/70 text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <label className="mt-4 flex items-center gap-2 rounded-full border border-canvas-border bg-white/70 px-3 py-2 text-sm text-slate-500 focus-within:border-brand-start">
        <Search className="h-4 w-4" aria-hidden />
        <span className="sr-only">Search assets</span>
        <input
          type="search"
          placeholder="Search library"
          className="w-full bg-transparent outline-none placeholder:text-slate-400"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </label>

      {(activeTab === "images" || activeTab === "videos") ? (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          ref={scrollContainerRef}
          className="mt-4 flex-1 overflow-y-auto pb-6"
        >
          {activeTab === "images" && (
            <>
              {isLoadingImages && pexelsImages.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-canvas-border/80 bg-white/60 px-4 py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-start" />
                  <p className="mt-3 text-sm text-slate-500">Loading images...</p>
                </div>
              )}

              {!isLoadingImages && imagesError && pexelsImages.length === 0 && (
                <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/60 px-4 py-12 text-center text-sm text-red-600">
                  {imagesError}
                </div>
              )}

              {!isLoadingImages &&
                !imagesError &&
                pexelsImages.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-canvas-border/80 bg-white/60 px-4 py-12 text-center text-sm text-slate-500">
                    No images found. Try another search term.
                  </div>
                )}

              {pexelsImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {pexelsImages.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onAssetClick(item, activeTab)}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 transition hover:scale-[1.02] hover:shadow-lg"
                    >
                      {item.preview && (
                        <Image
                          src={item.preview}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 380px) 50vw, 180px"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/5" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "videos" && (
            <>
              {isLoadingVideos && pexelsVideos.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-canvas-border/80 bg-white/60 px-4 py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-start" />
                  <p className="mt-3 text-sm text-slate-500">Loading videos...</p>
                </div>
              )}

              {!isLoadingVideos && videosError && pexelsVideos.length === 0 && (
                <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/60 px-4 py-12 text-center text-sm text-red-600">
                  {videosError}
                </div>
              )}

              {!isLoadingVideos &&
                !videosError &&
                pexelsVideos.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-canvas-border/80 bg-white/60 px-4 py-12 text-center text-sm text-slate-500">
                    No videos found. Try another search term.
                  </div>
                )}

              {pexelsVideos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {pexelsVideos.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onAssetClick(item, activeTab)}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 transition hover:scale-[1.02] hover:shadow-lg"
                    >
                      {item.preview && (
                        <Image
                          src={item.preview}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 380px) 50vw, 180px"
                        />
                      )}
                      {/* Play icon overlay for videos */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                          <svg
                            className="h-6 w-6 text-slate-900"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {isLoadingMore && (
            <div className="mt-4 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-brand-start" />
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex-1 space-y-3 overflow-y-auto pb-6"
        >
          {filteredItems.map((item) => (
            <AssetCard
              key={item.id}
              item={item}
              onClick={() => onAssetClick(item, activeTab)}
            />
          ))}
        </motion.div>
      )}

      {activeTab === "brand" && (
        <div className="mt-2 rounded-3xl border border-canvas-border bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Brand kit</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {brandKit.colors.map((color) => (
              <div key={color} className="flex flex-col items-center gap-1">
                <span
                  className="h-9 w-9 rounded-full border border-white shadow-soft"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] text-slate-400">{color}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fonts</p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
              {brandKit.fonts.map((font) => (
                <span key={font} className="rounded-full bg-slate-50 px-3 py-1">
                  {font}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetTabs;


