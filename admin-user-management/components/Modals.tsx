import React, { useState } from 'react';
import { X, AlertTriangle, Save, Clock } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md relative animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

interface BanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (duration: string, reason: string) => void;
  userName: string;
}

export const BanUserModal: React.FC<BanUserModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
  const [duration, setDuration] = useState('7_days');
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(duration, reason);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ban User`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-red-200 text-sm">
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <p>You are about to ban <span className="font-bold text-white">{userName}</span>. This will revoke their access immediately.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Duration</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: '1_day', label: '24 Hours' },
              { id: '3_days', label: '3 Days' },
              { id: '7_days', label: '1 Week' },
              { id: '30_days', label: '30 Days' },
              { id: 'permanent', label: 'Permanent' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setDuration(opt.id)}
                className={`text-sm px-3 py-2 rounded-lg border transition-all ${
                  duration === opt.id 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
           <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Reason (Optional)</label>
           <textarea 
             value={reason}
             onChange={e => setReason(e.target.value)}
             placeholder="Violation of terms..."
             className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none h-24 resize-none"
           />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm">
            Cancel
          </button>
          <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors font-medium text-sm shadow-lg shadow-red-900/20">
            Confirm Ban
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({ isOpen, onClose, onSave }) => {
  const [text, setText] = useState('');

  const handleSave = () => {
    if (text.trim()) {
      onSave(text);
      setText('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Internal Note">
      <div className="space-y-4">
        <div>
           <textarea 
             value={text}
             onChange={e => setText(e.target.value)}
             placeholder="Type your note here. Only admins can see this."
             className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none h-32 resize-none"
             autoFocus
           />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors text-sm font-medium">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={!text.trim()}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-lg shadow-blue-900/20"
          >
            <Save size={16} />
            Save Note
          </button>
        </div>
      </div>
    </Modal>
  );
};