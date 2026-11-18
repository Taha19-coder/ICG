'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Building2, Mail, Shield, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/site-settings';

type SettingsField = {
  name: keyof SiteSettings;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'number';
};

const settingsSections: {
  id: string;
  label: string;
  icon: typeof Building2;
  fields: SettingsField[];
}[] = [
  {
    id: 'general',
    label: 'General',
    icon: Building2,
    fields: [
      { name: 'company_name', label: 'Company Name', type: 'text' },
      { name: 'company_tagline', label: 'Tagline', type: 'text' },
      { name: 'address', label: 'Office Address', type: 'textarea' },
      { name: 'google_maps_url', label: 'Google Maps URL', type: 'url' },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: Mail,
    fields: [
      { name: 'phone', label: 'Business Phone', type: 'tel' },
      { name: 'whatsapp', label: 'WhatsApp Number', type: 'tel' },
      { name: 'email', label: 'Business Email', type: 'email' },
      { name: 'whatsapp_business_number', label: 'WhatsApp Business Number', type: 'tel' },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    fields: [
      { name: 'session_timeout', label: 'Admin Session Timeout (minutes)', type: 'number' },
    ],
  },
];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [persistedValues, setPersistedValues] = useState<Partial<Record<keyof SiteSettings, string | number>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const savingFields = useRef(new Set<keyof SiteSettings>());

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings', { cache: 'no-store' });
        const result = await response.json() as { settings?: SiteSettings; message?: string };
        if (!response.ok || !result.settings) {
          throw new Error(result.message || 'Settings could not be loaded.');
        }
        if (active) {
          setSettings(result.settings);
          setPersistedValues(result.settings);
          setError('');
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Settings could not be loaded.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadSettings();
    return () => { active = false; };
  }, []);

  const notifyPublicPages = (currentSettings: SiteSettings) => {
    window.dispatchEvent(new Event('icg:site-settings-updated'));
    try {
      localStorage.setItem('icg-site-settings-updated', JSON.stringify({
        company_name: currentSettings.company_name,
        company_tagline: currentSettings.company_tagline,
        address: currentSettings.address,
        google_maps_url: currentSettings.google_maps_url,
        phone: currentSettings.phone,
        whatsapp: currentSettings.whatsapp,
        email: currentSettings.email,
        whatsapp_business_number: currentSettings.whatsapp_business_number,
      }));
    } catch (storageError) {
      console.error('Unable to broadcast updated site settings to other tabs.', storageError);
    }
  };

  const persistSettings = async (nextSettings: SiteSettings, successMessage: string) => {
    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextSettings),
      });
      const result = await response.json() as { settings?: SiteSettings; message?: string };
      if (!response.ok || !result.settings) {
        throw new Error(result.message || 'Settings could not be saved.');
      }
      setSettings(result.settings);
      setPersistedValues(result.settings);
      setNotice(successMessage);
      notifyPublicPages(result.settings);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Settings could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void persistSettings(settings, 'Settings saved and applied to the website.');
  };

  const handleReset = () => {
    if (!window.confirm('Reset all settings to their defaults?')) return;
    void persistSettings(DEFAULT_SITE_SETTINGS, 'Settings were reset to defaults.');
  };

  const updateField = (field: SettingsField, value: string) => {
    if (field.name === 'session_timeout') {
      setSettings(current => ({ ...current, session_timeout: Number(value) }));
      return;
    }
    setSettings(current => ({ ...current, [field.name]: value }));
  };

  const saveField = async (field: SettingsField) => {
    const value = settings[field.name];
    if (value === persistedValues[field.name] || savingFields.current.has(field.name)) return;
    savingFields.current.add(field.name);
    setError('');
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field.name]: value }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || `${field.label} could not be saved.`);
      setPersistedValues(current => ({ ...current, [field.name]: value }));
      setNotice(`${field.label} saved and applied to the website.`);
      notifyPublicPages(settings);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : `${field.label} could not be saved.`);
    } finally {
      savingFields.current.delete(field.name);
    }
  };

  const activeSettingsSection = settingsSections.find(section => section.id === activeSection);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-light tracking-tight text-deep-black">Settings</h1>
        <p className="mt-1 text-medium-grey">Changes save when you leave a field or select Save Changes, then update the website immediately.</p>
      </div>

      {notice && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
          role="status"
        >
          {notice}
        </motion.p>
      )}
      {error && <p className="border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{error}</p>}

      <div className="card">
        <div className="flex flex-col lg:flex-row">
          <nav className="p-4 lg:w-64 lg:border-r border-light-grey" aria-label="Settings sections">
            <ul className="space-y-1" role="list">
              {settingsSections.map(section => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                      activeSection === section.id
                        ? 'bg-deep-black text-pure-white'
                        : 'text-charcoal hover:bg-light-grey hover:text-deep-black'
                    )}
                  >
                    <section.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="mb-6 flex items-center justify-between border-b border-light-grey pb-4">
                <div>
                  <h2 className="text-xl font-heading font-medium text-deep-black">{activeSettingsSection?.label}</h2>
                  <p className="mt-1 text-sm text-medium-grey">{activeSettingsSection?.fields.length} settings</p>
                </div>
              </div>

              {isLoading ? (
                <p className="py-8 text-center text-medium-grey" role="status">Loading settings...</p>
              ) : (
                <div className="space-y-6">
                  {activeSettingsSection?.fields.map(field => (
                    <div key={field.name}>
                      <label htmlFor={field.name} className="label-field">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          id={field.name}
                          name={field.name}
                          value={settings[field.name]}
                          onChange={event => updateField(field, event.target.value)}
                          onBlur={() => { void saveField(field); }}
                          rows={3}
                          className="input-field mt-1"
                          disabled={isSaving}
                        />
                      ) : (
                        <input
                          id={field.name}
                          name={field.name}
                          type={field.type}
                          value={settings[field.name]}
                          onChange={event => updateField(field, event.target.value)}
                          onBlur={() => { void saveField(field); }}
                          min={field.type === 'number' ? 5 : undefined}
                          max={field.type === 'number' ? 480 : undefined}
                          className="input-field mt-1"
                          disabled={isSaving}
                        />
                      )}
                      {field.name === 'session_timeout' && (
                        <p className="mt-1 text-sm text-medium-grey">Applies when the admin signs in again. Choose 5 to 480 minutes.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end border-t border-light-grey pt-6">
                <button type="submit" className="btn-primary" disabled={isLoading || isSaving}>
                  <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <section className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="reset-settings-title">
        <div>
          <h2 id="reset-settings-title" className="font-medium text-deep-black">Reset Settings</h2>
          <p className="mt-1 text-sm text-medium-grey">Restore company, contact, and session settings to their default values.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isSaving || isLoading}>
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Reset to Defaults
        </button>
      </section>
    </div>
  );
}
