import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface ProfileSetupProps {
  open: boolean;
}

export default function ProfileSetup({ open }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await mutateAsync(name.trim());
      toast.success("Profile save ho gayi!");
    } catch {
      toast.error("Profile save nahi hui. Dobara try karein.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" data-ocid="profile_setup.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            🐄 Swagat Hai!
          </DialogTitle>
          <DialogDescription>
            Apna naam darj karein (Enter your name)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="user-name">आपका नाम (Aapka Naam)</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="text-base py-5"
              data-ocid="profile_setup.input"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || !name.trim()}
            className="w-full py-6 text-base"
            data-ocid="profile_setup.submit_button"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Save ho raha hai...
              </>
            ) : (
              "✅ Save Karein"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
