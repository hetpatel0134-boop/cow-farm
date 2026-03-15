import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Cow } from "../backend";
import { usePhotoUpload } from "../hooks/usePhotoUpload";
import { useAddCow, useUpdateCow } from "../hooks/useQueries";

interface CowFormProps {
  open: boolean;
  onClose: () => void;
  cow?: Cow;
}

export default function CowForm({ open, onClose, cow }: CowFormProps) {
  const isEdit = !!cow;
  const [name, setName] = useState(cow?.name ?? "");
  const [breed, setBreed] = useState(cow?.breed ?? "");
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    cow?.photoUrl ?? null,
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addCow = useAddCow();
  const updateCow = useUpdateCow();
  const { uploadPhoto, uploadProgress, isUploading } = usePhotoUpload();

  const isPending = addCow.isPending || updateCow.isPending || isUploading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      let finalPhotoUrl: string | null = cow?.photoUrl ?? null;

      if (pendingFile) {
        finalPhotoUrl = await uploadPhoto(pendingFile);
      } else if (photoPreview === null) {
        finalPhotoUrl = null;
      }

      if (isEdit && cow) {
        await updateCow.mutateAsync({
          id: cow.id,
          name: name.trim(),
          breed: breed.trim() || null,
          photoUrl: finalPhotoUrl,
        });
        toast.success("ગાયની માહિતી અપડેટ થઈ! 🐄");
      } else {
        await addCow.mutateAsync({
          name: name.trim(),
          breed: breed.trim() || null,
          photoUrl: finalPhotoUrl,
        });
        toast.success("નવી ગાય ઉમેરાઈ! 🐄");
      }
      onClose();
    } catch (err) {
      toast.error("કંઈક ખોટું થયું. ફરી પ્રયાસ કરો.");
      console.error(err);
    }
  };

  const handleOpenChange = (o: boolean) => {
    if (!o && !isPending) onClose();
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="cow_form.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEdit ? "🐄 ગાય અપડેટ કરો" : "🐄 નવી ગાય ઉમેરો"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Update Cow" : "Add New Cow"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>તસ્વીર (Photo)</Label>
            <div className="flex flex-col items-center gap-3">
              {photoPreview ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-primary/30">
                  <img
                    src={photoPreview}
                    alt="ગાય"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={triggerFileInput}
                  onKeyDown={(e) => e.key === "Enter" && triggerFileInput()}
                  className="w-32 h-32 rounded-xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors"
                  aria-label="Photo પસંદ કરો"
                >
                  <img
                    src="/assets/generated/cow-placeholder.dim_400x400.png"
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg opacity-60"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Photo ઉમેરો
                  </p>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
                data-ocid="cow_form.upload_button"
              >
                <Upload className="h-4 w-4 mr-2" />
                Photo પસંદ કરો
              </Button>

              {isUploading && (
                <div
                  className="w-full space-y-1"
                  data-ocid="cow_form.loading_state"
                >
                  <p className="text-xs text-muted-foreground text-center">
                    Upload થઈ રહ્યું છે... {uploadProgress}%
                  </p>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="cow-name">
              ગાયનું નામ <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground ml-1">
                (Cow Name)
              </span>
            </Label>
            <Input
              id="cow-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lakshmi, Ganga, Nandini..."
              className="text-base py-5"
              required
              data-ocid="cow_form.input"
            />
          </div>

          {/* Breed */}
          <div className="space-y-2">
            <Label htmlFor="cow-breed">
              નસ્લ (Breed)
              <span className="text-xs text-muted-foreground ml-1">
                Optional
              </span>
            </Label>
            <Input
              id="cow-breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="e.g. Gir, Sahiwal, HF..."
              className="text-base py-5"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              data-ocid="cow_form.cancel_button"
            >
              પાછળ (Cancel)
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              className="flex-1"
              data-ocid="cow_form.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Upload..." : "સાચવી રહ્યા..."}
                </>
              ) : isEdit ? (
                "✅ અપડેટ કરો"
              ) : (
                "✅ સાચવો"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
