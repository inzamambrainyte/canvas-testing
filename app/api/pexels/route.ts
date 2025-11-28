import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || "nature";
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "20";
  const type = searchParams.get("type") || "images"; // "images" or "videos"

  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Pexels API key is not configured" },
      { status: 500 }
    );
  }

  try {
    const endpoint =
      type === "videos"
        ? `https://api.pexels.com/videos/search`
        : `https://api.pexels.com/v1/search`;

    const response = await fetch(
      `${endpoint}?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.error ||
            `Failed to fetch ${type} from Pexels`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Pexels API error:", error);
    return NextResponse.json(
      { error: `Failed to fetch ${type}` },
      { status: 500 }
    );
  }
}

