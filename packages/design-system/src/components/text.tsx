import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type CSSProperties,
} from "react";

import { cn } from "@nova/utils";

import { typography, type TypographyRole } from "../tokens/typography";

const fontFamilyVar: Record<string, string> = {
  sans: "var(--font-sans)",
  display: "var(--font-display)",
  mono: "var(--font-mono)",
};

/** Sensible default HTML element per role — override via the `as` prop. */
const defaultElement: Record<TypographyRole, ElementType> = {
  display1: "h1",
  display2: "h1",
  heading1: "h1",
  heading2: "h2",
  heading3: "h3",
  heading4: "h4",
  bodyLarge: "p",
  bodyBase: "p",
  bodySmall: "p",
  caption: "span",
  label: "span",
  overline: "span",
};

export interface TextProps extends Omit<ComponentPropsWithoutRef<"p">, "style"> {
  /** Typography role — see packages/design-system/src/tokens/typography.ts */
  variant: TypographyRole;
  /** Override the rendered element (defaults per-role, e.g. heading1 -> h1). */
  as?: ElementType;
  style?: CSSProperties;
}

/**
 * Base text component. Applies the exact Phase 2 Enterprise Design System
 * type scale (Section 2) from `typography.scale` — font-size, line-height,
 * weight, letter-spacing, and family all come from the token, never a raw
 * utility class, so there's one place to change if the scale changes.
 *
 * Prefer the semantic exports below (Heading1, BodyBase, Caption, ...) in
 * component code; use Text directly only when the role is dynamic.
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { variant, as, className, style, children, ...props },
  ref,
) {
  const Component = as ?? defaultElement[variant];
  const scale = typography.scale[variant];

  return (
    <Component
      ref={ref}
      className={cn("m-0", className)}
      style={{
        fontFamily: fontFamilyVar[scale.fontFamily] ?? fontFamilyVar.sans,
        fontSize: scale.fontSize,
        lineHeight: scale.lineHeight,
        fontWeight: scale.fontWeight,
        letterSpacing: scale.letterSpacing,
        ...("textTransform" in scale ? { textTransform: scale.textTransform } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
});

type SemanticTextProps = Omit<TextProps, "variant">;

export const Display1 = forwardRef<HTMLElement, SemanticTextProps>((props, ref) => (
  <Text ref={ref} variant="display1" {...props} />
));
Display1.displayName = "Display1";

export const Display2 = forwardRef<HTMLElement, SemanticTextProps>((props, ref) => (
  <Text ref={ref} variant="display2" {...props} />
));
Display2.displayName = "Display2";

export const Heading1 = forwardRef<HTMLElement, SemanticTextProps>((props, ref) => (
  <Text ref={ref} variant="heading1" {...props} />
));
Heading1.displayName = "Heading1";

export const Heading2 = forwardRef<HTMLElement, SemanticTextProps>((props, ref) => (
  <Text ref={ref} variant="heading2" {...props} />
));
Heading2.displayName = "Heading2";

export const Heading3 = forwardRef<HTMLElement, SemanticTextProps>((props, ref) => (
  <Text ref={ref} variant="heading3" {...props} />
));
Heading3.displayName = "Heading3";

export const Heading4 = forwardRef<HTMLElement, SemanticTextProps>((props, ref) => (
  <Text ref={ref} variant="heading4" {...props} />
));
Heading4.displayName = "Heading4";

export const BodyLarge = forwardRef<HTMLElement, SemanticTextProps>((props, ref) => (
  <Text ref={ref} variant="bodyLarge" {...props} />
));
BodyLarge.displayName = "BodyLarge";

export const BodyBase = forwardRef<HTMLElement, SemanticTextProps>((props, ref) => (
  <Text ref={ref} variant="bodyBase" {...props} />
));
BodyBase.displayName = "BodyBase";

export const BodySmall = forwardRef<HTMLElement, SemanticTextProps>((props, ref) => (
  <Text ref={ref} variant="bodySmall" {...props} />
));
BodySmall.displayName = "BodySmall";

export const Caption = forwardRef<HTMLElement, SemanticTextProps>((props, ref) => (
  <Text ref={ref} variant="caption" {...props} />
));
Caption.displayName = "Caption";

export const Label = forwardRef<HTMLElement, SemanticTextProps>((props, ref) => (
  <Text ref={ref} variant="label" {...props} />
));
Label.displayName = "Label";

export const Overline = forwardRef<HTMLElement, SemanticTextProps>((props, ref) => (
  <Text ref={ref} variant="overline" {...props} />
));
Overline.displayName = "Overline";
