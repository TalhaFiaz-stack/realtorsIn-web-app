export type WorkingOnItem = {
  id: number;
  kind: "project" | "property";
  title: string;
  subtitle: string | null;
  propertyType: string | null;
};

export type WorkingOnData = {
  projects: WorkingOnItem[];
  properties: WorkingOnItem[];
};
