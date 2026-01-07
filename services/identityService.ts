
import { UserProfile, PrivacySettings, ChatSettings, CallSettings, StorageSettings, SocialSettings, NotificationSettings, GeneralSettings, SecurityPreferences, AdvancedSettings, GroupSettings } from '../types';

const STORAGE_KEY = 'shadowlink_identity';

const DEFAULT_PRIVACY: PrivacySettings = {
  lastSeen: 'everyone',
  onlineStatus: 'everyone',
  profilePhoto: 'everyone',
  about: 'everyone',
  readReceipts: true,
  typingIndicator: true,
  anonymousMode: false,
  usernameDiscovery: true
};

const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  wallpaper: '#0d0d0d', // Default dark gray
  theme: 'dark',
  fontSize: 'medium',
  autoDeleteTimer: 0
};

const DEFAULT_CALL_SETTINGS: CallSettings = {
  voiceCallsEnabled: true,
  videoCallsEnabled: true,
  lowDataMode: false,
  callQuality: 'auto',
  autoSwitchToVoice: true
};

const DEFAULT_STORAGE: StorageSettings = {
  autoDownloadWifi: true,
  autoDownloadMobile: false,
  mediaQuality: 'standard',
  dataSaver: false
};

const DEFAULT_SOCIAL: SocialSettings = {
  syncContacts: false
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  messages: true,
  calls: true,
  groups: true,
  sound: 'default',
  vibrate: true,
  doNotDisturb: false,
  dndStartTime: '22:00',
  dndEndTime: '07:00'
};

const DEFAULT_GENERAL: GeneralSettings = {
  language: 'en',
  autoTranslate: false,
  translationTarget: 'en',
  timezone: 'auto',
  timeFormat: '24h',
  dateFormat: 'YYYY-MM-DD'
};

const DEFAULT_SECURITY_PREFS: SecurityPreferences = {
  appLock: false,
  biometric: false,
  screenshotProtection: true,
  incognitoKeyboard: true
};

const DEFAULT_ADVANCED: AdvancedSettings = {
  multiDevice: true,
  aiSpamProtection: true,
  abuseSensitivity: 'medium',
  hateSpeechSensitivity: 'medium'
};

const DEFAULT_GROUP_SETTINGS: GroupSettings = {
  supergroupsEnabled: false,
  invitePermission: 'everyone',
  managedGroups: [
    { id: 'grp-1', name: 'Shadow Operatives', members: 1542, role: 'owner', isSupergroup: false }
  ]
};

export const generateShadowId = (): string => {
  const segments = [
    Math.random().toString(36).substring(2, 6).toUpperCase(),
    Math.random().toString(36).substring(2, 6).toUpperCase(),
    Math.random().toString(36).substring(2, 6).toUpperCase()
  ];
  return `SHDW-${segments.join('-')}`;
};

export const getOrCreateIdentity = (): UserProfile => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    
    // Migration logic for moved settings could go here, but defaults merge handles basic missing keys
    // If usernameDiscovery was in advanced in the stored JSON, we might want to check it, 
    // but for simplicity we'll just use the default privacy value if not present in privacy object.
    
    return {
      website: '',
      email: '',
      emailVerified: false,
      phoneNumber: '',
      twoFactorEnabled: false,
      blockedUsers: [],
      // Ensure username exists for migrated profiles
      username: parsed.username || (parsed.alias ? parsed.alias.toLowerCase().replace(/\s+/g, '_') : `agent_${Math.floor(Math.random() * 10000)}`),
      ...parsed,
      personalMessage: parsed.personalMessage || 'Available',
      bio: (parsed.bio === 'ShadowLink Operative' || parsed.bio === undefined) ? 'Shadow Link Operative' : parsed.bio,
      privacy: { ...DEFAULT_PRIVACY, ...parsed.privacy },
      chatSettings: { ...DEFAULT_CHAT_SETTINGS, ...parsed.chatSettings },
      callSettings: { ...DEFAULT_CALL_SETTINGS, ...parsed.callSettings },
      storage: { ...DEFAULT_STORAGE, ...parsed.storage },
      social: { ...DEFAULT_SOCIAL, ...parsed.social },
      notifications: { ...DEFAULT_NOTIFICATIONS, ...parsed.notifications },
      general: { ...DEFAULT_GENERAL, ...parsed.general },
      securityPreferences: { ...DEFAULT_SECURITY_PREFS, ...parsed.securityPreferences },
      advanced: { ...DEFAULT_ADVANCED, ...parsed.advanced },
      groupSettings: { ...DEFAULT_GROUP_SETTINGS, ...parsed.groupSettings }
    };
  }

  const newIdentity: UserProfile = {
    shadowId: generateShadowId(),
    alias: `Ghost_${Math.floor(Math.random() * 9000) + 1000}`,
    username: `operative_${Math.floor(Math.random() * 9000) + 1000}`,
    avatarSeed: Math.random().toString(36).substring(7),
    personalMessage: 'Available',
    createdAt: Date.now(),
    bio: 'Shadow Link Operative',
    website: '',
    email: '',
    emailVerified: false,
    phoneNumber: '',
    twoFactorEnabled: false,
    privacy: DEFAULT_PRIVACY,
    chatSettings: DEFAULT_CHAT_SETTINGS,
    callSettings: DEFAULT_CALL_SETTINGS,
    storage: DEFAULT_STORAGE,
    social: DEFAULT_SOCIAL,
    notifications: DEFAULT_NOTIFICATIONS,
    general: DEFAULT_GENERAL,
    securityPreferences: DEFAULT_SECURITY_PREFS,
    advanced: DEFAULT_ADVANCED,
    groupSettings: DEFAULT_GROUP_SETTINGS,
    blockedUsers: []
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newIdentity));
  return newIdentity;
};

export const updateIdentity = (updates: Partial<UserProfile>): UserProfile => {
  const current = getOrCreateIdentity();
  const updated = { ...current, ...updates };
  
  if (updates.privacy) updated.privacy = { ...current.privacy, ...updates.privacy };
  if (updates.chatSettings) updated.chatSettings = { ...current.chatSettings, ...updates.chatSettings };
  if (updates.callSettings) updated.callSettings = { ...current.callSettings, ...updates.callSettings };
  if (updates.storage) updated.storage = { ...current.storage, ...updates.storage };
  if (updates.social) updated.social = { ...current.social, ...updates.social };
  if (updates.notifications) updated.notifications = { ...current.notifications, ...updates.notifications };
  if (updates.general) updated.general = { ...current.general, ...updates.general };
  if (updates.securityPreferences) updated.securityPreferences = { ...current.securityPreferences, ...updates.securityPreferences };
  if (updates.advanced) updated.advanced = { ...current.advanced, ...updates.advanced };
  if (updates.groupSettings) updated.groupSettings = { ...current.groupSettings, ...updates.groupSettings };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const clearIdentity = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};