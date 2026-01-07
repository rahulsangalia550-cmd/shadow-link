
import React, { useState, useRef, useEffect } from 'react';
import { Message, Contact, UserProfile } from '../types';
import { getSecureResponse } from '../services/geminiService';
import { Shield, Send, MoreVertical, Trash2, Lock, EyeOff, CheckCheck, Phone, Video } from 'lucide-react';

interface ChatWindowProps {
  contact: Contact | null;
  user: UserProfile;
}

const formatTimer = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds/60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds/3600)}h`;
  return `${Math.floor(seconds/86400)}d`;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ contact, user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Check for expired messages every second
    const intervalId = setInterval(() => {
      setMessages(prevMessages => {
        const now = Date.now();
        const unexpired = prevMessages.filter(msg => {
          if (!msg.expiresIn) return true;
          const expirationTime = msg.timestamp + (msg.expiresIn * 1000);
          return now < expirationTime;
        });
        
        if (unexpired.length !== prevMessages.length) {
          return unexpired;
        }
        return prevMessages;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (contact) {
      // Load initial system message
      setMessages([
        {
          id: 'sys-1',
          senderId: 'system',
          senderName: 'Shadow Link',
          text: `SECURE HANDSHAKE COMPLETE.\nIdentity Verified: ${contact.id}\nRouting: AES-256 via Shadow Node.`,
          timestamp: Date.now(),
          isEncrypted: true,
          type: 'system'
        }
      ]);
    }
  }, [contact, user.shadowId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !contact) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: user.shadowId,
      senderName: user.alias,
      text: inputValue,
      timestamp: Date.now(),
      isEncrypted: true,
      expiresIn: user.chatSettings.autoDeleteTimer > 0 ? user.chatSettings.autoDeleteTimer : undefined,
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    if (contact.isAI) {
      setIsTyping(true);
      const response = await getSecureResponse(inputValue, contact.name);
      setIsTyping(false);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        senderId: contact.id,
        senderName: contact.name,
        text: response || "Secure link failed.",
        timestamp: Date.now(),
        isEncrypted: true,
        expiresIn: user.chatSettings.autoDeleteTimer > 0 ? user.chatSettings.autoDeleteTimer : undefined,
        type: 'text'
      };
      setMessages(prev => [...prev, aiMsg]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, this would upload the file
      alert(`File attached: ${file.name}\n(File transfer simulation)`);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleVoiceCall = () => {
    alert("Establishing encrypted voice channel...");
  };

  const handleVideoCall = () => {
    alert("Establishing encrypted video feed...");
  };

  const getFontSizeClass = () => {
    switch(user.chatSettings?.fontSize) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const fontSizeClass = getFontSizeClass();
  const wallpaperColor = user.chatSettings?.wallpaper || '#030303';

  if (!contact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#030303] text-neutral-500 p-8 text-center relative overflow-hidden" style={{ backgroundColor: wallpaperColor }}>
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="w-24 h-24 bg-white/5 backdrop-blur-lg rounded-full flex items-center justify-center mb-8 ring-1 ring-white/10 shadow-2xl relative z-10 animate-pulse-slow">
          <svg className="w-10 h-10 text-emerald-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-white mb-3 tracking-tight relative z-10">Shadow Link Secure</h2>
        <p className="max-w-md text-sm text-neutral-500 relative z-10 leading-relaxed">
          Select a secure relay to begin transmission. 
          <br />Your identity is masked. Data is locally encrypted.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full transition-colors duration-500 relative" style={{ backgroundColor: wallpaperColor }}>
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Header - Glassmorphism */}
      <div className="h-16 sm:h-20 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-black/40 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4 pl-14 sm:pl-0">
          
          <div className="relative">
            <img 
              src={`https://picsum.photos/seed/${contact.avatarSeed}/100/100`} 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-white/10 shadow-lg"
              alt="Avatar"
            />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ring-2 ring-[#0a0a0a] ${contact.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : contact.status === 'secure' ? 'bg-blue-500' : 'bg-neutral-600'}`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm tracking-wide">{contact.name}</h3>
            <span className="text-[10px] text-emerald-500/90 mono flex items-center gap-1.5 font-medium">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
               ENCRYPTED CHANNEL
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-neutral-400">
          {user.callSettings.voiceCallsEnabled && (
            <button 
              onClick={handleVoiceCall}
              title="Voice Call" 
              className="p-2.5 hover:bg-white/5 rounded-full hover:text-white transition-colors"
            >
              <Phone className="w-5 h-5" />
            </button>
          )}
          
          {user.callSettings.videoCallsEnabled && (
            <button 
              onClick={handleVideoCall}
              title="Video Call" 
              className="p-2.5 hover:bg-white/5 rounded-full hover:text-white transition-colors"
            >
              <Video className="w-5 h-5" />
            </button>
          )}
          
          <div className="h-5 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>
          
          <button title="E2EE Verified" className="p-2.5 hover:bg-white/5 rounded-full text-emerald-500/80 transition-colors hidden sm:block">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth={1.5} /></svg>
          </button>
          
          <button title="Clear History" onClick={() => setMessages([])} className="p-2.5 hover:bg-red-500/10 rounded-full hover:text-red-400 transition-colors">
             <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={1.5} /></svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 relative z-10 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col group ${msg.type === 'system' ? 'items-center' : msg.senderId === user.shadowId ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4`}>
            {msg.type === 'system' ? (
              <div className="bg-black/40 backdrop-blur-md text-emerald-500/80 text-[10px] uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border border-emerald-900/30 mono my-4 shadow-lg shadow-black/20 text-center leading-relaxed">
                {msg.text}
              </div>
            ) : (
              <>
                <div className={`max-w-[85%] sm:max-w-[70%] px-5 py-3.5 shadow-xl relative backdrop-blur-sm ${
                    msg.senderId === user.shadowId 
                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-[20px] rounded-tr-sm border border-white/10' 
                    : 'bg-white/[0.08] text-neutral-100 rounded-[20px] rounded-tl-sm border border-white/5'
                  }`}>
                  <p className={`${fontSizeClass} leading-relaxed whitespace-pre-wrap`}>{msg.text}</p>
                </div>
                <div className="flex items-center gap-2 mt-1.5 px-1 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                   <span className="text-[10px] text-neutral-400 mono font-medium">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.isEncrypted && (
                    <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth={2} /></svg>
                  )}
                  {/* Read Receipts Indicator */}
                  {msg.senderId === user.shadowId && user.privacy.readReceipts && (
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500 ml-0.5" />
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
             <div className="bg-white/5 border border-white/5 text-neutral-400 px-4 py-3 rounded-[18px] rounded-tl-sm text-xs flex gap-1.5 shadow-lg backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
        <div className="bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-end gap-2 relative ring-1 ring-white/5 focus-within:ring-emerald-500/30 transition-all duration-300">
          
          {user.chatSettings.autoDeleteTimer > 0 && (
            <div className="absolute -top-8 left-0 right-0 flex justify-center pointer-events-none">
               <div className="bg-red-500/10 text-red-400 text-[10px] px-3 py-1 rounded-t-lg border-t border-x border-red-500/10 flex items-center gap-1.5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-1">
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <span className="font-semibold tracking-wide uppercase">Self-Destruct: {formatTimer(user.chatSettings.autoDeleteTimer)}</span>
               </div>
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect} 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-neutral-500 hover:text-white bg-transparent hover:bg-white/5 rounded-xl transition-all"
            title="Attach file"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" strokeWidth={1.5} /></svg>
          </button>
          <form onSubmit={handleSendMessage} className="flex-1 flex items-end gap-2">
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a secure message..."
              className="w-full bg-transparent border-none px-2 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none max-h-32"
            />
            <button 
              disabled={!inputValue.trim()}
              className="p-3 mb-0.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/5 disabled:text-neutral-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth={2} /></svg>
            </button>
          </form>
        </div>
        <div className="flex justify-center mt-3">
          <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-[0.2em] flex items-center gap-1.5 opacity-60">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth={2} /></svg>
            Zero-Knowledge Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
