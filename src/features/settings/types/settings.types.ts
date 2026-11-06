export type NotificationSettingItem = {
  key: string;
  title: string;
  description: string;
  value: boolean;
};

export type NotificationSettingsSection = {
  id: string;
  label: string;
  keys: string[];
};

export type AccountDeletionPreview = {
  userId: number;
  user: {
    name: string;
    email: string | null;
    phone: string | null;
    username: string | null;
  };
  dataToBeDeleted: Record<string, number>;
};

export type AccountDeletionPreviewResponse = {
  ok: true;
  preview: AccountDeletionPreview;
};
