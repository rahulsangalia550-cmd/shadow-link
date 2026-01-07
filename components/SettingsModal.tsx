
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Contact, ActiveSession, PrivacySettings, ChatSettings, CallSettings, StorageSettings, SocialSettings, NotificationSettings, GeneralSettings, SecurityPreferences, AdvancedSettings, GroupSettings } from '../types';
import { updateIdentity, clearIdentity } from '../services/identityService';

interface SettingsModalProps {
  user: UserProfile;
  contacts: Contact[];
  onClose: () => void;
  onUpdate: (user: UserProfile) => void;
}

const TABS = [
  { id: 'profile', label: 'Identity', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'chats', label: 'Chat Settings', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { id: 'groups', label: 'Groups', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'general', label: 'General', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
  { id: 'calls', label: 'Call Settings', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
  { id: 'notifications', label: 'Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { id: 'privacy', label: 'Privacy', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'account', label: 'Account', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'advanced', label: 'System', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'support', label: 'Help & Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
];

const MOCK_SESSIONS: ActiveSession[] = [
  { id: 'sess-1', device: 'Shadow Link Desktop', location: 'Encrypted Node (Local)', ip: '127.0.0.1', lastActive: Date.now(), current: true },
  { id: 'sess-2', device: 'Mobile Relay Alpha', location: 'Frankfurt, DE', ip: '88.192.X.X', lastActive: Date.now() - 3600000, current: false },
  { id: 'sess-3', device: 'Web Terminal', location: 'Singapore, SG', ip: '103.21.X.X', lastActive: Date.now() - 86400000, current: false },
];

const PRIVACY_OPTIONS = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'contacts', label: 'My Contacts' },
  { value: 'nobody', label: 'Nobody' },
];

const WALLPAPER_OPTIONS = [
  { color: '#030303', label: 'Void' },
  { color: '#051a14', label: 'Emerald' },
  { color: '#0f172a', label: 'Midnight' },
  { color: '#2a0a18', label: 'Crimson' },
  { color: '#171717', label: 'Neutral' },
  { color: '#1e1b4b', label: 'Indigo' },
  { color: '#312e81', label: 'Deep Blue' },
];

const SUPPORTED_LANGUAGES = [
  { code: 'af', name: 'Afrikaans' },
  { code: 'sq', name: 'Shqip (Albanian)' },
  { code: 'am', name: 'አማርኛ (Amharic)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'hy', name: 'Հայերեն (Armenian)' },
  { code: 'az', name: 'Azərbaycan (Azerbaijani)' },
  { code: 'eu', name: 'Euskara (Basque)' },
  { code: 'be', name: 'Беларуская (Belarusian)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'bs', name: 'Bosanski (Bosnian)' },
  { code: 'bg', name: 'Български (Bulgarian)' },
  { code: 'ca', name: 'Català (Catalan)' },
  { code: 'ceb', name: 'Cebuano' },
  { code: 'ny', name: 'Chichewa' },
  { code: 'zh', name: '中文 (Simplified)' },
  { code: 'zh-TW', name: '中文 (Traditional)' },
  { code: 'co', name: 'Corsu (Corsican)' },
  { code: 'hr', name: 'Hrvatski (Croatian)' },
  { code: 'cs', name: 'Čeština (Czech)' },
  { code: 'da', name: 'Dansk (Danish)' },
  { code: 'nl', name: 'Nederlands (Dutch)' },
  { code: 'en', name: 'English' },
  { code: 'eo', name: 'Esperanto' },
  { code: 'et', name: 'Eesti (Estonian)' },
  { code: 'tl', name: 'Filipino' },
  { code: 'fi', name: 'Suomi (Finnish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'fy', name: 'Frysk (Frisian)' },
  { code: 'gl', name: 'Galego (Galician)' },
  { code: 'ka', name: 'ქართული (Georgian)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'el', name: 'Ελληνικά (Greek)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'ht', name: 'Kreyòl ayisyen (Haitian Creole)' },
  { code: 'ha', name: 'Hausa' },
  { code: 'haw', name: 'Ōlelo Hawaiʻi (Hawaiian)' },
  { code: 'he', name: 'עברית (Hebrew)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'hmn', name: 'Hmong' },
  { code: 'hu', name: 'Magyar (Hungarian)' },
  { code: 'is', name: 'Íslenska (Icelandic)' },
  { code: 'ig', name: 'Igbo' },
  { code: 'id', name: 'Bahasa Indonesia (Indonesian)' },
  { code: 'ga', name: 'Gaeilge (Irish)' },
  { code: 'it', name: 'Italiano (Italian)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'jw', name: 'Basa Jawa (Javanese)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'kk', name: 'Қазақ тілі (Kazakh)' },
  { code: 'km', name: 'ខ្មែរ (Khmer)' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'ku', name: 'Kurdî (Kurdish - Kurmanji)' },
  { code: 'ky', name: 'Кыргызча (Kyrgyz)' },
  { code: 'lo', name: 'ລາວ (Lao)' },
  { code: 'la', name: 'Latina (Latin)' },
  { code: 'lv', name: 'Latviešu (Latvian)' },
  { code: 'lt', name: 'Lietuvių (Lithuanian)' },
  { code: 'lb', name: 'Lëtzebuergesch (Luxembourgish)' },
  { code: 'mk', name: 'Македонски (Macedonian)' },
  { code: 'mg', name: 'Malagasy' },
  { code: 'ms', name: 'Bahasa Melayu (Malay)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'mt', name: 'Malti (Maltese)' },
  { code: 'mi', name: 'Māori' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'mn', name: 'Монгол (Mongolian)' },
  { code: 'my', name: 'မြန်မာစာ (Myanmar/Burmese)' },
  { code: 'ne', name: 'नेपाली (Nepali)' },
  { code: 'no', name: 'Norsk (Norwegian)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'ps', name: 'پښتو (Pashto)' },
  { code: 'fa', name: 'فارسی (Persian)' },
  { code: 'pl', name: 'Polski (Polish)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ro', name: 'Română (Romanian)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'sm', name: 'Samoan' },
  { code: 'gd', name: 'Gàidhlig (Scots Gaelic)' },
  { code: 'sr', name: 'Српски (Serbian)' },
  { code: 'st', name: 'Sesotho' },
  { code: 'sn', name: 'Shona' },
  { code: 'sd', name: 'سنڌي (Sindhi)' },
  { code: 'si', name: 'සිංහල (Sinhala)' },
  { code: 'sk', name: 'Slovenčina (Slovak)' },
  { code: 'sl', name: 'Slovenščina (Slovenian)' },
  { code: 'so', name: 'Soomaali (Somali)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'su', name: 'Basa Sunda (Sundanese)' },
  { code: 'sw', name: 'Kiswahili (Swahili)' },
  { code: 'sv', name: 'Svenska (Swedish)' },
  { code: 'tg', name: 'Тоҷикӣ (Tajik)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'tt', name: 'Татарча (Tatar)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'th', name: 'ไทย (Thai)' },
  { code: 'tr', name: 'Türkçe (Turkish)' },
  { code: 'tk', name: 'Türkmençe (Turkmen)' },
  { code: 'uk', name: 'Українська (Ukrainian)' },
  { code: 'ur', name: 'اردو (Urdu)' },
  { code: 'ug', name: 'ئۇيغۇرچە (Uyghur)' },
  { code: 'uz', name: 'Oʻzbek (Uzbek)' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)' },
  { code: 'cy', name: 'Cymraeg (Welsh)' },
  { code: 'xh', name: 'isiXhosa (Xhosa)' },
  { code: 'yi', name: 'ייִדיש (Yiddish)' },
  { code: 'yo', name: 'Yorùbá (Yoruba)' },
  { code: 'zu', name: 'isiZulu (Zulu)' }
];

const SettingsModal: React.FC<SettingsModalProps> = ({ user, contacts, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const [formData, setFormData] = useState<UserProfile>(user);
  const [tempPin, setTempPin] = useState(user.pin || '');
  const [sessions, setSessions] = useState<ActiveSession[]>(MOCK_SESSIONS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [blockConfirmContact, setBlockConfirmContact] = useState<Contact | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkUsername = async () => {
      const u = formData.username;
      if (!u) {
        setUsernameStatus('idle');
        return;
      }
      
      if (u === user.username) {
        setUsernameStatus('idle');
        return;
      }
      
      if (u.length < 3) {
         setUsernameStatus('idle'); 
         return;
      }

      setUsernameStatus('checking');
      
      // Simulate network request latency
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const reserved = ['admin', 'administrator', 'root', 'system', 'sys', 'shadow', 'shadowlink', 'mod', 'moderator', 'support', 'help', 'info', 'contact', 'security', 'bot', 'ai', 'null', 'undefined', 'test', 'user'];
      const isTaken = reserved.includes(u.toLowerCase());
      
      setUsernameStatus(isTaken ? 'taken' : 'available');
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username, user.username]);
  
  const handleSave = () => {
    if (usernameStatus === 'taken') return;

    const updated = updateIdentity({
      ...formData,
      pin: formData.twoFactorEnabled ? tempPin : undefined
    });
    onUpdate(updated);
    onClose();
  };
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const regenerateAvatar = () => {
    setFormData(prev => ({ 
      ...prev, 
      avatarSeed: Math.random().toString(36).substring(7),
      customAvatar: undefined // Reset custom avatar when regenerating
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, customAvatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Audio file too large. Please select a file under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            customSoundData: reader.result as string,
            customSoundName: file.name,
            sound: 'custom' // Auto-select the new custom sound
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, customAvatar: undefined }));
  };

  const handleRevokeSession = (id: string) => {
    if (confirm("Are you sure you want to terminate this active session?")) {
      setSessions(prev => prev.filter(s => s.id !== id));
      setToastMessage("Session terminated securely");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleRevokeAllOtherSessions = () => {
    if (confirm('Are you sure you want to terminate all other active sessions? You will be logged out on other devices.')) {
      setSessions(prev => prev.filter(s => s.current));
      setToastMessage("All other sessions terminated");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSendVerification = () => {
    if (!formData.email) return;
    setIsVerifying(true);
    // Simulate API call
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSent(true);
      // For demonstration, we'll mark it as verified after a "click" simulation
      setFormData(prev => ({ ...prev, emailVerified: true }));
    }, 1500);
  };

  const handleWebsiteBlur = () => {
    if (formData.website && !formData.website.startsWith('http')) {
      setFormData(prev => ({ ...prev, website: `https://${prev.website}` }));
    }
  };

  const handleInviteFriends = () => {
    const link = `https://shadowlink.net/invite/${formData.shadowId}`;
    navigator.clipboard.writeText(link);
    setToastMessage("Invite link copied");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updatePrivacy = (key: keyof PrivacySettings, value: any) => setFormData(p => ({...p, privacy: { ...p.privacy, [key]: value }}));
  const updateChatSettings = (key: keyof ChatSettings, value: any) => setFormData(p => ({...p, chatSettings: { ...p.chatSettings, [key]: value }}));
  const updateCallSettings = (key: keyof CallSettings, value: any) => setFormData(p => ({...p, callSettings: { ...p.callSettings, [key]: value }}));
  const updateNotifications = (key: keyof NotificationSettings, value: any) => setFormData(p => ({...p, notifications: { ...p.notifications, [key]: value }}));
  const updateGeneral = (key: keyof GeneralSettings, value: any) => setFormData(p => ({...p, general: { ...p.general, [key]: value }}));
  const updateSecurityPrefs = (key: keyof SecurityPreferences, value: any) => setFormData(p => ({...p, securityPreferences: { ...p.securityPreferences, [key]: value }}));
  const updateAdvanced = (key: keyof AdvancedSettings, value: any) => setFormData(p => ({...p, advanced: { ...p.advanced, [key]: value }}));
  const updateGroupSettings = (key: keyof GroupSettings, value: any) => setFormData(p => ({...p, groupSettings: { ...p.groupSettings, [key]: value }}));

  const handleBlockUser = (contact: Contact) => {
    setBlockConfirmContact(contact);
  };

  const confirmBlock = () => {
    if (blockConfirmContact) {
        setFormData(prev => ({
            ...prev,
            blockedUsers: [...(prev.blockedUsers || []), blockConfirmContact.id]
        }));
        setBlockConfirmContact(null);
    }
  };

  const handleUnblockUser = (id: string) => {
    setFormData(prev => ({
        ...prev,
        blockedUsers: (prev.blockedUsers || []).filter(uid => uid !== id)
    }));
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup = {
      id: `grp-${Date.now()}`,
      name: newGroupName,
      members: 1,
      role: 'owner' as const,
      isSupergroup: formData.groupSettings.supergroupsEnabled
    };
    setFormData(prev => ({
      ...prev,
      groupSettings: {
        ...prev.groupSettings,
        managedGroups: [...prev.groupSettings.managedGroups, newGroup]
      }
    }));
    setNewGroupName('');
    setShowCreateGroup(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm("Are you sure? This will disband the group for all members.")) {
      setFormData(prev => ({
        ...prev,
        groupSettings: {
          ...prev.groupSettings,
          managedGroups: prev.groupSettings.managedGroups.filter(g => g.id !== groupId)
        }
      }));
    }
  };

  // Premium Style Classes
  const inputClass = "w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:bg-[#151515] focus:ring-1 focus:ring-emerald-500/20 transition-all";
  const sectionTitleClass = "text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-3 mb-6";
  const toggleClass = (active: boolean) => `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${active ? 'bg-emerald-600' : 'bg-neutral-800'}`;
  const toggleDotClass = (active: boolean) => `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`;

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-24 h-24 rounded-full bg-[#121212] flex items-center justify-center border border-white/10 overflow-hidden relative transition-all group-hover:border-emerald-500/50">
                      {formData.customAvatar ? (
                         <img src={formData.customAvatar} className="w-full h-full object-cover" alt="Profile" />
                      ) : formData.avatarSeed ? (
                         <img src={`https://picsum.photos/seed/${formData.avatarSeed}/200/200`} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                         <span className="text-2xl font-bold text-neutral-600">{formData.alias[0]}</span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                         <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                   </div>
                   <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1.5 border-2 border-[#080808]">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                   </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp"
                />
                <div className="flex items-center gap-3">
                   <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-all hover:border-white/20"
                   >
                      {formData.customAvatar ? 'Change Photo' : 'Upload Photo'}
                   </button>
                   
                   {formData.customAvatar ? (
                        <button 
                            onClick={handleRemovePhoto} 
                            className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 rounded-lg text-xs font-medium text-red-500 transition-all hover:border-red-500/30"
                        >
                            Remove
                        </button>
                   ) : (
                        <button 
                            onClick={regenerateAvatar} 
                            className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/10 rounded-lg text-xs font-medium text-emerald-500 transition-all hover:border-emerald-500/30"
                        >
                            Regenerate
                        </button>
                   )}
                </div>
             </div>

             <div className="space-y-6">
                <h4 className={sectionTitleClass}>Identity Details</h4>
                <div>
                   <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Alias</label>
                   <input 
                      type="text" 
                      value={formData.alias}
                      onChange={(e) => setFormData({...formData, alias: e.target.value})}
                      className={inputClass}
                   />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Username</label>
                   <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-neutral-500 text-sm font-mono">@</span>
                        </div>
                       <input 
                          type="text" 
                          value={formData.username || ''} 
                          onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                          className={`${inputClass} pl-8 font-mono ${usernameStatus === 'taken' ? 'border-red-500/50 focus:border-red-500' : usernameStatus === 'available' ? 'border-emerald-500/50 focus:border-emerald-500' : ''}`}
                          placeholder="username"
                          maxLength={30}
                       />
                       <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          {usernameStatus === 'checking' && (
                             <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                          )}
                          {usernameStatus === 'available' && (
                             <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          )}
                          {usernameStatus === 'taken' && (
                             <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          )}
                       </div>
                   </div>
                   <div className="min-h-[20px]">
                       {usernameStatus === 'taken' ? (
                          <p className="text-[10px] text-red-500 mt-1.5 ml-1">Username is unavailable</p>
                       ) : usernameStatus === 'available' ? (
                          <p className="text-[10px] text-emerald-500 mt-1.5 ml-1">Username available</p>
                       ) : (
                          <p className="text-[10px] text-neutral-500 mt-1.5 ml-1">Only alphanumeric characters and underscores allowed.</p>
                       )}
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Bio</label>
                   <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className={`${inputClass} min-h-[100px] resize-none`}
                      maxLength={150}
                      placeholder="Write a short bio..."
                   />
                   <div className="text-right">
                      <span className="text-[10px] text-neutral-500">{formData.bio.length}/150</span>
                   </div>
                </div>
                 <div>
                   <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Shadow ID</label>
                   <div className="flex gap-2">
                      <input 
                         type="text" 
                         value={formData.shadowId}
                         disabled
                         className={`${inputClass} opacity-50 font-mono`}
                      />
                      <button 
                        onClick={() => {
                            navigator.clipboard.writeText(formData.shadowId);
                        }}
                        className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-400 hover:text-white transition-colors"
                      >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'chats':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="space-y-6">
                <h4 className={sectionTitleClass}>Appearance</h4>
                <div>
                   <label className="block text-sm text-neutral-300 mb-3">Wallpaper</label>
                   <div className="grid grid-cols-4 gap-3">
                      {WALLPAPER_OPTIONS.map(opt => (
                         <button 
                            key={opt.color}
                            onClick={() => updateChatSettings('wallpaper', opt.color)}
                            className={`h-16 rounded-xl border-2 transition-all relative overflow-hidden group ${formData.chatSettings.wallpaper === opt.color ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-transparent opacity-70 hover:opacity-100 hover:border-white/10'}`}
                            style={{ backgroundColor: opt.color }}
                            title={opt.label}
                         >
                            {formData.chatSettings.wallpaper === opt.color && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black/40 rounded-full p-1">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                </div>
                            )}
                         </button>
                      ))}

                       {/* Custom Color Picker Tile */}
                       <label className={`h-16 rounded-xl border-2 border-white/5 bg-[#121212] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-[#1a1a1a] transition-all relative group overflow-hidden ${!WALLPAPER_OPTIONS.some(o => o.color === formData.chatSettings.wallpaper) ? 'border-emerald-500' : ''}`} title="Custom Color">
                            <input 
                                type="color" 
                                value={formData.chatSettings.wallpaper} 
                                onChange={(e) => updateChatSettings('wallpaper', e.target.value)}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            {!WALLPAPER_OPTIONS.some(o => o.color === formData.chatSettings.wallpaper) && (
                                 <div className="absolute inset-0 opacity-20" style={{ backgroundColor: formData.chatSettings.wallpaper }}></div>
                            )}
                            <div className="relative z-0 flex flex-col items-center">
                                <svg className="w-5 h-5 text-neutral-400 group-hover:text-emerald-500 transition-colors mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-[9px] text-neutral-500 group-hover:text-neutral-300 uppercase tracking-wider font-medium">Custom</span>
                            </div>
                            {!WALLPAPER_OPTIONS.some(o => o.color === formData.chatSettings.wallpaper) && (
                                <div className="absolute top-1 right-1">
                                    <div className="bg-emerald-500 rounded-full w-2 h-2 shadow-sm"></div>
                                </div>
                            )}
                        </label>
                   </div>
                </div>
                <div>
                    <label className="block text-sm text-neutral-300 mb-2">Theme</label>
                    <div className="grid grid-cols-3 gap-2 bg-[#121212] p-1 rounded-xl border border-white/10">
                        {['light', 'dark', 'system'].map(t => (
                            <button
                                key={t}
                                onClick={() => updateChatSettings('theme', t)}
                                className={`py-2 text-xs font-medium rounded-lg capitalize transition-all ${formData.chatSettings.theme === t ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm text-neutral-300 mb-2">Font Size</label>
                    <div className="flex items-center justify-between bg-[#121212] px-4 py-3 rounded-xl border border-white/10">
                        <span className="text-xs text-neutral-500">A</span>
                        <input 
                            type="range" 
                            min="0" 
                            max="2" 
                            step="1"
                            value={formData.chatSettings.fontSize === 'small' ? 0 : formData.chatSettings.fontSize === 'medium' ? 1 : 2}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                updateChatSettings('fontSize', val === 0 ? 'small' : val === 1 ? 'medium' : 'large');
                            }}
                            className="w-32 accent-emerald-500"
                        />
                        <span className="text-lg text-white font-bold">A</span>
                    </div>
                </div>
             </div>

             <div className="pt-6 border-t border-white/5 space-y-6">
                <h4 className={sectionTitleClass}>Privacy</h4>
                <div>
                   <label className="block text-sm text-neutral-300 mb-2">Auto-Delete Messages (Default)</label>
                   <select 
                      value={formData.chatSettings.autoDeleteTimer}
                      onChange={(e) => updateChatSettings('autoDeleteTimer', parseInt(e.target.value))}
                      className={inputClass}
                   >
                      <option value={0}>Off</option>
                      <option value={60}>1 Minute</option>
                      <option value={3600}>1 Hour</option>
                      <option value={86400}>24 Hours</option>
                      <option value={604800}>7 Days</option>
                   </select>
                   <p className="text-[11px] text-neutral-500 mt-2">Messages will be automatically removed from both devices after this time.</p>
                </div>
             </div>
          </div>
        );

      case 'groups':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="space-y-6">
                 <div className="flex items-center justify-between">
                     <h4 className={`${sectionTitleClass} mb-0 border-none pb-0`}>Managed Groups</h4>
                     <button 
                        onClick={() => setShowCreateGroup(!showCreateGroup)}
                        className="text-emerald-500 hover:text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                     >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Group
                     </button>
                 </div>

                 {showCreateGroup && (
                     <div className="p-4 bg-white/5 rounded-xl border border-white/5 animate-in fade-in slide-in-from-top-2">
                         <label className="block text-xs text-neutral-400 mb-2">Group Name</label>
                         <div className="flex gap-2">
                             <input 
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className={inputClass}
                                placeholder="Enter group name..."
                             />
                             <button 
                                onClick={handleCreateGroup}
                                disabled={!newGroupName.trim()}
                                className="px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
                             >
                                Create
                             </button>
                         </div>
                     </div>
                 )}

                 <div className="space-y-3">
                     {formData.groupSettings.managedGroups.map(group => (
                         <div key={group.id} className="p-4 bg-[#121212] border border-white/5 rounded-xl flex items-center justify-between hover:border-emerald-500/20 transition-colors group">
                             <div>
                                 <h5 className="text-sm font-bold text-white flex items-center gap-2">
                                    {group.name}
                                    {group.isSupergroup && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 font-mono">SUPERGROUP</span>}
                                 </h5>
                                 <p className="text-xs text-neutral-500 mt-1">{group.members} Members • Role: <span className="capitalize text-neutral-300">{group.role}</span></p>
                             </div>
                             <button 
                                onClick={() => handleDeleteGroup(group.id)}
                                className="p-2 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                title="Disband Group"
                             >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                         </div>
                     ))}
                     {formData.groupSettings.managedGroups.length === 0 && (
                         <div className="text-center py-8 text-neutral-600 text-sm">
                             No active groups. Create one to begin.
                         </div>
                     )}
                 </div>
             </div>

             <div className="pt-6 border-t border-white/5 space-y-6">
                <h4 className={sectionTitleClass}>Group Configuration</h4>
                <div className="flex items-center justify-between py-2">
                     <div>
                         <label className="block text-sm text-neutral-300 font-medium">Allow Supergroups</label>
                         <p className="text-[11px] text-neutral-500">Enable support for groups >1000 members</p>
                     </div>
                     <button onClick={() => updateGroupSettings('supergroupsEnabled', !formData.groupSettings.supergroupsEnabled)} className={toggleClass(formData.groupSettings.supergroupsEnabled)}>
                         <span className={toggleDotClass(formData.groupSettings.supergroupsEnabled)} />
                     </button>
                </div>
                 <div>
                   <label className="block text-sm text-neutral-300 mb-2">Who can invite me to groups?</label>
                   <select 
                      value={formData.groupSettings.invitePermission}
                      onChange={(e) => updateGroupSettings('invitePermission', e.target.value)}
                      className={inputClass}
                   >
                      <option value="everyone">Everyone</option>
                      <option value="contacts">My Contacts</option>
                      <option value="nobody">Nobody</option>
                   </select>
                </div>
             </div>
          </div>
        );
      
      case 'general':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="space-y-6">
                <h4 className={sectionTitleClass}>Localization</h4>
                <div>
                   <label className="block text-sm text-neutral-300 mb-2">Language</label>
                   <select 
                     value={formData.general.language} 
                     onChange={(e) => updateGeneral('language', e.target.value)}
                     className={inputClass}
                   >
                     {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                     ))}
                   </select>
                </div>
                <div className="flex items-center justify-between py-2">
                   <label className="text-sm text-neutral-300 font-medium">Auto-Translate Messages</label>
                   <button onClick={() => updateGeneral('autoTranslate', !formData.general.autoTranslate)} className={toggleClass(formData.general.autoTranslate)}>
                      <span className={toggleDotClass(formData.general.autoTranslate)} />
                   </button>
                </div>
                {formData.general.autoTranslate && (
                  <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                     <label className="block text-xs text-neutral-400 mb-1.5">Translate To</label>
                     <select 
                       value={formData.general.translationTarget || formData.general.language} 
                       onChange={(e) => updateGeneral('translationTarget', e.target.value)}
                       className={inputClass}
                     >
                       {SUPPORTED_LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                       ))}
                     </select>
                  </div>
                )}
             </div>
             
             <div className="space-y-6 pt-6 border-t border-white/5">
                <h4 className={sectionTitleClass}>Time & Date</h4>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-neutral-300 mb-2">Time Format</label>
                        <select value={formData.general.timeFormat} onChange={(e) => updateGeneral('timeFormat', e.target.value)} className={inputClass}>
                            <option value="12h">12-Hour (AM/PM)</option>
                            <option value="24h">24-Hour (Military)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-neutral-300 mb-2">Date Format</label>
                        <select value={formData.general.dateFormat} onChange={(e) => updateGeneral('dateFormat', e.target.value)} className={inputClass}>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                </div>
             </div>

             <div className="space-y-6 pt-6 border-t border-white/5">
                <h4 className={sectionTitleClass}>Social</h4>
                <button 
                    onClick={handleInviteFriends}
                    className="w-full py-3 bg-[#121212] hover:bg-[#1a1a1a] border border-white/10 hover:border-emerald-500/50 rounded-xl text-neutral-200 hover:text-white font-bold text-sm transition-all uppercase tracking-wider flex items-center justify-center gap-2 group shadow-lg shadow-black/20"
                >
                     <svg className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                     </svg>
                     Invite Friends
                </button>
                <p className="text-center text-[10px] text-neutral-500 mt-3">
                     Share your secure invite link to add operatives to your network.
                </p>
             </div>
          </div>
        );

      case 'calls':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="space-y-6">
                <h4 className={sectionTitleClass}>Permissions</h4>
                <div className="flex items-center justify-between py-2">
                     <div>
                         <label className="block text-sm text-neutral-300 font-medium">Voice Calls</label>
                         <p className="text-[11px] text-neutral-500">Allow incoming encrypted voice calls</p>
                     </div>
                     <button onClick={() => updateCallSettings('voiceCallsEnabled', !formData.callSettings.voiceCallsEnabled)} className={toggleClass(formData.callSettings.voiceCallsEnabled)}>
                         <span className={toggleDotClass(formData.callSettings.voiceCallsEnabled)} />
                     </button>
                </div>
                <div className="flex items-center justify-between py-2">
                     <div>
                         <label className="block text-sm text-neutral-300 font-medium">Video Calls</label>
                         <p className="text-[11px] text-neutral-500">Allow incoming encrypted video calls</p>
                     </div>
                     <button onClick={() => updateCallSettings('videoCallsEnabled', !formData.callSettings.videoCallsEnabled)} className={toggleClass(formData.callSettings.videoCallsEnabled)}>
                         <span className={toggleDotClass(formData.callSettings.videoCallsEnabled)} />
                     </button>
                </div>
             </div>

             <div className="pt-6 border-t border-white/5 space-y-6">
                <h4 className={sectionTitleClass}>Bandwidth & Quality</h4>
                <div className="flex items-center justify-between py-2">
                     <div>
                         <label className="block text-sm text-neutral-300 font-medium">Low Data Mode</label>
                         <p className="text-[11px] text-neutral-500">Reduce data usage during calls</p>
                     </div>
                     <button onClick={() => updateCallSettings('lowDataMode', !formData.callSettings.lowDataMode)} className={toggleClass(formData.callSettings.lowDataMode)}>
                         <span className={toggleDotClass(formData.callSettings.lowDataMode)} />
                     </button>
                </div>
                
                <div>
                   <label className="block text-sm text-neutral-300 mb-2">Call Quality Preference</label>
                   <select 
                      value={formData.callSettings.callQuality}
                      onChange={(e) => updateCallSettings('callQuality', e.target.value)}
                      className={inputClass}
                   >
                      <option value="auto">Auto (Recommended)</option>
                      <option value="high">High Definition</option>
                      <option value="low">Data Saver</option>
                   </select>
                </div>

                <div className="flex items-center justify-between py-2">
                     <div>
                         <label className="block text-sm text-neutral-300 font-medium">Auto-Switch to Voice</label>
                         <p className="text-[11px] text-neutral-500">Switch to audio-only when connection is poor</p>
                     </div>
                     <button onClick={() => updateCallSettings('autoSwitchToVoice', !formData.callSettings.autoSwitchToVoice)} className={toggleClass(formData.callSettings.autoSwitchToVoice)}>
                         <span className={toggleDotClass(formData.callSettings.autoSwitchToVoice)} />
                     </button>
                </div>
             </div>
          </div>
        );

      case 'notifications':
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-6">
                    <h4 className={sectionTitleClass}>Notifications</h4>
                    {['messages', 'calls', 'groups'].map((key) => (
                        <div key={key} className="flex items-center justify-between py-2 capitalize">
                            <label className="text-sm text-neutral-300 font-medium">{key}</label>
                            <button 
                                onClick={() => updateNotifications(key as keyof NotificationSettings, !formData.notifications[key as keyof NotificationSettings])} 
                                className={toggleClass(!!formData.notifications[key as keyof NotificationSettings])}
                            >
                                <span className={toggleDotClass(!!formData.notifications[key as keyof NotificationSettings])} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-white/5 space-y-6">
                    <h4 className={sectionTitleClass}>Sound & Vibration</h4>
                     <div className="flex items-center justify-between py-2">
                        <label className="text-sm text-neutral-300 font-medium">Vibrate</label>
                         <button onClick={() => updateNotifications('vibrate', !formData.notifications.vibrate)} className={toggleClass(formData.notifications.vibrate)}>
                            <span className={toggleDotClass(formData.notifications.vibrate)} />
                         </button>
                    </div>
                     <div>
                        <label className="block text-sm text-neutral-300 mb-2">Notification Sound</label>
                        <select 
                            value={formData.notifications.sound} 
                            onChange={(e) => updateNotifications('sound', e.target.value)} 
                            className={inputClass}
                        >
                            <option value="default">Default (Shadow Ping)</option>
                            <option value="stealth">Stealth (Silent)</option>
                            <option value="chirp">Chirp</option>
                            <option value="custom">{formData.notifications.customSoundName ? `Custom: ${formData.notifications.customSoundName}` : 'Custom Sound'}</option>
                        </select>
                        
                        <div className="mt-3">
                             <input 
                                type="file" 
                                ref={audioInputRef} 
                                className="hidden" 
                                accept="audio/*" 
                                onChange={handleAudioChange}
                            />
                            <button 
                                onClick={() => audioInputRef.current?.click()}
                                className="text-xs text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1.5 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                Upload Custom Sound
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                     <div className="flex items-center justify-between mb-4">
                        <div>
                            <label className="block text-sm text-neutral-200 font-medium">Do Not Disturb</label>
                            <p className="text-[11px] text-neutral-500 mt-0.5">Silence all notifications during specified hours</p>
                        </div>
                        <button onClick={() => updateNotifications('doNotDisturb', !formData.notifications.doNotDisturb)} className={toggleClass(formData.notifications.doNotDisturb)}>
                            <span className={toggleDotClass(formData.notifications.doNotDisturb)} />
                        </button>
                    </div>
                    {formData.notifications.doNotDisturb && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                             <div>
                                <label className="block text-xs text-neutral-400 mb-1.5">Start Time</label>
                                <input 
                                    type="time" 
                                    value={formData.notifications.dndStartTime}
                                    onChange={(e) => updateNotifications('dndStartTime', e.target.value)}
                                    className={inputClass}
                                />
                             </div>
                             <div>
                                <label className="block text-xs text-neutral-400 mb-1.5">End Time</label>
                                <input 
                                    type="time" 
                                    value={formData.notifications.dndEndTime}
                                    onChange={(e) => updateNotifications('dndEndTime', e.target.value)}
                                    className={inputClass}
                                />
                             </div>
                        </div>
                    )}
                </div>
            </div>
        );

      case 'privacy':
        return (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-6">
                    <h4 className={sectionTitleClass}>Visibility</h4>
                    {[
                        { key: 'lastSeen', label: 'Last Seen' },
                        { key: 'onlineStatus', label: 'Online Status' },
                        { key: 'profilePhoto', label: 'Profile Photo' },
                        { key: 'about', label: 'About Info' },
                    ].map(({ key, label }) => (
                         <div key={key} className="flex items-center justify-between py-2">
                             <label className="text-sm text-neutral-300 font-medium">{label}</label>
                             <select 
                                value={(formData.privacy as any)[key]} 
                                onChange={(e) => updatePrivacy(key as keyof PrivacySettings, e.target.value)}
                                className="bg-[#121212] border border-white/10 text-xs text-white rounded-lg px-3 py-1.5 focus:border-emerald-500/50 outline-none w-36"
                             >
                                 {PRIVACY_OPTIONS.map(opt => (
                                     <option key={opt.value} value={opt.value}>{opt.label}</option>
                                 ))}
                             </select>
                         </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                     <h4 className={sectionTitleClass}>Messaging Privacy</h4>
                     <div className="flex items-center justify-between py-2">
                        <div>
                             <label className="block text-sm text-neutral-300 font-medium">Read Receipts</label>
                             <p className="text-[11px] text-neutral-500">Show a blue checkmark when messages are seen by the recipient</p>
                        </div>
                        <button onClick={() => updatePrivacy('readReceipts', !formData.privacy.readReceipts)} className={toggleClass(formData.privacy.readReceipts)}>
                            <span className={toggleDotClass(formData.privacy.readReceipts)} />
                        </button>
                     </div>
                     <div className="flex items-center justify-between py-2">
                        <label className="text-sm text-neutral-300 font-medium">Typing Indicator</label>
                        <button onClick={() => updatePrivacy('typingIndicator', !formData.privacy.typingIndicator)} className={toggleClass(formData.privacy.typingIndicator)}>
                            <span className={toggleDotClass(formData.privacy.typingIndicator)} />
                        </button>
                     </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                             <label className="block text-sm text-neutral-300 font-medium">Anonymous Mode</label>
                             <p className="text-[11px] text-neutral-500">Hide IP and routing info from peers</p>
                        </div>
                        <button onClick={() => updatePrivacy('anonymousMode', !formData.privacy.anonymousMode)} className={toggleClass(formData.privacy.anonymousMode)}>
                            <span className={toggleDotClass(formData.privacy.anonymousMode)} />
                        </button>
                     </div>
                </div>

                 <div className="pt-6 border-t border-white/5">
                    <h4 className={sectionTitleClass}>Blocked Contacts</h4>
                    <div className="space-y-2">
                        {formData.blockedUsers?.length > 0 ? (
                            formData.blockedUsers.map(blockedId => {
                                const contact = contacts.find(c => c.id === blockedId);
                                return (
                                    <div key={blockedId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-sm text-neutral-300">{contact?.name || blockedId}</span>
                                        <button 
                                            onClick={() => handleUnblockUser(blockedId)}
                                            className="text-xs text-red-400 hover:text-red-300 font-medium"
                                        >
                                            Unblock
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-xs text-neutral-500 italic">No blocked contacts.</p>
                        )}
                        
                        <div className="mt-4">
                            <label className="block text-xs text-neutral-400 mb-2">Block a user</label>
                             <select 
                                onChange={(e) => {
                                    if(e.target.value) {
                                        const c = contacts.find(contact => contact.id === e.target.value);
                                        if(c) handleBlockUser(c);
                                        e.target.value = "";
                                    }
                                }}
                                className={inputClass}
                            >
                                <option value="">Select a contact...</option>
                                {contacts.filter(c => !formData.blockedUsers?.includes(c.id)).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                 </div>
             </div>
        );

      case 'security':
        return (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="space-y-6">
                    <h4 className={sectionTitleClass}>App Security</h4>
                    <div className="flex items-center justify-between py-2">
                         <label className="text-sm text-neutral-300 font-medium">App Lock</label>
                         <button onClick={() => updateSecurityPrefs('appLock', !formData.securityPreferences.appLock)} className={toggleClass(formData.securityPreferences.appLock)}>
                             <span className={toggleDotClass(formData.securityPreferences.appLock)} />
                         </button>
                    </div>
                     <div className="flex items-center justify-between py-2">
                         <label className="text-sm text-neutral-300 font-medium">Biometric Unlock</label>
                         <button onClick={() => updateSecurityPrefs('biometric', !formData.securityPreferences.biometric)} className={toggleClass(formData.securityPreferences.biometric)}>
                             <span className={toggleDotClass(formData.securityPreferences.biometric)} />
                         </button>
                    </div>
                     <div className="flex items-center justify-between py-2">
                         <div>
                            <label className="block text-sm text-neutral-300 font-medium">Screen Protection</label>
                            <p className="text-[11px] text-neutral-500">Block screenshots and task switcher preview</p>
                         </div>
                         <button onClick={() => updateSecurityPrefs('screenshotProtection', !formData.securityPreferences.screenshotProtection)} className={toggleClass(formData.securityPreferences.screenshotProtection)}>
                             <span className={toggleDotClass(formData.securityPreferences.screenshotProtection)} />
                         </button>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/5 space-y-6">
                    <h4 className={sectionTitleClass}>Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between mb-4">
                         <label className="text-sm text-neutral-300 font-medium">Enable 2FA</label>
                         <button onClick={() => setFormData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))} className={toggleClass(formData.twoFactorEnabled)}>
                             <span className={toggleDotClass(formData.twoFactorEnabled)} />
                         </button>
                    </div>
                    {formData.twoFactorEnabled && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                             <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Set PIN</label>
                             <input 
                                type="password" 
                                value={tempPin}
                                onChange={(e) => setTempPin(e.target.value)}
                                placeholder="Enter 6-digit PIN"
                                maxLength={6}
                                className={`${inputClass} font-mono tracking-widest text-center text-lg`}
                             />
                        </div>
                    )}
                 </div>
             </div>
        );

      case 'account':
        return (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-6">
                    <h4 className={sectionTitleClass}>Contact Info</h4>
                    <div>
                        <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Phone Number</label>
                        <input 
                            type="tel" 
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                            className={inputClass}
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Email Address</label>
                         <div className="flex gap-2">
                             <input 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className={inputClass}
                                placeholder="name@example.com"
                            />
                            {formData.email && !formData.emailVerified && (
                                <button 
                                    onClick={handleSendVerification}
                                    disabled={isVerifying || verificationSent}
                                    className="px-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-emerald-500/20 disabled:opacity-50"
                                >
                                    {isVerifying ? 'Sending...' : verificationSent ? 'Sent' : 'Verify'}
                                </button>
                            )}
                            {formData.emailVerified && (
                                <div className="px-3 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                         </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-6">
                    <h4 className={sectionTitleClass}>Public Profile</h4>
                     <div>
                        <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Website</label>
                        <div className="flex gap-2">
                            <input 
                                type="url" 
                                value={formData.website}
                                onChange={(e) => setFormData({...formData, website: e.target.value})}
                                onBlur={handleWebsiteBlur}
                                className={inputClass}
                                placeholder="https://example.com"
                            />
                            {formData.website && (
                                <a 
                                    href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-3 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-400 hover:text-white transition-colors"
                                    title="Open Website"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Shadow Link Profile</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={`https://shadowlink.net/u/${formData.username}`}
                                readOnly
                                className={`${inputClass} opacity-60 font-mono text-xs`}
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://shadowlink.net/u/${formData.username}`);
                                    setToastMessage("Profile link copied");
                                    setTimeout(() => setToastMessage(null), 3000);
                                }}
                                className="px-3 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-400 hover:text-white transition-colors"
                                title="Copy Profile Link"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                        </div>
                         <p className="text-[10px] text-neutral-500 mt-1.5">Share this link to let others find you securely.</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <h4 className={sectionTitleClass}>Active Sessions</h4>
                    <div className="space-y-3">
                        {sessions.map(session => (
                            <div key={session.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h5 className="text-sm text-white font-medium">{session.device}</h5>
                                        {session.current && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">CURRENT</span>}
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">{session.location} • {session.ip}</p>
                                    <p className="text-[10px] text-neutral-600 mt-0.5">Last active: {new Date(session.lastActive).toLocaleString()}</p>
                                </div>
                                {!session.current && (
                                    <button 
                                        onClick={() => handleRevokeSession(session.id)}
                                        className="text-red-500 hover:text-red-400 p-2"
                                        title="Revoke Session"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={handleRevokeAllOtherSessions}
                        className="w-full mt-4 py-2.5 text-xs font-bold text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl transition-all uppercase tracking-wide"
                    >
                        Terminate All Other Sessions
                    </button>
                 </div>

                <div className="pt-6 border-t border-white/5">
                    <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest border-b border-red-500/20 pb-3 mb-6">Danger Zone</h4>
                    <button 
                        onClick={() => {
                            if(confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                                clearIdentity();
                            }
                        }}
                        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold text-sm rounded-xl transition-all uppercase tracking-wider"
                    >
                        Delete Account
                    </button>
                </div>
             </div>
        );

      case 'advanced':
        return (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-6">
                    <h4 className={sectionTitleClass}>System</h4>
                    <div className="flex items-center justify-between py-2">
                         <div>
                             <label className="block text-sm text-neutral-300 font-medium">Multi-Device Support</label>
                             <p className="text-[11px] text-neutral-500">Sync messages across linked devices</p>
                         </div>
                         <button onClick={() => updateAdvanced('multiDevice', !formData.advanced.multiDevice)} className={toggleClass(formData.advanced.multiDevice)}>
                             <span className={toggleDotClass(formData.advanced.multiDevice)} />
                         </button>
                    </div>
                     <div className="flex items-center justify-between py-2">
                         <div>
                             <label className="block text-sm text-neutral-300 font-medium">AI Spam Protection</label>
                             <p className="text-[11px] text-neutral-500">Use local AI to filter malicious messages</p>
                         </div>
                         <button onClick={() => updateAdvanced('aiSpamProtection', !formData.advanced.aiSpamProtection)} className={toggleClass(formData.advanced.aiSpamProtection)}>
                             <span className={toggleDotClass(formData.advanced.aiSpamProtection)} />
                         </button>
                    </div>
                    
                    {formData.advanced.aiSpamProtection && (
                        <div className="animate-in fade-in slide-in-from-top-2 pt-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-neutral-400 mb-1.5">Abuse Sensitivity</label>
                                <select 
                                    value={formData.advanced.abuseSensitivity} 
                                    onChange={(e) => updateAdvanced('abuseSensitivity', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-xs text-neutral-400 mb-1.5">Hate Speech Sensitivity</label>
                                <select 
                                    value={formData.advanced.hateSpeechSensitivity} 
                                    onChange={(e) => updateAdvanced('hateSpeechSensitivity', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                    <h4 className={sectionTitleClass}>Data & Storage</h4>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex justify-between text-sm text-neutral-300 mb-2">
                            <span>Storage Usage</span>
                            <span>156 MB</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full w-[15%] bg-emerald-500"></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-neutral-500 mt-2">
                            <span>Photos: 120MB</span>
                            <span>Database: 36MB</span>
                        </div>
                    </div>
                    <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-300 text-sm font-medium rounded-xl transition-colors">
                        Clear Cache
                    </button>
                </div>
             </div>
        );
      
      case 'support':
        return (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Shadow Link Support</h3>
                    <p className="text-sm text-neutral-400 max-w-xs mx-auto">Need assistance with your secure node? Our operatives are standing by.</p>
                </div>

                <div className="space-y-3">
                    <button className="w-full p-4 bg-[#121212] border border-white/10 hover:border-emerald-500/50 rounded-xl text-left transition-all group">
                        <h5 className="text-sm font-bold text-white group-hover:text-emerald-500 transition-colors">Documentation</h5>
                        <p className="text-xs text-neutral-500 mt-1">Read the operative manual and security protocols.</p>
                    </button>
                     <button className="w-full p-4 bg-[#121212] border border-white/10 hover:border-emerald-500/50 rounded-xl text-left transition-all group">
                        <h5 className="text-sm font-bold text-white group-hover:text-emerald-500 transition-colors">Submit Ticket</h5>
                        <p className="text-xs text-neutral-500 mt-1">Report a bug or security vulnerability.</p>
                    </button>
                     <button className="w-full p-4 bg-[#121212] border border-white/10 hover:border-emerald-500/50 rounded-xl text-left transition-all group">
                        <h5 className="text-sm font-bold text-white group-hover:text-emerald-500 transition-colors">Contact Encrypted Support</h5>
                        <p className="text-xs text-neutral-500 mt-1">Direct line to Level 3 support agents.</p>
                    </button>
                </div>
             </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#080808] w-full md:w-[90vw] lg:max-w-5xl h-full shadow-2xl overflow-hidden flex flex-col md:flex-row border-r border-white/10 relative animate-in slide-in-from-left duration-300 md:rounded-r-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sidebar Navigation */}
        <div className={`w-full md:w-64 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-white/5 flex flex-col h-full ${!mobileMenuOpen ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 flex items-center gap-3">
             <button 
                onClick={onClose}
                className="p-2 -ml-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Go Back"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </button>
             <div>
               <h3 className="text-lg font-bold text-white tracking-tight">Settings</h3>
               <p className="text-xs text-neutral-500 mt-1">Configure your secure node</p>
             </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === tab.id ? 'bg-emerald-500/10 text-emerald-500 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/5">
            <div className="text-[10px] text-neutral-600 font-mono text-center">
              SHADOW LINK v2.4.0
              <br/>Build: ARK1
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 bg-[#080808] relative h-full ${mobileMenuOpen ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
             {/* Mobile Back Header */}
             <div className="md:hidden pb-6 mb-6 border-b border-white/5 flex items-center gap-3">
                 <button 
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
                 >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                 </button>
                 <span className="font-bold text-lg text-white">{TABS.find(t => t.id === activeTab)?.label}</span>
             </div>
            {renderContent()}
          </div>
          
          <div className="p-6 border-t border-white/5 bg-[#0c0c0e]/80 backdrop-blur-lg flex justify-end gap-4 sticky bottom-0 z-10">
            <button 
                onClick={handleSave} 
                disabled={usernameStatus === 'taken' || usernameStatus === 'checking'}
                className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:-translate-y-0.5 border border-emerald-500/20 w-full md:w-auto"
            >
              {usernameStatus === 'checking' ? 'Checking...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-4 py-2 rounded-full font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                {toastMessage}
            </div>
        )}

        {/* Block Confirmation Dialog */}
        {blockConfirmContact && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-[#121212] border border-red-500/20 rounded-xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Block {blockConfirmContact.name}?
                    </h3>
                    <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                        They will not be able to send you messages or call you. This action will hide them from your contact list.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button 
                            onClick={() => setBlockConfirmContact(null)} 
                            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmBlock} 
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/40"
                        >
                            Confirm Block
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;