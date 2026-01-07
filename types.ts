
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isEncrypted: boolean;
  expiresIn?: number; // in seconds
  type: 'text' | 'system';
}

export interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  status: 'online' | 'offline' | 'secure';
  avatarSeed: string;
  isAI?: boolean;
}

export interface PrivacySettings {
  lastSeen: 'everyone' | 'contacts' | 'nobody';
  onlineStatus: 'everyone' | 'contacts' | 'nobody';
  profilePhoto: 'everyone' | 'contacts' | 'nobody';
  about: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  typingIndicator: boolean;
  anonymousMode: boolean;
  usernameDiscovery: boolean;
}

export interface ChatSettings {
  wallpaper: string;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  autoDeleteTimer: number;
}

export interface CallSettings {
  voiceCallsEnabled: boolean;
  videoCallsEnabled: boolean;
  lowDataMode: boolean;
  callQuality: 'auto' | 'low' | 'high';
  autoSwitchToVoice: boolean;
}

export interface StorageSettings {
  autoDownloadWifi: boolean;
  autoDownloadMobile: boolean;
  mediaQuality: 'low' | 'standard' | 'high';
  dataSaver: boolean;
}

export interface SocialSettings {
  syncContacts: boolean;
}

export interface NotificationSettings {
  messages: boolean;
  calls: boolean;
  groups: boolean;
  sound: string;
  customSoundData?: string;
  customSoundName?: string;
  vibrate: boolean;
  doNotDisturb: boolean;
  dndStartTime?: string;
  dndEndTime?: string;
}

export interface GeneralSettings {
  language: string;
  autoTranslate: boolean;
  translationTarget?: string;
  timezone: 'auto' | 'utc' | 'local';
  timeFormat: '12h' | '24h';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
}

export interface SecurityPreferences {
  appLock: boolean;
  biometric: boolean;
  screenshotProtection: boolean;
  incognitoKeyboard: boolean;
}

export interface AdvancedSettings {
  multiDevice: boolean;
  aiSpamProtection: boolean;
  abuseSensitivity: 'low' | 'medium' | 'high';
  hateSpeechSensitivity: 'low' | 'medium' | 'high';
}

export interface ManagedGroup {
  id: string;
  name: string;
  members: number;
  role: 'owner' | 'admin';
  isSupergroup: boolean;
}

export interface GroupSettings {
  supergroupsEnabled: boolean;
  invitePermission: 'everyone' | 'contacts' | 'nobody';
  managedGroups: ManagedGroup[];
}

export interface UserProfile {
  shadowId: string;
  alias: string;
  username: string;
  avatarSeed: string;
  customAvatar?: string;
  personalMessage: string;
  createdAt: number;
  bio: string;
  website: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  pin?: string;
  privacy: PrivacySettings;
  chatSettings: ChatSettings;
  callSettings: CallSettings;
  storage: StorageSettings;
  social: SocialSettings;
  notifications: NotificationSettings;
  groupSettings: GroupSettings;
  general: GeneralSettings;
  securityPreferences: SecurityPreferences;
  advanced: AdvancedSettings;
  blockedUsers: string[];
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: number;
  current: boolean;
}