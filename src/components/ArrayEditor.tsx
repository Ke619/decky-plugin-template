import { Field, TextField, Button } from "@decky/ui";

interface ArrayEditorProps {
  label: string;
  description?: string;
  items: (string | number)[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
}

export default function ArrayEditor({
  label,
  description,
  items,
  onAdd,
  onRemove,
  onChange,
}: ArrayEditorProps) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <Field label={label}>
        {description && (
          <p style={{ fontSize: "12px", color: "var(--steam-color-text-muted)", marginBottom: "8px" }}>
            {description}
          </p>
        )}
        {items.map((item, index) => (
          <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "5px", alignItems: "center" }}>
            <TextField
              value={String(item)}
              onChange={(e) => onChange(index, e.target.value)}
              style={{ flex: 1 }}
            />
            <Button onClick={() => onRemove(index)} style={{ flexShrink: 0 }}>✕</Button>
          </div>
        ))}
        <Button onClick={onAdd} style={{ marginTop: "5px" }}>➕ Add</Button>
      </Field>
    </div>
  );
}
