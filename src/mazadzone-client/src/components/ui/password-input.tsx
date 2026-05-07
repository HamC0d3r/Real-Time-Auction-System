import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff } from "lucide-react";

/**
 * PasswordInput
 * Input field with a leading lock icon and a trailing visibility toggle.
 * Used globally for password entry fields.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative flex items-center">
        <div className="absolute left-4 text-muted-foreground flex items-center justify-center pointer-events-none">
          <Lock className="h-5 w-5" />
        </div>
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn("pl-11 pr-11 rounded-full h-12 bg-input-background", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
