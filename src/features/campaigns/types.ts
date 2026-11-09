export type InAppCampaign = {
  id: number;
  title: string;
  designId: number | null;
  htmlContent: string | null;
};

export type CampaignDesign = {
  id: number;
  title: string;
  htmlContent: string;
};
