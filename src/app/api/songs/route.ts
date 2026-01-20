import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const artist = formData.get("artist") as string || "Unknown Artist";
  const album = formData.get("album") as string || "Unknown Album";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  
  const { error: uploadError } = await supabase.storage
    .from("music")
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from("music")
    .getPublicUrl(fileName);

  const { data: song, error: dbError } = await supabase
    .from("songs")
    .insert({
      title: title || file.name.replace(/\.[^/.]+$/, ""),
      artist,
      album,
      file_path: urlData.publicUrl,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(song);
}
