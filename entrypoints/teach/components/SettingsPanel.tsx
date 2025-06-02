import React, { useState, useEffect } from 'react';
import { Settings, Key, Eye, EyeOff, Check, AlertCircle, ExternalLink, Info } from 'lucide-react';
import useStore from '@/entrypoints/store/store';

const SettingsPanel: React.FC = () => {
  const { geminiApiKey, setGeminiApiKey, theme } = useStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);

  // Sync tempApiKey with geminiApiKey when it changes
  useEffect(() => {
    setTempApiKey(geminiApiKey || '');
  }, [geminiApiKey]);

  const handleSaveApiKey = () => {
    const trimmedKey = tempApiKey.trim();
    if (trimmedKey) {
      setGeminiApiKey(trimmedKey);
      setValidationResult('valid');
      setTimeout(() => setValidationResult(null), 3000);
    } else {
      setGeminiApiKey('');
      setValidationResult(null);
    }
  };

  const handleClearApiKey = () => {
    setTempApiKey('');
    setGeminiApiKey('');
    setValidationResult(null);
  };

  const validateApiKey = async () => {
    if (!tempApiKey.trim()) return;
    
    setIsValidating(true);
    try {
      // Simple validation - check if it looks like a valid API key format
      const isValidFormat = tempApiKey.trim().startsWith('AIza') && tempApiKey.trim().length > 30;
      setValidationResult(isValidFormat ? 'valid' : 'invalid');
    } catch (error) {
      setValidationResult('invalid');
    } finally {
      setIsValidating(false);
    }
  };

  const getApiKeyStatus = () => {
    if (!geminiApiKey) return { status: 'missing', color: 'text-red-500', icon: AlertCircle };
    if (validationResult === 'valid') return { status: 'valid', color: 'text-green-500', icon: Check };
    if (validationResult === 'invalid') return { status: 'invalid', color: 'text-red-500', icon: AlertCircle };
    return { status: 'set', color: 'text-blue-500', icon: Key };
  };

  const apiKeyStatus = getApiKeyStatus();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-600">Configure your Wizzly preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* API Configuration Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">API Configuration</h3>
            <div className={`flex items-center gap-1 ${apiKeyStatus.color}`}>
              <apiKeyStatus.icon className="w-4 h-4" />
              <span className="text-xs font-medium">
                {apiKeyStatus.status === 'missing' && 'Not Set'}
                {apiKeyStatus.status === 'set' && 'Configured'}
                {apiKeyStatus.status === 'valid' && 'Valid'}
                {apiKeyStatus.status === 'invalid' && 'Invalid'}
              </span>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-gray-200">
            <div className="card-body p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Key className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Gemini API Key</h4>
                    <p className="text-sm text-gray-600">
                      Required for AI-powered features like lesson planning, objective refinement, and voice assistance.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="form-control">
                      <div className="input-group">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={tempApiKey}
                          onChange={(e) => setTempApiKey(e.target.value)}
                          placeholder="Enter your Gemini API key..."
                          className="input input-bordered flex-1 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="btn btn-ghost btn-square"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveApiKey}
                        disabled={!tempApiKey.trim() || tempApiKey === geminiApiKey}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        <Check className="w-4 h-4" />
                        Save Key
                      </button>
                      <button
                        onClick={validateApiKey}
                        disabled={!tempApiKey.trim() || isValidating}
                        className="btn btn-ghost btn-sm"
                      >
                        {isValidating ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <Info className="w-4 h-4" />
                        )}
                        Validate
                      </button>
                      <button
                        onClick={handleClearApiKey}
                        disabled={!geminiApiKey}
                        className="btn btn-error btn-outline btn-sm"
                      >
                        Clear
                      </button>
                    </div>

                    {validationResult && (
                      <div className={`alert ${validationResult === 'valid' ? 'alert-success' : 'alert-error'} py-2`}>
                        <div className="flex items-center gap-2">
                          {validationResult === 'valid' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          <span className="text-sm">
                            {validationResult === 'valid' 
                              ? 'API key format appears valid' 
                              : 'API key format appears invalid'
                            }
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="divider my-2"></div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900 text-sm">How to get your API key:</h5>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>Visit Google AI Studio</li>
                  <li>Sign in with your Google account</li>
                  <li>Click "Get API Key" in the top navigation</li>
                  <li>Create a new API key or use an existing one</li>
                  <li>Copy the key and paste it above</li>
                </ol>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm w-full"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Google AI Studio
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Privacy & Security</h3>
          
          <div className="card bg-base-100 shadow-sm border border-gray-200">
            <div className="card-body p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Local Storage</p>
                    <p className="text-xs text-gray-600">Your API key is stored locally in your browser only</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Direct Communication</p>
                    <p className="text-xs text-gray-600">Wizzly communicates directly with Google's API</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">No Third-Party Servers</p>
                    <p className="text-xs text-gray-600">Your data never passes through our servers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Information Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900">About</h3>
          
          <div className="card bg-base-100 shadow-sm border border-gray-200">
            <div className="card-body p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Version</span>
                  <span className="text-sm text-gray-600">1.0.0</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Context</span>
                  <span className="text-sm text-gray-600">Teaching Mode</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Theme</span>
                  <span className="text-sm text-gray-600 capitalize">{theme}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 