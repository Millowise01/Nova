"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import { Drawer, DrawerBody, DrawerClose, DrawerHeader, DrawerTitle } from "@nova/ui";

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

  return (
    <DrawerContext.Provider value={{ isOpen, content, options, openDrawer, closeDrawer }}>
      {children}
      <Drawer open={isOpen} onClose={closeDrawer} side={options.position ?? "right"}>
        {(options.title || options.showClose) && (
          <DrawerHeader>
            {options.title ? <DrawerTitle>{options.title}</DrawerTitle> : <div />}
            {options.showClose && <DrawerClose onClose={closeDrawer} />}
          </DrawerHeader>
        )}
        <DrawerBody>{content}</DrawerBody>
      </Drawer>
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) throw new Error("useDrawer must be used within DrawerProvider");
  return context;
}
