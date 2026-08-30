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
            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${setting.is_configured ? 'bg-[var(--bs-status-success-light)] text-[var(--bs-status-success)] border-[var(--bs-status-success-border)]' : 'bg-[var(--bs-bg-secondary)] text-[var(--bs-text-tertiary)] border-[var(--bs-border-light)]'}`}>
              {setting.is_configured ? 'Configured' : 'Not Configured'}
            </span>
            <button
              onClick={() => {
                setIsEditing(true);
                setCurrentValue('');
              }}
              className="text-xs text-[var(--bs-status-running)] hover:text-[var(--bs-status-running-hover)] underline"
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
              className="w-full bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] rounded-md px-3 py-1.5 text-sm text-[var(--bs-text-primary)] focus:outline-none focus:border-[var(--bs-status-running)] pr-10"
              placeholder="Enter new secret..."
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button onClick={handleSave} className="p-1.5 bg-[var(--bs-status-running)] hover:bg-[var(--bs-status-running-hover)] text-[var(--bs-text-primary)] rounded-md">
            <Check size={16} />
          </button>
          <button onClick={handleCancel} className="p-1.5 bg-[var(--bs-bg-hover)] hover:bg-slate-600 text-[var(--bs-text-secondary)] rounded-md">
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
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${setting.value === 'true' ? 'bg-[var(--bs-status-running)]' : 'bg-slate-600'}`}
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
            className="flex-1 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] rounded-md px-3 py-1.5 text-sm text-[var(--bs-text-primary)] focus:outline-none focus:border-[var(--bs-status-running)]"
            autoFocus
          />
          <button onClick={handleSave} className="p-1.5 bg-[var(--bs-status-running)] hover:bg-[var(--bs-status-running-hover)] text-[var(--bs-text-primary)] rounded-md">
            <Check size={16} />
          </button>
          <button onClick={handleCancel} className="p-1.5 bg-[var(--bs-bg-hover)] hover:bg-slate-600 text-[var(--bs-text-secondary)] rounded-md">
            <X size={16} />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 group">
        <span className="text-sm font-medium text-[var(--bs-text-primary)]">
          {setting.value || <span className="text-[var(--bs-text-secondary)] italic">Not set</span>}
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 text-[var(--bs-text-tertiary)] hover:text-[var(--bs-status-running)] transition-opacity p-1"
          aria-label="Edit setting"
        >
          <Edit2 size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col py-4 border-b border-[var(--bs-border-light)] last:border-0 hover:bg-[var(--bs-bg-hover)] px-4 -mx-4 rounded-lg transition-colors">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-[var(--bs-text-primary)]">{setting.key}</h4>
            {setting.is_secret && <Key size={14} className="text-[var(--bs-text-secondary)]" />}
          </div>
          <p className="text-sm text-[var(--bs-text-tertiary)] mb-2">{setting.description}</p>
          <div className="flex items-center gap-4 text-xs text-[var(--bs-text-secondary)]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              Type: {setting.type}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--bs-status-running-border)]"></span>
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
