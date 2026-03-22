"use client";

import { Zap, AlertCircle, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalInput } from "@/components/ui/BrutalInput";
import { useSignIn } from "@/hooks/use-sign-in";
import Link from "next/link";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/* ---------------- schema ---------------- */

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/* ---------------- component ---------------- */

export default function LoginPage() {
  const { signIn, isLoading, error } = useSignIn();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    await signIn(values);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <BrutalCard className="w-full max-w-md p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight uppercase">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Enter your credentials to access the hub.
          </p>
        </div>

        {/* Global Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 flex items-center gap-2 text-red-700 font-bold">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Email Address</FormLabel>
                  <FormControl>
                    <BrutalInput
                      type="email"
                      placeholder="you@university.edu"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Password</FormLabel>
                  <FormControl>
                    <BrutalInput
                      type="password"
                      placeholder="******"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <BrutalButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
              isLoading={isLoading}
            >
              Log In
            </BrutalButton>
          </form>
        </Form>

        {/* Switch to Sign Up */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
          <p className="text-center font-medium mb-4">New to Innovators Hub?</p>
          <Link href="/auth/sign-up" className="w-full block">
            <BrutalButton
              variant="outline"
              size="lg"
              className="w-full border-2 border-black flex items-center justify-center gap-2 group"
            >
              Create an Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </BrutalButton>
          </Link>
        </div>
      </BrutalCard>
    </div>
  );
}
