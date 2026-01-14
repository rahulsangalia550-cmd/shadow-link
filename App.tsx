
import React, { useState, useEffect } from 'react';
import { UserProfile, Contact } from './types';
import { getOrCreateIdentity, clearIdentity, updateIdentity } from './services/identityService';
import ChatWindow from './components/ChatWindow';
import SettingsModal from './components/SettingsModal';
import { Menu, X, Plus, UserPlus } from 'lucide-react';

const INITIAL_CONTACTS: Contact[] = [
  { id: 'SHDW-K9X2-P1Q7', name: 'SafeNode Alpha', status: 'secure', avatarSeed: 'alpha', isAI: true, lastMessage: 'Connection ready.' },
  { id: 'SHDW-RT93-M0L2', name: 'Cipher Ghost', status: 'online', avatarSeed: 'cipher', isAI: true, lastMessage: 'Waiting for handshake...' },
  { id: 'SHDW-V4B1-J7S8', name: 'Zero Witness', status: 'offline', avatarSeed: 'witness', isAI: true },
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactId, setNewContactId] = useState('');

  useEffect(() => {
    const identity = getOrCreateIdentity();
    setUser(identity);
  }, []);

  useEffect(() => {
    // If the selected contact gets blocked, deselect them
    if (selectedContact && user?.blockedUsers?.includes(selectedContact.id)) {
      setSelectedContact(null);
    }
  }, [user, selectedContact]);

  const handleBurn = () => {
    if (confirm("DANGER: This will permanently delete your Shadow ID and all locally stored messages. Continue?")) {
      clearIdentity();
    }
  };

  const handleUpdateProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const handleInvite = () => {
    if (!user) return;
    const link = `https://shadowlink.net/invite/${user.shadowId}`;
    navigator.clipboard.writeText(link).then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      // Fallback if clipboard fails (e.g. non-secure context)
      alert(`Share this secure link: ${link}`);
    });
  };
  
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    // On mobile screens, close the sidebar when a contact is selected to show the chat
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactId.trim()) return;

    // Simulate looking up a contact. In this demo, we create a new "AI" contact with that name/ID.
    const newContact: Contact = {
      id: `SHDW-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: newContactId,
      status: 'secure',
      avatarSeed: newContactId,
      isAI: true,
      lastMessage: 'Secure channel established.'
    };

    setContacts(prev => [newContact, ...prev]);
    setSelectedContact(newContact);
    setNewContactId('');
    setShowAddContact(false);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const filteredContacts = contacts.filter(c => 
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
    !user?.blockedUsers?.includes(c.id)
  );

  if (!user) return <div className="h-screen bg-[#050505] flex items-center justify-center text-emerald-500 mono text-sm tracking-widest animate-pulse">INITIALIZING SECURE LAYER...</div>;

  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden font-sans text-neutral-200 relative">
      {isSettingsOpen && (
        <SettingsModal 
          user={user} 
          contacts={contacts}
          onClose={() => setIsSettingsOpen(false)} 
          onUpdate={handleUpdateProfile} 
        />
      )}
      
      {/* Sidebar Toggle Button (Floating) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-40 p-2 bg-[#121212]/80 backdrop-blur-md border border-white/10 text-white rounded-lg shadow-lg hover:bg-white/10 transition-all lg:hidden"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Toast Notification */}
      {inviteCopied && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-emerald-500 text-black px-4 py-2 rounded-full font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          SECURE LINK COPIED
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-full lg:w-80 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden'} lg:w-80 transition-all duration-300 border-r border-white/5 flex flex-col h-full z-30 bg-[#080808] absolute lg:relative`}>
        {/* Profile Header - Professional */}
        <div className="p-5 pt-16 lg:pt-5 border-b border-white/5 bg-gradient-to-b from-[#0a0a0a] to-[#080808]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md group-hover:bg-emerald-500/30 transition-all duration-500"></div>
                <div className="w-12 h-12 rounded-full bg-[#121212] flex items-center justify-center text-white font-bold text-sm overflow-hidden relative border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                  {user.customAvatar ? (
                    <img src={user.customAvatar} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Me" />
                  ) : user.avatarSeed ? (
                     <img src={`https://picsum.photos/seed/${user.avatarSeed}/100/100`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Me" />
                  ) : user.alias[0]}
                </div>
              </div>
              <div className="overflow-hidden flex flex-col justify-center">
                <h1 className="font-semibold text-white text-sm truncate max-w-[140px] tracking-tight">{user.alias}</h1>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-[10px] text-emerald-500/80 font-mono truncate tracking-wide">SHADOW NET ACTIVE</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
              title="Settings"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative group flex-1">
              <input 
                type="text" 
                placeholder="Search ID or Alias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-white/5 rounded-lg px-4 py-2.5 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-emerald-500/30 focus:bg-[#151515] focus:shadow-[0_0_10px_rgba(16,185,129,0.1)] transition-all"
              />
              <div className="absolute right-3 top-2.5 text-neutral-600 group-focus-within:text-emerald-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2} /></svg>
              </div>
            </div>
            <button 
              onClick={() => setShowAddContact(!showAddContact)}
              className={`p-2.5 rounded-lg border transition-all ${showAddContact ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-[#121212] border-white/5 text-neutral-400 hover:text-white hover:bg-white/5'}`}
              title="Add New Connection"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Contact Inline Form */}
          {showAddContact && (
            <div className="mt-3 p-3 bg-white/5 border border-white/5 rounded-xl animate-in fade-in slide-in-from-top-2">
              <form onSubmit={handleAddContact}>
                <label className="block text-[10px] text-neutral-400 mb-1.5 uppercase tracking-wide font-bold">New Connection</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newContactId}
                    onChange={(e) => setNewContactId(e.target.value)}
                    placeholder="Enter Alias or ID"
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    disabled={!newContactId.trim()}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[9px] text-neutral-600 mt-2">
                  Initiating a handshake will generate a unique keypair for this contact.
                </p>
              </form>
            </div>
          )}
          
          <button 
            onClick={handleInvite}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500/80 hover:text-emerald-500 text-xs font-medium transition-all group"
          >
             <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
             </svg>
             <span>Invite Operative</span>
          </button>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          <div className="px-3 py-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.15em]">Secure Nodes</span>
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
              <span className="text-[9px] text-neutral-600 mono">ONLINE</span>
            </div>
          </div>
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleContactSelect(contact)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                selectedContact?.id === contact.id 
                  ? 'bg-white/5 border border-white/5 shadow-lg' 
                  : 'hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              {selectedContact?.id === contact.id && (
                 <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
              )}
              <div className="relative">
                <img 
                  src={`https://picsum.photos/seed/${contact.avatarSeed}/80/80`} 
                  className={`w-11 h-11 rounded-lg bg-neutral-800 transition-all duration-300 object-cover ${selectedContact?.id === contact.id ? 'ring-2 ring-emerald-500/20' : 'grayscale-[0.5] group-hover:grayscale-0 opacity-80 group-hover:opacity-100'}`}
                  alt="Avatar"
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ring-2 ring-[#0a0a0a] flex items-center justify-center ${contact.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : contact.status === 'secure' ? 'bg-blue-500' : 'bg-neutral-600'}`}>
                   {contact.status === 'secure' && <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                </div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className={`text-sm font-medium truncate transition-colors ${selectedContact?.id === contact.id ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>{contact.name}</h3>
                  <span className={`text-[9px] mono font-medium transition-opacity ${selectedContact?.id === contact.id ? 'text-emerald-500 opacity-100' : 'text-neutral-600 opacity-0 group-hover:opacity-100'}`}>
                     {contact.status === 'secure' ? 'E2EE' : 'TLS'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate group-hover:text-neutral-400 transition-colors">
                  {contact.lastMessage || 'Link established...'}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-[#0a0a0a] border-t border-white/5 space-y-2">
          {/* Removed Support Button */}
          <button 
            onClick={handleBurn}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-600 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all font-semibold text-xs uppercase tracking-wider group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors"></div>
            <svg className="w-4 h-4 group-hover:animate-pulse relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" strokeWidth={2} /><path d="M9.879 16.121A3 3 0 1012.015 11L11 14l-1.121 2.121z" strokeWidth={2} /></svg>
            <span className="relative z-10">Burn Identity</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative bg-[#050505] shadow-[inset_10px_0_20px_-10px_rgba(0,0,0,0.5)]">
        <ChatWindow contact={selectedContact} user={user} />
      </main>

      {/* Connection Quality Overlay (Visual only) */}
      {!user.privacy.anonymousMode && (
        <div className="fixed bottom-4 right-4 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 pointer-events-none z-50 animate-in fade-in slide-in-from-bottom-2 shadow-2xl">
          <div className="flex gap-0.5 items-end h-3">
            <div className="w-0.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <div className="w-0.5 h-2.5 bg-emerald-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-0.5 h-full bg-emerald-500 rounded-full animate-pulse delay-150"></div>
            <div className="w-0.5 h-2 bg-emerald-500 rounded-full animate-pulse delay-100"></div>
          </div>
          <span className="text-[10px] text-neutral-400 font-medium tracking-tight mono">SHADOW RELAY • 14ms</span>
        </div>
      )}
    </div>
  );
};

export default App;
