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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Calf, Cow } from "../backend";
import { useDeleteCalf, useGetMyCalves } from "../hooks/useQueries";
import CalfForm from "./CalfForm";

interface CalfListProps {
  cows: Cow[];
}

export default function CalfList({ cows }: CalfListProps) {
  const { data: calves, isLoading } = useGetMyCalves();
  const deleteCalf = useDeleteCalf();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCalf, setEditingCalf] = useState<Calf | null>(null);

  const getCowName = (motherCowId: bigint) => {
    const cow = cows.find((c) => c.id === motherCowId);
    return cow?.name ?? "અજ્ઞાત (Unknown)";
  };

  const handleDelete = async (calf: Calf) => {
    try {
      await deleteCalf.mutateAsync(calf.id);
      toast.success(`${calf.name} ડિલીટ થઈ ગઈ!`);
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

  if (isLoading) {
    return (
      <div className="space-y-4" data-ocid="calf.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {calves?.length ?? 0} વાછરડા (Calves)
        </p>
        <Button
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="gap-2"
          data-ocid="calf.add_button"
          disabled={cows.length === 0}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">વાછરડું ઉમેરો</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {cows.length === 0 && (
        <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
          <p className="text-2xl mb-2">🐄</p>
          <p className="font-medium text-sm">પ્રથમ ગાય ઉમેરો</p>
          <p className="text-xs">Add a cow first before adding calves</p>
        </div>
      )}

      {cows.length > 0 && calves && calves.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
          data-ocid="calf.empty_state"
        >
          <div className="text-6xl mb-4">🐂</div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            હજુ કોઈ વાછરડું નથી
          </h3>
          <p className="text-muted-foreground text-sm mb-2">
            No calves added yet
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            ઉપર બટन દ્વારા પ્રથમ વાછરડું ઉમેરો
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            size="lg"
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            પ્રથમ વાછરડું ઉમેરો (Add First Calf)
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3" data-ocid="calf.list">
            {(calves ?? []).map((calf, index) => (
              <motion.div
                key={calf.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.07 }}
                data-ocid={`calf.item.${index + 1}`}
              >
                <Card className="border border-border bg-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                        {calf.gender === "female" ? "🐄" : "🐂"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display font-bold text-lg text-foreground">
                              {calf.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <Badge
                                variant={
                                  calf.gender === "female"
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {calf.gender === "female"
                                  ? "🐄 માદા (Female)"
                                  : "🐂 નર (Male)"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => setEditingCalf(calf)}
                              data-ocid={`calf.edit_button.${index + 1}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  data-ocid={`calf.delete_button.${index + 1}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    🐂 {calf.name} ને કાઢો?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    આ વાછરડાનો રેકોર્ડ હંમેશ માટે ડિલીટ થઈ જશે.
                                    <br />
                                    This calf record will be permanently
                                    deleted.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-ocid="calf.delete.cancel_button">
                                    પાછળ (Cancel)
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(calf)}
                                    className="bg-destructive hover:bg-destructive/90"
                                    data-ocid="calf.delete.confirm_button"
                                  >
                                    હા, કાઢો (Delete)
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            📅 જન્મ: {formatDate(calf.birthDate)}
                            <span className="text-xs ml-1">(Birth)</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            🐄 માતા: {getCowName(calf.motherCowId)}
                            <span className="text-xs ml-1">(Mother)</span>
                          </p>
                          {calf.notes && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              📝 {calf.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {showAddForm && (
        <CalfForm
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          cows={cows}
        />
      )}
      {editingCalf && (
        <CalfForm
          open={!!editingCalf}
          onClose={() => setEditingCalf(null)}
          calf={editingCalf}
          cows={cows}
        />
      )}
    </div>
  );
}
