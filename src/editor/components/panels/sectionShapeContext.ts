import React from "react";

// ---------------------------------------------------------------------------
// Context — lets rows read the section's current defaultShape without prop drilling
// ---------------------------------------------------------------------------

export const SectionShapeContext = React.createContext<"rect" | "ellipse">(
  "rect",
);
