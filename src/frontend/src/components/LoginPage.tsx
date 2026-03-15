import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
      queryClient.clear();
    } catch (error: any) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen farm-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-card rounded-2xl shadow-farm border border-border p-8 md:p-12 max-w-md w-full text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-primary/20 shadow-farm">
            <img
              src="/assets/generated/cow-placeholder.dim_400x400.png"
              alt="Cow Farm"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            ગાય ફાર્મ
          </h1>
          <p className="text-lg text-primary font-semibold mb-1">Cow Farm</p>
          <p className="text-muted-foreground text-sm mb-8">
            તમારી ગાય અને વાછરડાંના રેકોર્ડ અહીં રાખો
            <br />
            <span className="text-xs">
              Keep records of your cows and calves here
            </span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            size="lg"
            className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
            data-ocid="login.primary_button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                લૉગ ઇન થઈ રહ્યા છો...
              </>
            ) : (
              "🔐 લૉગ ઇન કરો (Login)"
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Internet Identity થી સુરક્ષિત લૉગ ઇન (Secure login)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-border"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { emoji: "🐄", label: "ગાય (Cow)" },
              { emoji: "🐂", label: "વાછરડું (Calf)" },
              { emoji: "📅", label: "ગરમી (Heat)" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="text-2xl">{item.emoji}</div>
                <p className="text-xs text-muted-foreground font-medium">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
