import { PanelSection, PanelSectionRow } from "@decky/ui";

interface ConfigSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function ConfigSection({ title, children }: ConfigSectionProps) {
  return (
    <PanelSection title={title}>
      <PanelSectionRow>
        <div style={{ padding: "5px 0" }}>{children}</div>
      </PanelSectionRow>
    </PanelSection>
  );
}
