
import React, { useState } from 'react';
import { Send, Image, Paperclip, MoreVertical, Search, Smile } from 'lucide-react';

const chats = [
  { id: '1', name: 'Sarah Chen', avatar: 'https://picsum.photos/seed/sarah/100', lastMessage: 'The tutoring session was great!', time: '10:30 AM', online: true },
  { id: '2', name: 'Mike Ross', avatar: 'https://picsum.photos/seed/mike/100', lastMessage: 'Can you send the draft flyer?', time: 'Yesterday', online: false },
  { id: '3', name: 'Jessica Pearson', avatar: 'https://picsum.photos/seed/jessica/100', lastMessage: 'Payment confirmed. Thanks!', time: 'Monday', online: true },
];

const Messages: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState(chats[0]);
  const [msgInput, setMsgInput] = useState('');

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-3xl border border-slate-200 shadow-sm flex overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Sidebar */}
      <div className="w-full md:w-80 border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-white ${selectedChat.id === chat.id ? 'bg-white border-l-4 border-l-indigo-600' : ''}`}
            >
              <div className="relative">
                <img src={chat.avatar} alt="" className="w-12 h-12 rounded-2xl border border-slate-200" />
                {chat.online && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <p className="font-bold text-slate-900 truncate">{chat.name}</p>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-1 flex-col h-full bg-white relative">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <img src={selectedChat.avatar} alt="" className="w-10 h-10 rounded-xl" />
            <div>
              <p className="font-bold text-slate-900">{selectedChat.name}</p>
              <p className="text-[10px] text-emerald-600 font-black uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> {selectedChat.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all">View Task</button>
            <button className="text-slate-400 hover:text-slate-600 p-2"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col gap-1 max-w-[80%]">
            <div className="bg-slate-100 text-slate-800 p-4 rounded-2xl rounded-tl-none font-medium text-sm">
              Hey Alex! Are you still available to help with the flyer design for the Hackathon?
            </div>
            <span className="text-[10px] text-slate-400 ml-1">10:05 AM</span>
          </div>

          <div className="flex flex-col gap-1 max-w-[80%] self-end">
            <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none font-medium text-sm shadow-md shadow-indigo-100">
              Absolutely! I have some free slots tomorrow afternoon. What's the budget you had in mind?
            </div>
            <span className="text-[10px] text-slate-400 self-end mr-1">10:12 AM</span>
          </div>

          <div className="flex flex-col gap-1 max-w-[80%]">
            <div className="bg-slate-100 text-slate-800 p-4 rounded-2xl rounded-tl-none font-medium text-sm">
              Awesome. We can do $35 for the full design kit. I've attached the brand assets below.
            </div>
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Paperclip size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">brand_assets_hackathon.zip</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">12.5 MB</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 ml-1">10:15 AM</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-2 flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Image size={20} /></button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Paperclip size={20} /></button>
            <input 
              type="text" 
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none outline-none text-sm px-2 font-medium"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setMsgInput('')}
            />
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Smile size={20} /></button>
            <button 
              className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95"
              onClick={() => setMsgInput('')}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
