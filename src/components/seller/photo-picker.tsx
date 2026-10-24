"use client";

import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductThumb } from "@/components/ui/media";

type Photo = { id: string; url?: string; swatch?: string };

/** Photo slots (DS "Image Upload"). Files stay local until the API upload is wired. */
export function PhotoPicker({ max = 6, initial = [], label }: { max?: number; initial?: string[]; label: string }) {
  const [photos, setPhotos] = useState<Photo[]>(initial.map((s, i) => ({ id: `init-${i}`, swatch: s })));
  const input = useRef<HTMLInputElement>(null);

  // Blob URLs are released when a photo is removed and when the picker unmounts
  // (revoking on every change broke the previews still on screen).
  const urls = useRef(new Set<string>());
  useEffect(() => {
    const live = urls.current;
    return () => live.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  function remove(p: Photo) {
    if (p.url) {
      URL.revokeObjectURL(p.url);
      urls.current.delete(p.url);
    }
    setPhotos((ps) => ps.filter((x) => x.id !== p.id));
  }

  function add(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files)
      .slice(0, max - photos.length)
      .map((f) => ({ id: `${f.name}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`, url: URL.createObjectURL(f) }));
    next.forEach((p) => urls.current.add(p.url));
    setPhotos((p) => [...p, ...next]);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="flex flex-wrap gap-2.5" aria-label={label}>
      {photos.map((p, i) => (
        <div key={p.id} className="relative size-20 animate-fade-in overflow-hidden rounded-md md:size-24">
          {p.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={p.url} alt={`Photo ${i + 1}`} className="size-full object-cover" />
          ) : (
            <ProductThumb swatch={p.swatch ?? "slate"} name={`Photo ${i + 1}`} className="size-full rounded-none" />
          )}
          {i === 0 && <span className="absolute bottom-1 left-1 rounded-xs bg-inverse/80 px-1.5 type-caption text-fg-inverse">Couverture</span>}
          <button type="button" aria-label={`Retirer la photo ${i + 1}`} onClick={() => remove(p)} className="pressable absolute top-1 right-1 flex size-7 items-center justify-center rounded-sm bg-surface text-fg shadow-e1">
            <X className="size-4" />
          </button>
        </div>
      ))}
      {photos.length < max && (
        <button type="button" onClick={() => input.current?.click()} className="pressable flex size-20 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-line-strong text-fg-secondary hover:border-fg-tertiary hover:bg-surface-muted md:size-24">
          <Camera className="size-5" />
          <span className="type-caption">Ajouter</span>
        </button>
      )}
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
    </div>
  );
}
