"use client";

import { useState } from "react";
import { AlertCircle, User, PenTool, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalInput } from "@/components/ui/BrutalInput";
import { useSignUp } from "@/hooks/use-sign-up";
import Link from "next/link";
import { cn } from "@/lib/utils"; // Assuming you have a standard cn utility

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/* ---------------- schema ---------------- */

// We refine the schema so student fields are only required if role is 'user'
const signUpSchema = z
  .object({
    role: z.enum(["user", "creator"], {
      required_error: "Please select a role",
    }),
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    // These are optional initially, but enforced via superRefine below
    level: z.string().optional(),
    department: z.string().optional(),
    matricNumber: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "user") {
      if (!data.level || data.level.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Level is required for students",
          path: ["level"],
        });
      }
      if (!data.department || data.department.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Department is required for students",
          path: ["department"],
        });
      }
      if (!data.matricNumber || data.matricNumber.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Matric number is required for students",
          path: ["matricNumber"],
        });
      }
    }
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

/* ---------------- component ---------------- */

export default function SignUpPage() {
  const { signUp, isLoading, error } = useSignUp();
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "user", // Default, but will be set by user in Step 1
      fullName: "",
      email: "",
      password: "",
      level: "",
      department: "",
      matricNumber: "",
    },
  });

  // Watch the role to conditionally render fields in Step 2
  const selectedRole = form.watch("role");

  async function onSubmit(values: SignUpFormValues) {
    // console.log(values);
    await signUp(values);
  }

  const handleRoleSelect = (role: "user" | "creator") => {
    form.setValue("role", role);
    setStep(2);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background py-12">
      <BrutalCard className="w-full max-w-xl p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
        {/* Step Indicator (Top Left) */}
        <div className="absolute top-4 left-6 flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Step {step} of 2
          </span>
          <div className="h-1 w-12 bg-gray-200 mt-1 rounded-full overflow-hidden">
            <div
              className={`h-full bg-black transition-all duration-300 ${
                step === 1 ? "w-1/2" : "w-full"
              }`}
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-start mt-8 mb-8">
          <h1 className="text-3xl font-black tracking-tight uppercase">
            {step === 1 ? "Choose your Path" : "Join the Hub"}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            {step === 1
              ? "How do you want to use the platform?"
              : `Create your ${selectedRole} profile`}
          </p>
        </div>

        {/* Global Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 flex items-center gap-2 text-red-700 font-bold">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* STEP 1: Role Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
            <BrutalButton
              onClick={() => handleRoleSelect("user")}
              className="group flex flex-col items-center justify-center p-6 border-2 border-black bg-white hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none overflow-hidden relative z-10"
            >
              <h3 className="text-xl font-bold uppercase mb-2">User</h3>
              <p className="text-center text-sm font-medium opacity-80  z-20 p-2">
                I am a student looking to access resources and connect.
              </p>
              <div className="absolute -bottom-8 -right-6  mb-4 p-3 rounded-full border-2 border-current opacity-60">
                <User size={64} />
              </div>
            </BrutalButton>

            <BrutalButton
              onClick={() => handleRoleSelect("creator")}
              className="group flex flex-col items-center justify-center p-6 border-2 border-black bg-white hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none overflow-hidden relative z-10"
            >
              <h3 className="text-xl font-bold uppercase mb-2">Creator</h3>
              <p className="text-center text-sm font-medium opacity-80  z-20 p-2">
                I want to publish content, events, and resources.
              </p>
              <div className="absolute -bottom-8 -right-6  mb-4 p-3 rounded-full border-2 border-current opacity-60">
                <PenTool size={64} />
              </div>
            </BrutalButton>
          </div>
        )}

        {/* STEP 2: The Form */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => setStep(1)}
              className="mb-6 flex items-center gap-2 text-sm font-bold hover:underline"
            >
              <ArrowLeft size={16} /> Change Role
            </button>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Common Fields */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Full Name</FormLabel>
                      <FormControl>
                        <BrutalInput placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Email</FormLabel>
                        <FormControl>
                          <BrutalInput
                            type="email"
                            placeholder="you@uni.edu"
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
                </div>

                {/* Conditional Fields: Only show for Users/Students */}
                {selectedRole === "user" && (
                  <>
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-dashed border-gray-400" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground font-bold">
                          Student Details
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold">
                              Department
                            </FormLabel>
                            <FormControl>
                              <BrutalInput
                                placeholder="Computer Science"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold">Level</FormLabel>
                            <FormControl>
                              <BrutalInput
                                type="number"
                                placeholder="100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="matricNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">
                            Matric Number
                          </FormLabel>
                          <FormControl>
                            <BrutalInput
                              placeholder="ENG/2021/001"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <div className="pt-4">
                  <BrutalButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-bold text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
                    isLoading={isLoading}
                  >
                    {isLoading ? "Creating Profile..." : "Sign Up"}
                  </BrutalButton>
                </div>
              </form>
            </Form>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm font-medium">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline hover:text-primary">
              Log in here
            </Link>
          </p>
        </div>
      </BrutalCard>
    </div>
  );
}
