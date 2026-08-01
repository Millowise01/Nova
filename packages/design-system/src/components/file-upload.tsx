"use client";

import { useRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@nova/utils";
import { Upload, X, File } from "lucide-react";

export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  helperText?: string;
  error?: string;
  onFilesChange?: (files: File[]) => void;
  maxSize?: number;
  dragDrop?: boolean;
}

export function FileUpload({
  label,
  helperText,
  error,
  onFilesChange,
  maxSize,
  dragDrop: _dragDrop = true,
  className,
  disabled,
  multiple,
  accept,
  ...props
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const arr = Array.from(incoming);
    const valid = maxSize ? arr.filter((f) => f.size <= maxSize) : arr;
    const next = multiple ? [...files, ...valid] : valid;
    setFiles(next);
    onFilesChange?.(next);
  }

  function removeFile(i: number) {
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next);
    onFilesChange?.(next);
  }

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <span
          className={cn(
            "text-sm font-medium text-[color:var(--color-foreground)]",
            disabled && "opacity-50",
          )}
        >
          {label}
        </span>
      )}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]",
          dragging
            ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-subtle)]"
            : error
              ? "border-[color:var(--color-error)] bg-[color:var(--color-error-subtle)]"
              : "border-[color:var(--color-border)] bg-[color:var(--color-muted)] hover:border-[color:var(--color-border-strong)]",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <Upload
          size={24}
          className="text-[color:var(--color-foreground-muted)]"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-medium text-[color:var(--color-foreground)]">
            Drop files here or <span className="text-[color:var(--color-primary)]">browse</span>
          </p>
          {accept && <p className="text-xs text-[color:var(--color-foreground-muted)]">{accept}</p>}
          {maxSize && (
            <p className="text-xs text-[color:var(--color-foreground-muted)]">
              Max {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        disabled={disabled}
        multiple={multiple}
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
        aria-hidden="true"
        tabIndex={-1}
        {...props}
      />

      {files.length > 0 && (
        <ul className="mt-1 space-y-1">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm"
            >
              <File
                size={14}
                className="shrink-0 text-[color:var(--color-foreground-muted)]"
                aria-hidden="true"
              />
              <span className="flex-1 truncate text-[color:var(--color-foreground)]">{f.name}</span>
              <span className="shrink-0 text-xs text-[color:var(--color-foreground-muted)]">
                {(f.size / 1024).toFixed(0)}KB
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${f.name}`}
                className="shrink-0 rounded p-0.5 text-[color:var(--color-foreground-muted)] hover:text-[color:var(--color-error)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]"
              >
                <X size={12} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-xs text-[color:var(--color-error)]">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-[color:var(--color-foreground-muted)]">{helperText}</p>
      )}
    </div>
  );
}
