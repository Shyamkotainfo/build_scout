import React, { useState } from 'react';
import { Key, Eye, EyeOff, Edit2, X, Check } from 'lucide-react';

const SettingCard = ({ setting, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(setting.value || '');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    onUpdate(setting.key, currentValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(setting.value || '');
    setIsEditing(false);
    setShowPassword(false);
  };

  const renderInput = () => {
    if (setting.is_secret) {
      if (!isEditing) {
        return (
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${setting.is_configured ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              {setting.is_configured ? 'Configured' : 'Not Configured'}
            </span>
            <button
              onClick={() => {
                setIsEditing(true);
                setCurrentValue('');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Change Secret
            </button>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 w-full max-w-sm">
          <div className="relative flex-1">
            <input
              type={showPassword ? 'text' : 'password'}
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 pr-10"
              placeholder="Enter new secret..."
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button onClick={handleSave} className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md">
            <Check size={16} />
          </button>
          <button onClick={handleCancel} className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md">
            <X size={16} />
          </button>
        </div>
      );
    }

    if (setting.type === 'boolean') {
      return (
        <div className="flex items-center gap-3">
           <button
            onClick={() => onUpdate(setting.key, setting.value === 'true' ? 'false' : 'true')}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${setting.value === 'true' ? 'bg-blue-600' : 'bg-slate-600'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${setting.value === 'true' ? 'translate-x-4.5' : 'translate-x-1'}`} />
          </button>
        </div>
      );
    }

    // Default text/number input
    if (isEditing) {
      return (
        <div className="flex items-center gap-2 w-full max-w-sm">
          <input
            type={setting.type === 'integer' || setting.type === 'float' ? 'number' : 'text'}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button onClick={handleSave} className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md">
            <Check size={16} />
          </button>
          <button onClick={handleCancel} className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md">
            <X size={16} />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 group">
        <span className="text-sm font-medium text-slate-200">
          {setting.value || <span className="text-slate-500 italic">Not set</span>}
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-400 transition-opacity p-1"
          aria-label="Edit setting"
        >
          <Edit2 size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col py-4 border-b border-slate-700/50 last:border-0 hover:bg-slate-800/20 px-4 -mx-4 rounded-lg transition-colors">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-slate-200">{setting.key}</h4>
            {setting.is_secret && <Key size={14} className="text-slate-500" />}
          </div>
          <p className="text-sm text-slate-400 mb-2">{setting.description}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              Type: {setting.type}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
              Source: {setting.source}
            </span>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-start justify-end pt-1">
          {renderInput()}
        </div>
      </div>
    </div>
  );
};

export default SettingCard;
