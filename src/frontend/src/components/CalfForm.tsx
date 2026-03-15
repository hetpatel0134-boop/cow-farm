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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Calf, Cow } from "../backend";
import { useAddCalf, useUpdateCalf } from "../hooks/useQueries";

interface CalfFormProps {
  open: boolean;
  onClose: () => void;
  calf?: Calf;
  cows: Cow[];
}

export default function CalfForm({ open, onClose, calf, cows }: CalfFormProps) {
  const isEdit = !!calf;
  const today = new Date().toISOString().split("T")[0];

  const [name, setName] = useState(calf?.name ?? "");
  const [birthDate, setBirthDate] = useState(calf?.birthDate ?? today);
  const [gender, setGender] = useState(calf?.gender ?? "male");
  const [motherCowId, setMotherCowId] = useState(
    calf?.motherCowId?.toString() ?? cows[0]?.id?.toString() ?? "",
  );
  const [notes, setNotes] = useState(calf?.notes ?? "");

  const addCalf = useAddCalf();
  const updateCalf = useUpdateCalf();
  const isPending = addCalf.isPending || updateCalf.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate || !motherCowId) return;

    try {
      const params = {
        name: name.trim(),
        birthDate,
        gender,
        motherCowId: BigInt(motherCowId),
        notes: notes.trim() || null,
        photoUrl: null,
      };

      if (isEdit && calf) {
        await updateCalf.mutateAsync({ id: calf.id, ...params });
        toast.success("વાછરડાની માહિતી અપડેટ થઈ! 🐂");
      } else {
        await addCalf.mutateAsync(params);
        toast.success("નવું વાછરડું ઉમેરાયું! 🐂");
      }
      onClose();
    } catch (err) {
      toast.error("કંઈક ખોટું થયું. ફરી પ્રયાસ કરો.");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isPending && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="calf_form.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEdit ? "🐂 વાછરડું અપડેટ કરો" : "🐂 નવું વાછરડું ઉમેરો"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Update Calf" : "Add New Calf"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="calf-name">
              વાછરડાનું નામ <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground ml-1">
                (Calf Name)
              </span>
            </Label>
            <Input
              id="calf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chhotu, Motu..."
              className="text-base py-5"
              required
              data-ocid="calf_form.input"
            />
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label htmlFor="calf-birthdate">
              જન્મ તારીખ <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground ml-1">
                (Birth Date)
              </span>
            </Label>
            <Input
              id="calf-birthdate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="text-base py-5"
              required
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>
              જાતિ <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground ml-1">
                (Gender)
              </span>
            </Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger
                className="text-base py-5"
                data-ocid="calf_form.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">🐂 નર (Male)</SelectItem>
                <SelectItem value="female">🐄 માદા (Female)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mother Cow */}
          <div className="space-y-2">
            <Label>
              માતાની ગાય <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground ml-1">
                (Mother Cow)
              </span>
            </Label>
            <Select value={motherCowId} onValueChange={setMotherCowId}>
              <SelectTrigger className="text-base py-5">
                <SelectValue placeholder="ગાય પસંદ કરો..." />
              </SelectTrigger>
              <SelectContent>
                {cows.map((cow) => (
                  <SelectItem key={cow.id.toString()} value={cow.id.toString()}>
                    🐄 {cow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="calf-notes">
              નોંધ (Notes)
              <span className="text-xs text-muted-foreground ml-1">
                Optional
              </span>
            </Label>
            <Textarea
              id="calf-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="કોઈ ખાસ વાત..."
              rows={3}
              className="text-base resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              data-ocid="calf_form.cancel_button"
            >
              પાછળ (Cancel)
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim() || !birthDate || !motherCowId}
              className="flex-1"
              data-ocid="calf_form.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  સાચવી રહ્યા...
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
