"use client";

import { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useEnrollment } from "../context/enrollment-context";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<typeof Button>;

interface EnrollmentButtonProps extends Omit<ButtonProps, "onClick"> {
  children: React.ReactNode;
}

export function EnrollmentButton({
  children,
  className,
  variant = "default",
  ...props
}: EnrollmentButtonProps) {
  const { openModal } = useEnrollment();

  return (
    <Button
      onClick={openModal}
      variant={variant}
      className={cn(className)}
      {...props}
    >
      {children}
    </Button>
  );
}
