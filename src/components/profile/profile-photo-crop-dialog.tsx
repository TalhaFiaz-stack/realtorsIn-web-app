"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PROFILE_PHOTO_OUTPUT,
  coverPhotoOutputSize,
} from "@/features/profile/constants/profile-photo.constants";
import { cropImageToFile } from "@/lib/image/crop-image";
import { cn } from "@/lib/utils";

export type ProfilePhotoCropSession = {
  kind: "profile" | "cover";
  objectUrl: string;
  fileName: string;
  aspect: number;
};

export function ProfilePhotoCropDialog({
  session,
  isSaving,
  onCancel,
  onConfirm,
}: {
  session: ProfilePhotoCropSession | null;
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void | Promise<void>;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const resetCropState = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, []);

  useEffect(() => {
    if (session?.objectUrl) resetCropState();
  }, [session?.objectUrl, resetCropState]);

  /** Re-measure after dialog layout (avoids offset crop ring when parent had transform). */
  useEffect(() => {
    if (!session?.objectUrl) return;
    const id = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
    return () => window.clearTimeout(id);
  }, [session?.objectUrl]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSaving) {
      resetCropState();
      onCancel();
    }
  };

  async function handleSave() {
    if (!session || !croppedAreaPixels || isSaving) return;
    const outputSize =
      session.kind === "profile"
        ? PROFILE_PHOTO_OUTPUT
        : coverPhotoOutputSize(session.aspect);
    const file = await cropImageToFile(
      session.objectUrl,
      croppedAreaPixels,
      outputSize,
      session.fileName
    );
    await onConfirm(file);
    resetCropState();
  }

  const title =
    session?.kind === "cover" ? "Crop cover photo" : "Crop profile photo";

  return (
    <Dialog open={Boolean(session)} onOpenChange={handleOpenChange}>
      <DialogContent
        className="profile-photo-crop-dialog gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={!isSaving}
      >
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            "profile-photo-crop-zone relative h-[min(52vh,22rem)] w-full bg-black",
            session?.kind === "profile"
              ? "profile-photo-crop-zone--profile"
              : "profile-photo-crop-zone--cover"
          )}
        >
          {session ? (
            <Cropper
              key={session.objectUrl}
              image={session.objectUrl}
              crop={crop}
              zoom={zoom}
              aspect={session.aspect}
              objectFit={session.kind === "profile" ? "contain" : "cover"}
              roundCropAreaPixels={session.kind === "profile"}
              cropShape={session.kind === "profile" ? "round" : "rect"}
              showGrid={session.kind === "cover"}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
              classes={{ containerClassName: "profile-photo-crop-container" }}
              style={{
                cropAreaStyle: {
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
                },
              }}
            />
          ) : null}
        </div>

        <div className="border-t border-border px-4 py-3">
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.02}
              value={zoom}
              disabled={isSaving}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="h-1.5 w-full cursor-pointer accent-primary"
            />
          </label>
        </div>

        <DialogFooter className="border-t border-border px-4 py-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!croppedAreaPixels || isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save photo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
