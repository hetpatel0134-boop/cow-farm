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
import type { Cow, HeatRecord } from "../backend";
import { useAddHeatRecord, useUpdateHeatRecord } from "../hooks/useQueries";

const GUJARATI_MONTHS = [
  { value: "January", label: "જાન્યુઆરી (January)" },
  { value: "February", label: "ફેબ્રુઆરી (February)" },
  { value: "March", label: "માર્ચ (March)" },
  { value: "April", label: "એપ્રિલ (April)" },
  { value: "May", label: "મે (May)" },
  { value: "June", label: "જૂન (June)" },
  { value: "July", label: "જુલાઈ (July)" },
  { value: "August", label: "ઓગસ્ટ (August)" },
  { value: "September", label: "સપ્ટેમ્બર (September)" },
  { value: "October", label: "ઓક્ટોબર (October)" },
  { value: "November", label: "નવેમ્બર (November)" },
  { value: "December", label: "ડિસેમ્બર (December)" },
];

interface HeatFormProps {
  open: boolean;
  onClose: () => void;
  cow: Cow;
  record?: HeatRecord;
}

export default function HeatForm({
  open,
  onClose,
  cow,
  record,
}: HeatFormProps) {
  const isEdit = !!record;
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });

  const [date, setDate] = useState(record?.date ?? today);
  const [month, setMonth] = useState(record?.month ?? currentMonth);
  const [notes, setNotes] = useState(record?.notes ?? "");

  const addHeatRecord = useAddHeatRecord();
  const updateHeatRecord = useUpdateHeatRecord();
  const isPending = addHeatRecord.isPending || updateHeatRecord.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !month) return;

    try {
      if (isEdit && record) {
        await updateHeatRecord.mutateAsync({
          id: record.id,
          cowId: cow.id,
          date,
          month,
          notes: notes.trim() || null,
        });
        toast.success("ગરમી રેકોર્ડ અપડેટ થઈ ગઈ! 🗓️");
      } else {
        await addHeatRecord.mutateAsync({
          cowId: cow.id,
          date,
          month,
          notes: notes.trim() || null,
        });
        toast.success("નવી ગરમી તારીખ સાચવાઈ! 🗓️");
      }
      onClose();
    } catch (err) {
      toast.error("કંઈક ખોટું થયું. ફરી પ્રયાસ કરો.");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isPending && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="heat_form.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEdit ? "🌡️ રેકોર્ડ બદલો" : "🌡️ ગરમી તારીખ ઉમેરો"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{cow.name}</span> માટે{" "}
            <span className="text-xs">(for {cow.name})</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="heat-date">
              ગરમી તારીખ <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground ml-1">
                (Heat Date)
              </span>
            </Label>
            <Input
              id="heat-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-base py-5"
              required
              data-ocid="heat_form.input"
            />
          </div>

          {/* Month */}
          <div className="space-y-2">
            <Label>
              મહિનો <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground ml-1">
                (Month)
              </span>
            </Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger
                className="text-base py-5"
                data-ocid="heat_form.select"
              >
                <SelectValue placeholder="મહિનો પસંદ કરો..." />
              </SelectTrigger>
              <SelectContent>
                {GUJARATI_MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="heat-notes">
              નોંધ (Notes)
              <span className="text-xs text-muted-foreground ml-1">
                Optional
              </span>
            </Label>
            <Textarea
              id="heat-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="કોઈ ખાસ વાત લખો..."
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
              data-ocid="heat_form.cancel_button"
            >
              પાછળ (Cancel)
            </Button>
            <Button
              type="submit"
              disabled={isPending || !date || !month}
              className="flex-1"
              data-ocid="heat_form.submit_button"
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
