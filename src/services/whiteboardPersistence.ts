import { createClient } from "@supabase/supabase-js";
import * as Y from "yjs";

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = !!supabaseUrl && !!supabaseKey;

const supabase = isConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

const toHexBytea = (data: Uint8Array) => `\\x${Buffer.from(data).toString("hex")}`;

const fromHexBytea = (value: string): Uint8Array | null => {
  if (!value) return null;
  const normalized = value.startsWith("\\x") ? value.slice(2) : value;
  if (!normalized) return null;
  return new Uint8Array(Buffer.from(normalized, "hex"));
};

export const canUseWhiteboardPersistence = () => isConfigured;

export async function loadWhiteboardDocument(
  documentName: string
): Promise<Uint8Array | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("whiteboard_document")
    .select("yjs_state")
    .eq("document_name", documentName)
    .maybeSingle<{ yjs_state: string }>();

  if (error) throw error;
  if (!data?.yjs_state) return null;

  return fromHexBytea(data.yjs_state);
}

export async function saveWhiteboardDocument(
  documentName: string,
  document: Y.Doc
): Promise<void> {
  if (!supabase) return;

  const encodedState = Y.encodeStateAsUpdate(document);

  const { error } = await supabase.from("whiteboard_document").upsert(
    {
      document_name: documentName,
      yjs_state: toHexBytea(encodedState),
    },
    { onConflict: "document_name" }
  );

  if (error) throw error;
}
