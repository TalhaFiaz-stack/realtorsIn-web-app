"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PendingChatAttachment } from "@/components/chat/chat-media-composer-preview";

const MAX_IMAGES = 10;
const MAX_DOCS = 3;

export function usePendingChatAttachment(conversationId: number) {
  const [attachment, setAttachment] = useState<PendingChatAttachment | null>(
    null
  );
  const previewUrlRef = useRef<string | null>(null);

  const clearAttachment = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setAttachment(null);
  }, []);

  useEffect(() => {
    clearAttachment();
  }, [conversationId, clearAttachment]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const pickFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return;
      clearAttachment();

      const files = Array.from(fileList);
      const images = files
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, MAX_IMAGES);
      const docs = files
        .filter((file) => !file.type.startsWith("image/"))
        .slice(0, MAX_DOCS);

      if (images.length > 0) {
        const previewUrl = URL.createObjectURL(images[0]!);
        previewUrlRef.current = previewUrl;
        setAttachment({ kind: "images", files: images, previewUrl });
        return;
      }

      if (docs.length > 0) {
        setAttachment({ kind: "documents", files: docs });
      }
    },
    [clearAttachment]
  );

  return { attachment, pickFiles, clearAttachment };
}
