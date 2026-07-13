import { supabase } from "./supabase";

// 자료실이 붙는 상세 페이지 slug. 현재는 지출 페이지만 사용합니다.
export const DOC_GUIDE = "expense";

// 지출 페이지의 분류(섹션 제목) — 업로드 시 선택지로 노출됩니다.
// guides.ts 의 지출 섹션 title 과 정확히 일치해야 화면에 자동 병합됩니다.
export const EXPENSE_CATEGORIES = [
  "신규자 필수자료",
  "지출·학교회계 기준",
  "출장비·여비",
  "급여·인건비",
  "지급방법·시스템·업무개선",
] as const;

const BUCKET = "documents";

export type DocKind = "pdf" | "hwp";

export type Doc = {
  id: string;
  guide: string;
  category: string;
  name: string;
  file_path: string;
  kind: DocKind;
  sort: number;
  created_at: string;
};

// 확장자로 배지 종류를 판별합니다. (한글 문서는 모두 'hwp' 로 표시)
export function kindFromName(fileName: string): DocKind {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return ext === "pdf" ? "pdf" : "hwp";
}

function extFromPath(path: string): string {
  const ext = path.split(".").pop() ?? "";
  return ext ? `.${ext}` : "";
}

// 내려받을 때 저장될 파일명(제목 + 원본 확장자)
export function downloadName(doc: Doc): string {
  return `${doc.name}${extFromPath(doc.file_path)}`;
}

// 공개 버킷의 다운로드 URL
export function publicUrl(filePath: string): string {
  if (!supabase) return "#";
  return supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl;
}

// 특정 페이지의 업로드 자료를 분류→목록 형태로 가져옵니다.
export async function fetchDocsByCategory(
  guide: string = DOC_GUIDE,
): Promise<Record<string, Doc[]>> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("guide", guide)
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  const grouped: Record<string, Doc[]> = {};
  for (const doc of (data ?? []) as Doc[]) {
    (grouped[doc.category] ??= []).push(doc);
  }
  return grouped;
}

// 관리자용: 전체 목록(플랫)
export async function fetchAllDocs(
  guide: string = DOC_GUIDE,
): Promise<Doc[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("guide", guide)
    .order("category", { ascending: true })
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Doc[];
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

// 파일 업로드 + 메타데이터 등록
export async function uploadDocument(input: {
  guide?: string;
  category: string;
  name: string;
  file: File;
}): Promise<void> {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const guide = input.guide ?? DOC_GUIDE;
  const ext = input.file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${guide}/${randomId()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, input.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: input.file.type || undefined,
    });
  if (upErr) throw upErr;

  const { error: insErr } = await supabase.from("documents").insert({
    guide,
    category: input.category,
    name: input.name.trim(),
    file_path: path,
    kind: kindFromName(input.file.name),
  });
  if (insErr) {
    // 메타 등록 실패 시 업로드한 파일을 되돌립니다.
    await supabase.storage.from(BUCKET).remove([path]);
    throw insErr;
  }
}

// 파일 + 메타데이터 삭제
export async function deleteDocument(doc: Doc): Promise<void> {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const { error: delErr } = await supabase
    .from("documents")
    .delete()
    .eq("id", doc.id);
  if (delErr) throw delErr;
  await supabase.storage.from(BUCKET).remove([doc.file_path]);
}
