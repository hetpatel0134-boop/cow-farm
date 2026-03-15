import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Pencil, Plus, StickyNote, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Cow, HeatRecord } from "../backend";
import { useDeleteHeatRecord, useGetCowHeatRecords } from "../hooks/useQueries";
import HeatForm from "./HeatForm";

const MONTH_GUJARATI: Record<string, string> = {
  January: "જાન્યુઆરી",
  February: "ફેબ્રુઆરી",
  March: "માર્ચ",
  April: "એપ્રિલ",
  May: "મે",
  June: "જૂન",
  July: "જુલાઈ",
  August: "ઓગસ્ટ",
  September: "સપ્ટેમ્બર",
  October: "ઓક્ટોબર",
  November: "નવેમ્બર",
  December: "ડિસેમ્બર",
};

interface HeatHistoryProps {
  open: boolean;
  onClose: () => void;
  cow: Cow;
}

export default function HeatHistory({ open, onClose, cow }: HeatHistoryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HeatRecord | null>(null);
  const { data: records, isLoading } = useGetCowHeatRecords(
    open ? cow.id : null,
  );
  const deleteHeatRecord = useDeleteHeatRecord();

  const sortedRecords = [...(records ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const handleDelete = async (record: HeatRecord) => {
    try {
      await deleteHeatRecord.mutateAsync({ id: record.id, cowId: cow.id });
      toast.success("રેકોર્ડ ડિલીટ થઈ ગઈ!");
    } catch {
      toast.error("ડિલીટ ન થઈ. ફરી પ્રયાસ કરો.");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("gu-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent
          className="sm:max-w-lg max-h-[85vh] flex flex-col"
          data-ocid="heat_history.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              🗓️ {cow.name} ની ગરમી ઇતિહાસ
            </DialogTitle>
            <p className="text-sm text-muted-foreground">Heat History</p>
          </DialogHeader>

          <div className="flex justify-end mb-2">
            <Button
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="gap-2"
              data-ocid="heat.add_button"
            >
              <Plus className="h-4 w-4" />
              નવી તારીખ ઉમેરો (Add Date)
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {isLoading ? (
              <div className="space-y-3" data-ocid="heat_history.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : sortedRecords.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="heat_history.empty_state"
              >
                <p className="text-4xl mb-3">📅</p>
                <p className="font-medium">હજુ કોઈ રેકોર્ડ નથી</p>
                <p className="text-sm">ઉપર બટن દ્વારા પ્રથમ તારીખ ઉમેરો</p>
              </div>
            ) : (
              <AnimatePresence>
                {sortedRecords.map((record, index) => (
                  <motion.div
                    key={record.id.toString()}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ delay: index * 0.04 }}
                    className="bg-secondary/40 rounded-xl p-4 border border-border"
                    data-ocid={`heat.record.item.${index + 1}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold text-foreground">
                            {formatDate(record.date)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {MONTH_GUJARATI[record.month] ?? record.month}
                          </Badge>
                        </div>
                        {record.notes && (
                          <div className="flex items-start gap-1.5 mt-2">
                            <StickyNote className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {record.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setEditingRecord(record)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                રેકોર્ડ કાઢો? (Delete Record?)
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                આ ગરમી તારીખ હંમેશ માટે ડિલીટ થઈ જશે.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="heat_history.cancel_button">
                                પાછળ (Cancel)
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(record)}
                                className="bg-destructive hover:bg-destructive/90"
                                data-ocid="heat_history.confirm_button"
                              >
                                હા, કાઢો (Delete)
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showAddForm && (
        <HeatForm
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          cow={cow}
        />
      )}
      {editingRecord && (
        <HeatForm
          open={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          cow={cow}
          record={editingRecord}
        />
      )}
    </>
  );
}
