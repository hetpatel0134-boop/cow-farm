import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Leaf, LogOut } from "lucide-react";
import LoginPage from "./components/LoginPage";
import ProfileSetup from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import Dashboard from "./pages/Dashboard";

function AppContent() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen farm-pattern flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden">
            <img
              src="/assets/generated/cow-placeholder.dim_400x400.png"
              alt="Loading"
              className="w-full h-full object-cover"
            />
          </div>
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  if (profileLoading) {
    return (
      <div className="min-h-screen farm-pattern flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden animate-pulse">
            <img
              src="/assets/generated/cow-placeholder.dim_400x400.png"
              alt="Loading"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const userName = userProfile?.name ?? "Kisan";

  return (
    <div className="min-h-screen farm-pattern flex flex-col">
      {/* Header */}
      <header className="bg-card/90 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/30">
              <img
                src="/assets/generated/cow-placeholder.dim_400x400.png"
                alt="App Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground text-base leading-tight">
                ગાય ફાર્મ
              </h1>
              <p className="text-xs text-muted-foreground leading-tight">
                Cow Farm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
              <Leaf className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-medium text-primary">
                {userName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              data-ocid="app.logout_button"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Setup Modal */}
      <ProfileSetup open={showProfileSetup} />

      {/* Main Content */}
      <Dashboard userName={userName} />

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-destructive">❤️</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <>
      <AppContent />
      <Toaster richColors position="top-center" />
    </>
  );
}
