import type { ReactNode } from "react";

import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";

interface EditorDialogProps {
  title: string;
  description: ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isDisabled?: boolean;
  onSubmit: () => void;
  children: ReactNode;
}

export default function EditorDialog({
  title,
  description,
  isOpen,
  setIsOpen,
  isDisabled,
  onSubmit,
  children,
}: EditorDialogProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel
        isDisabled={isDisabled}
        onSubmit={(event) => {
          event.preventDefault();
          if (isDisabled) return;
          onSubmit();
          setIsOpen(false);
        }}
      >
        <Title>{title}</Title>
        <Text>{description}</Text>
        {children}
      </DialogPanel>
    </Dialog>
  );
}
