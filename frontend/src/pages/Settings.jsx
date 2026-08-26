import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/settings_service';
import SettingCard from '../components/settings/SettingCard';
import { Settings as SettingsIcon, Save, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  'General', 'LLM', 'MCP / Tools', 'Database', 'Logging', 'Advanced'
];

const Settings = () => {
  const [initialSettings, setInitialSettings] = useState({});
  const [currentSettings, setCurrentSettings] = useState({});
  const [activeCategory, setActiveCategory] = useState('LLM');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      const settingsMap = {};
      data.settings.forEach(s => {
        settingsMap[s.key] = s;
      });
      setInitialSettings(settingsMap);
      setCurrentSettings(JSON.parse(JSON.stringify(settingsMap)));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to load settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdate = (key, newValue) => {
    setCurrentSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: newValue
      }
    }));
  };

  const getDirtyKeys = () => {
    const dirty = {};
    Object.keys(currentSettings).forEach(key => {
      // Don't count it as dirty if it's a secret and still masked, or if unchanged
      const isSecretAndMasked = currentSettings[key].is_secret && (currentSettings[key].value === '********' || currentSettings[key].value === '');
      if (currentSettings[key].value !== initialSettings[key].value && !isSecretAndMasked) {
        dirty[key] = currentSettings[key].value;
      }
    });
    return dirty;
  };

  const dirtyKeys = getDirtyKeys();
  const hasChanges = Object.keys(dirtyKeys).length > 0;

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await updateSettings(dirtyKeys);
      setSuccessMsg(response.message || 'Configuration saved successfully.');
      await loadSettings();
    } catch (err) {
      setError(err.message || 'Unable to save configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setCurrentSettings(JSON.parse(JSON.stringify(initialSettings)));
    setError(null);
    setSuccessMsg(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Group settings by category
  const categorizedSettings = Object.values(currentSettings).filter(s => s.category === activeCategory);

  // Auto-select first available category if activeCategory has no settings, but we know the backend categories.
  // Actually, some categories might be empty. That's fine.

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <SettingsIcon className="text-blue-500" /> Settings
          </h1>
          <p className="text-slate-400 mt-1">Configure BuildSmart runtime and integrations</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Panel */}
        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
          {/* Action Bar */}
          <div className="bg-slate-800/50 border-b border-slate-700 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white">{activeCategory} Configuration</h2>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-amber-400 text-sm font-medium flex items-center gap-1">
                  <AlertTriangle size={14} /> Unsaved changes
                </span>
              )}
              <button
                onClick={handleDiscard}
                disabled={!hasChanges || isSaving}
                className="inline-flex items-center px-3 py-1.5 border border-slate-600 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <XCircle size={16} className="mr-2" />
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="inline-flex items-center px-4 py-1.5 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? <RefreshCw size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 m-4 rounded-r-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 m-4 rounded-r-md">
              <p className="text-blue-400 text-sm">{successMsg}</p>
            </div>
          )}

          {/* Setting Cards List */}
          <div className="p-4 sm:p-6 flex flex-col space-y-2">
            {categorizedSettings.length > 0 ? (
              categorizedSettings.map(setting => (
                <SettingCard 
                  key={setting.key} 
                  setting={setting} 
                  onUpdate={handleUpdate}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">No settings available in this category.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Settings;
