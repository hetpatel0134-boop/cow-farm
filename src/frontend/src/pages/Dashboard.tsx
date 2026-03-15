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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Cow } from "../backend";
import CalfList from "../components/CalfList";
import CowForm from "../components/CowForm";
import HeatForm from "../components/HeatForm";
import HeatHistory from "../components/HeatHistory";
import { useDeleteCow, useGetMyCows } from "../hooks/useQueries";

interface CowCardProps {
  cow: Cow;
  index: number;
  onEdit: (cow: Cow) => void;
  onDelete: (cow: Cow) => void;
  onViewHistory: (cow: Cow) => void;
  onAddHeat: (cow: Cow) => void;
}

function CowCard({
  cow,
  index,
  onEdit,
  onDelete,
  onViewHistory,
  onAddHeat,
}: CowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.07 }}
      data-ocid={`cow.card.${index + 1}`}
    >
      <Card className="card-hover border border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          {/* Photo + Info Row */}
          <div className="flex gap-4 p-4">
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/20 shadow-xs">
                <img
                  src={
                    cow.photoUrl ??
                    "/assets/generated/cow-placeholder.dim_400x400.png"
                  }
                  alt={cow.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/assets/generated/cow-placeholder.dim_400x400.png";
                  }}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-xl text-foreground truncate">
                    {cow.name}
                  </h3>
                  {cow.breed && (
                    <Badge variant="secondary" className="text-xs mt-0.5">
                      {cow.breed}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onEdit(cow)}
                    data-ocid={`cow.edit_button.${index + 1}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        data-ocid={`cow.delete_button.${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          🐄 {cow.name} ને કાઢો?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          આ ગાય અને તેના તમામ રેકોર્ડ કાયમ માટે ડિલીટ થઈ જશે.
                          <br />
                          This cow and all her records will be permanently
                          deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="cow.delete.cancel_button">
                          પાછળ (Cancel)
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(cow)}
                          className="bg-destructive hover:bg-destructive/90"
                          data-ocid="cow.delete.confirm_button"
                        >
                          હા, કાઢો (Delete)
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-0 border-t border-border">
            <button
              type="button"
              onClick={() => onAddHeat(cow)}
              className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-primary hover:bg-primary/8 transition-colors border-r border-border"
              data-ocid="heat.add_button"
            >
              <Plus className="h-4 w-4" />
              ગરમી ઉમેરો (Heat)
            </button>
            <button
              type="button"
              onClick={() => onViewHistory(cow)}
              className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              ઇતિહાસ (History)
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard({ userName }: { userName: string }) {
  const { data: cows, isLoading } = useGetMyCows();
  const deleteCow = useDeleteCow();

  const [showAddCow, setShowAddCow] = useState(false);
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [historyFor, setHistoryFor] = useState<Cow | null>(null);
  const [addHeatFor, setAddHeatFor] = useState<Cow | null>(null);

  const handleDelete = async (cow: Cow) => {
    try {
      await deleteCow.mutateAsync(cow.id);
      toast.success(`${cow.name} ડિલીટ થઈ ગઈ!`);
    } catch {
      toast.error("ડિલીટ ન થઈ. ફરી પ્રયાસ કરો.");
    }
  };

  return (
    <main className="flex-1">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              નમસ્તે, {userName}! 🙏
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              Welcome to Cow Farm
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="cows">
          <TabsList className="w-full" data-ocid="dashboard.tab">
            <TabsTrigger value="cows" className="flex-1" data-ocid="cows.tab">
              🐄 ગાય (Cows)
              {!isLoading && cows && cows.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {cows.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="calves"
              className="flex-1"
              data-ocid="calves.tab"
            >
              🐂 વાછરડું (Calves)
            </TabsTrigger>
          </TabsList>

          {/* Cows Tab */}
          <TabsContent value="cows" className="mt-4 space-y-4">
            {/* Stats + Add Button */}
            <div className="flex items-center justify-between">
              {!isLoading && cows && cows.length > 0 && (
                <div className="bg-primary/10 rounded-xl px-4 py-2 flex gap-4">
                  <div className="text-center">
                    <p className="text-xl font-display font-bold text-primary">
                      {cows.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      કુલ ગાય (Cows)
                    </p>
                  </div>
                </div>
              )}
              <Button
                onClick={() => setShowAddCow(true)}
                size="sm"
                className="gap-2 ml-auto"
                data-ocid="cow.add_button"
              >
                <Plus className="h-4 w-4" />
                ગાય ઉમેરો (Add Cow)
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4" data-ocid="cow.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-36 rounded-xl" />
                ))}
              </div>
            ) : cows && cows.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
                data-ocid="cow.empty_state"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-dashed border-primary/30">
                  <img
                    src="/assets/generated/cow-placeholder.dim_400x400.png"
                    alt=""
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  હજુ કોઈ ગાય નથી
                </h3>
                <p className="text-muted-foreground text-sm mb-1">
                  No cows added yet
                </p>
                <p className="text-muted-foreground text-sm mb-6">
                  ઉપર બટન દ્વારા પ્રથમ ગાય ઉમેરો
                </p>
                <Button
                  onClick={() => setShowAddCow(true)}
                  size="lg"
                  className="gap-2"
                >
                  <Plus className="h-5 w-5" />
                  પ્રથમ ગાય ઉમેરો (Add First Cow)
                </Button>
              </motion.div>
            ) : (
              <AnimatePresence>
                <div className="space-y-4" data-ocid="cow.list">
                  {(cows ?? []).map((cow, index) => (
                    <CowCard
                      key={cow.id.toString()}
                      cow={cow}
                      index={index}
                      onEdit={setEditingCow}
                      onDelete={handleDelete}
                      onViewHistory={setHistoryFor}
                      onAddHeat={setAddHeatFor}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </TabsContent>

          {/* Calves Tab */}
          <TabsContent value="calves" className="mt-4">
            <CalfList cows={cows ?? []} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CowForm open={showAddCow} onClose={() => setShowAddCow(false)} />
      {editingCow && (
        <CowForm
          open={!!editingCow}
          onClose={() => setEditingCow(null)}
          cow={editingCow}
        />
      )}
      {historyFor && (
        <HeatHistory
          open={!!historyFor}
          onClose={() => setHistoryFor(null)}
          cow={historyFor}
        />
      )}
      {addHeatFor && (
        <HeatForm
          open={!!addHeatFor}
          onClose={() => setAddHeatFor(null)}
          cow={addHeatFor}
        />
      )}
    </main>
  );
}
