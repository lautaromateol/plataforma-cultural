"use client";

import { useEnrollment } from "../context/enrollment-context";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { PersonalDataStep } from "./personal-data-step";
import { PlanSelectionStep } from "./plan-selection-step";
import { PaymentOptionsStep } from "./payment-options-step";
import { HeadquartersInfoStep } from "./headquarters-info-step";
import { PaymentStep } from "./payment-step";
import { SuccessStep } from "./success-step";
import { ScrollArea } from "@/components/ui/scroll-area";

const stepComponents = {
  "personal-data": PersonalDataStep,
  "plan-selection": PlanSelectionStep,
  "payment-options": PaymentOptionsStep,
  "headquarters-info": HeadquartersInfoStep,
  payment: PaymentStep,
  success: SuccessStep,
};

export function EnrollmentModal() {
  const { isOpen, closeModal, step, reset } = useEnrollment();
  const isMobile = useIsMobile();

  const StepComponent = stepComponents[step];

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
      // Solo resetear si no está en el paso de éxito
      if (step !== "success") {
        reset();
      }
    }
  };

  const content = (
    <ScrollArea className="max-h-[80vh]">
      <div className="p-6">
        <StepComponent />
      </div>
    </ScrollArea>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent>{content}</DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {content}
      </DialogContent>
    </Dialog>
  );
}
