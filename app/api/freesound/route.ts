import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || "nature";
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("page_size") || "20";

  const apiKey = process.env.FREESOUND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Freesound API key is not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(
        query
      )}&page=${page}&page_size=${pageSize}&fields=id,name,username,duration,previews,images`,
      {
        headers: {
          Authorization: `Token ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.detail ||
            errorData.error ||
            "Failed to fetch audio from Freesound",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Freesound API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audio" },
      { status: 500 }
    );
  }
}
