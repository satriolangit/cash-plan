"use client";

import { cn } from "@/lib/utils";
import {
  type ReactNode,
  type RefObject,
  type ReactElement,
  useRef,
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
  isValidElement,
  cloneElement,
} from "react";

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLElement | null>;
}

const PopoverContext = createContext<PopoverContextType>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
});

function usePopover() {
  return useContext(PopoverContext);
}

interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

function Popover({ children, open: controlledOpen, onOpenChange, defaultOpen = false }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = useCallback(
    (value: boolean) => {
      onOpenChange?.(value);
      setUncontrolledOpen(value);
    },
    [onOpenChange]
  );
  const triggerRef = useRef<HTMLElement>(null);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

function PopoverTrigger({ children, asChild }: PopoverTriggerProps) {
  const { setOpen, open, triggerRef } = usePopover();

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ onClick?: React.MouseEventHandler; ref?: unknown }>;
    return cloneElement(child, {
      ref: (node: HTMLElement | null) => {
        if (node) {
          triggerRef.current = node;
          const origRef = (child as unknown as { ref?: unknown }).ref;
          if (typeof origRef === "function") {
            (origRef as (node: HTMLElement | null) => void)(node);
          } else if (origRef && typeof origRef === "object" && "current" in origRef) {
            (origRef as { current: HTMLElement | null }).current = node;
          }
        }
      },
      onClick: (e: React.MouseEvent) => {
        const origOnClick = child.props?.onClick;
        if (origOnClick) origOnClick(e);
        if (!e.defaultPrevented) {
          setOpen(!open);
        }
      },
    });
  }

  return (
    <button ref={triggerRef as RefObject<HTMLButtonElement>} type="button" onClick={() => setOpen(!open)}>
      {children}
    </button>
  );
}

interface PopoverContentProps {
  children: ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}

function PopoverContent({ children, className, align = "center" }: PopoverContentProps) {
  const { open, setOpen, triggerRef } = usePopover();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  const alignClass = align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute top-full mt-2 z-50 min-w-[220px] rounded-xl border border-border bg-white p-3 shadow-lg",
        alignClass,
        className
      )}
    >
      {children}
    </div>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
