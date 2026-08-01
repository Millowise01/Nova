"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { Modal } from "@nova/ui";

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

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-5xl",
  };

  return (
    <ModalContext.Provider value={{ isOpen, content, options, openModal, closeModal }}>
      {children}
      {isOpen && content && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="pointer-events-auto flex w-full justify-center">
            <Modal>
              <div
                className={`w-full ${
                  sizeClasses[options.size || "md"]
                } overflow-hidden rounded-2xl border border-[color:var(--ds-border)] bg-[color:var(--ds-elevated)] shadow-2xl`}
              >
                {(options.title || options.showClose) && (
                  <div className="flex items-center justify-between border-b border-[color:var(--ds-border)] px-6 py-4">
                    {options.title ? (
                      <h3 className="text-lg font-semibold text-[color:var(--ds-text)]">
                        {options.title}
                      </h3>
                    ) : (
                      <div />
                    )}
                    {options.showClose && (
                      <button
                        onClick={closeModal}
                        className="text-lg font-bold text-slate-400 transition hover:text-[color:var(--ds-text)]"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
                <div className="px-6 py-4 text-[color:var(--ds-text)]">{content}</div>
              </div>
            </Modal>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
}
