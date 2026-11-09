"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { changePasswordAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";

/**
 * Password-change island (S92-2d) — the account's Profile tab second card.
 * The current password is verified server-side against the stored scrypt
 * hash (a wrong one surfaces the uniform inline error); on success every
 * OTHER session is signed out (this browser keeps the fresh cookie).
 */
export function PasswordForm() {
  const { toast } = useToast();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    setPending(true);
    try {
      const result = await changePasswordAction(formData);
      if (result.ok) {
        formRef.current?.reset();
        toast({
          title: "Password updated",
          description: "Your password has been changed. Other devices were signed out.",
          variant: "success",
        });
      } else {
        setError(result.error);
        toast({
          title: "Could not update password",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
      aria-labelledby="password-form-heading"
    >
      <div>
        <h3 id="password-form-heading" className="text-sm font-semibold">
          Password
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Changing your password signs out every other device.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          name="newPassword"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          aria-describedby="new-password-hint"
        />
        <p id="new-password-hint" className="text-xs text-muted-foreground">
          At least 8 characters.
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {pending ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
