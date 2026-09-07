import { definePlugin, PanelSection, PanelSectionRow } from "@decky/ui";
import { useState } from "react";
import ConfigEditor from "./components/ConfigEditor";

export default definePlugin(() => {
  const configPath = "/home/deck/.config/SLSsteam/config.yaml";

  return {
    name: "SLSConfig Decky",
    content: (
      <PanelSection title="SLS Steam Configuration">
        <PanelSectionRow>
          <ConfigEditor configPath={configPath} />
        </PanelSectionRow>
      </PanelSection>
    ),
    onDismount() {
      // Cleanup
    },
  };
});
