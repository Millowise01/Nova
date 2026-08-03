import type { Meta, StoryObj } from "@storybook/react";

import { useTheme } from "./themes/provider";
import { colors } from "./tokens/colors";
import { motion } from "./tokens/motion";
import { radius } from "./tokens/radius";
import { shadows } from "./tokens/shadows";
import { space } from "./tokens/spacing";
import { typography } from "./tokens/typography";

/* ── Helpers ──────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "3rem" }}>
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          marginBottom: "1rem",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "0.5rem",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function TokenRow({
  name,
  value,
  preview,
}: {
  name: string;
  value: string;
  preview?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0.5rem 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      {preview}
      <code
        style={{
          fontSize: 12,
          background: "#f3f4f6",
          padding: "2px 6px",
          borderRadius: 4,
          minWidth: 160,
        }}
      >
        {name}
      </code>
      <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

/* ── Color Palette ────────────────────────────────────────────── */
function ColorPalette() {
  const scales = Object.entries(colors) as [string, Record<string | number, string>][];
  return (
    <Section title="Color Palette">
      {scales.map(([scaleName, scale]) => (
        <div key={scaleName} style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "capitalize",
              marginBottom: "0.5rem",
            }}
          >
            {scaleName}
          </h3>
          <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
            {Object.entries(scale).map(([step, hex]) => (
              <div
                key={step}
                title={`${scaleName}.${step}: ${hex}`}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 6,
                  background: hex,
                  border: "1px solid rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 2,
                }}
              >
                <span style={{ fontSize: 9, color: "rgba(0,0,0,0.5)", fontFamily: "monospace" }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Section>
  );
}

/* ── Semantic Colors ──────────────────────────────────────────── */
function SemanticColors() {
  const roles = ["primary", "secondary", "accent", "success", "warning", "error", "info"] as const;
  return (
    <Section title="Semantic Colors (CSS vars — theme-aware)">
      {roles.map((role) => (
        <div
          key={role}
          style={{ display: "flex", gap: "0.25rem", marginBottom: "0.75rem", alignItems: "center" }}
        >
          <span style={{ width: 80, fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>
            {role}
          </span>
          {(
            ["", "-hover", "-active", "-disabled", "-subtle", "-foreground", "-border"] as const
          ).map((suffix) => (
            <div
              key={suffix}
              title={`--color-${role}${suffix}`}
              style={{
                width: 36,
                height: 36,
                borderRadius: 4,
                background: `var(--color-${role}${suffix})`,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            />
          ))}
        </div>
      ))}
    </Section>
  );
}

/* ── Typography ───────────────────────────────────────────────── */
function TypographyScale() {
  return (
    <Section title="Typography Scale">
      {Object.entries(typography.scale).map(([role, styles]) => (
        <div
          key={role}
          style={{
            ...styles,
            fontFamily:
              styles.fontFamily === "display" ? "var(--font-display)" : "var(--font-sans)",
            marginBottom: "0.75rem",
            color: "var(--color-foreground)",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 400,
              color: "#9ca3af",
              fontFamily: "monospace",
              display: "block",
            }}
          >
            {role} — {styles.fontSize} / {styles.fontWeight}
          </span>
          The quick brown fox jumps over the lazy dog
        </div>
      ))}
    </Section>
  );
}

/* ── Spacing ──────────────────────────────────────────────────── */
function SpacingScale() {
  return (
    <Section title="Spacing (8px base grid)">
      {Object.entries(space).map(([alias, value]) => (
        <TokenRow
          key={alias}
          name={`space.${alias}`}
          value={value}
          preview={
            <div
              style={{
                width: value,
                height: 16,
                background: "var(--color-primary)",
                borderRadius: 2,
                minWidth: 2,
              }}
            />
          }
        />
      ))}
    </Section>
  );
}

/* ── Radius ───────────────────────────────────────────────────── */
function RadiusScale() {
  return (
    <Section title="Border Radius">
      {Object.entries(radius).map(([key, value]) => (
        <TokenRow
          key={key}
          name={`radius.${key}`}
          value={value}
          preview={
            <div
              style={{
                width: 48,
                height: 32,
                background: "var(--color-primary-subtle)",
                border: "2px solid var(--color-primary)",
                borderRadius: value,
              }}
            />
          }
        />
      ))}
    </Section>
  );
}

/* ── Shadows ──────────────────────────────────────────────────── */
function ShadowScale() {
  return (
    <Section title="Shadows / Elevation">
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {Object.entries(shadows)
          .filter(([k]) => k !== "inner")
          .map(([key, value]) => (
            <div key={key} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 8,
                  background: "var(--color-surface-raised)",
                  boxShadow: value,
                  marginBottom: "0.5rem",
                }}
              />
              <code style={{ fontSize: 11 }}>{key}</code>
            </div>
          ))}
      </div>
    </Section>
  );
}

/* ── Motion ───────────────────────────────────────────────────── */
function MotionTokens() {
  return (
    <Section title="Motion">
      <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Durations</h3>
      {Object.entries(motion.duration)
        .filter(([k]) => !isNaN(Number(k)))
        .map(([key, value]) => (
          <TokenRow key={key} name={`duration.${key}`} value={value} />
        ))}
      <h3 style={{ fontSize: "0.875rem", fontWeight: 600, margin: "1rem 0 0.5rem" }}>Easings</h3>
      {Object.entries(motion.easing).map(([key, value]) => (
        <TokenRow key={key} name={`easing.${key}`} value={value} />
      ))}
    </Section>
  );
}

/* ── Theme Switcher ───────────────────────────────────────────── */
function ThemeSwitcher() {
  const { themeName, setTheme } = useTheme();
  return (
    <Section title="Theme Switcher">
      <div style={{ display: "flex", gap: "0.75rem" }}>
        {(["light", "dark"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: 8,
              border: `2px solid ${themeName === t ? "var(--color-primary)" : "var(--color-border)"}`,
              background: themeName === t ? "var(--color-primary)" : "var(--color-surface)",
              color:
                themeName === t ? "var(--color-primary-foreground)" : "var(--color-foreground)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <p style={{ marginTop: "1rem", fontSize: 13, color: "var(--color-foreground-muted)" }}>
        Active theme: <strong>{themeName}</strong>. All semantic color swatches above update
        automatically.
      </p>
    </Section>
  );
}

/* ── Token Viewer ─────────────────────────────────────────────── */
function TokenViewer() {
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        padding: "2rem",
        background: "var(--color-background)",
        color: "var(--color-foreground)",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
        Nova Design Tokens
      </h1>
      <p style={{ color: "var(--color-foreground-muted)", marginBottom: "3rem" }}>
        Single source of truth. All tokens are type-safe and consumed via{" "}
        <code>@nova/design-system</code>.
      </p>
      <ThemeSwitcher />
      <ColorPalette />
      <SemanticColors />
      <TypographyScale />
      <SpacingScale />
      <RadiusScale />
      <ShadowScale />
      <MotionTokens />
    </div>
  );
}

/* ── Story config ─────────────────────────────────────────────── */
const meta: Meta = {
  title: "Nova/Design Tokens",
  component: TokenViewer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Complete Nova design token reference. All tokens are exported from `@nova/design-system`.",
      },
    },
  },
};
export default meta;

export const Tokens: StoryObj = {
  render: () => <TokenViewer />,
};
