import { ToggleField } from "@decky/ui";

interface ToggleSwitchProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function ToggleSwitch({ label, description, value, onChange }: ToggleSwitchProps) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <ToggleField label={label} checked={value} onChange={onChange} />
      {description && (
        <p style={{ fontSize: "12px", color: "var(--steam-color-text-muted)", margin: "4px 0 0 30px" }}>
          {description}
        </p>
      )}
    </div>
  );
}
