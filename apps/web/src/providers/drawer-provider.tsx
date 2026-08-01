"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { Drawer } from "@nova/ui";

type DrawerOptions = {
  title?: string;
  position?: "left" | "right";
  showClose?: boolean;
};

type DrawerContextType = {
  isOpen: boolean;
  content: ReactNode | null;
  options: DrawerOptions;
  openDrawer: (content: ReactNode, options?: DrawerOptions) => void;
  closeDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [options, setOptions] = useState<DrawerOptions>({});

  const openDrawer = (newContent: ReactNode, newOptions: DrawerOptions = {}) => {
    setContent(newContent);
    setOptions({ position: "right", showClose: true, ...newOptions });
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setTimeout(() => {
      setContent(null);
      setOptions({});
    }, 200);
  };

  const positionClasses = {
    left: "left-0 top-0 bottom-0 border-r",
    right: "right-0 top-0 bottom-0 border-l",
  };

  return (
    <DrawerContext.Provider value={{ isOpen, content, options, openDrawer, closeDrawer }}>
      {children}
      {isOpen && content && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={closeDrawer} />
          <div className="pointer-events-auto relative h-full w-full max-w-md">
            <Drawer>
              <div
                className={`absolute ${
                  positionClasses[options.position || "right"]
                } flex h-full w-full flex-col border-[color:var(--ds-border)] bg-[color:var(--ds-elevated)] shadow-2xl`}
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
                        onClick={closeDrawer}
                        className="text-lg font-bold text-slate-400 transition hover:text-[color:var(--ds-text)]"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
                <div className="flex-1 overflow-y-auto px-6 py-4 text-[color:var(--ds-text)]">
                  {content}
                </div>
              </div>
            </Drawer>
          </div>
        </div>
      )}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) throw new Error("useDrawer must be used within DrawerProvider");
  return context;
}
