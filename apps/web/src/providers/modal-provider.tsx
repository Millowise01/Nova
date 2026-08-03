"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import { Modal, ModalBody, ModalClose, ModalHeader, ModalTitle } from "@nova/ui";

type ModalOptions = {
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
};

type ModalContextType = {
  isOpen: boolean;
  content: ReactNode | null;
  options: ModalOptions;
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [options, setOptions] = useState<ModalOptions>({});

  const openModal = (newContent: ReactNode, newOptions: ModalOptions = {}) => {
    setContent(newContent);
    setOptions({ showClose: true, size: "md", ...newOptions });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setContent(null);
      setOptions({});
    }, 200);
  };

  return (
    <ModalContext.Provider value={{ isOpen, content, options, openModal, closeModal }}>
      {children}
      <Modal open={isOpen} onClose={closeModal} size={options.size ?? "md"}>
        {(options.title || options.showClose) && (
          <ModalHeader>
            {options.title ? <ModalTitle>{options.title}</ModalTitle> : <div />}
            {options.showClose && <ModalClose onClose={closeModal} />}
          </ModalHeader>
        )}
        <ModalBody>{content}</ModalBody>
      </Modal>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
}
