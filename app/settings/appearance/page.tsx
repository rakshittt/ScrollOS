'use client';

import { useState, useEffect } from 'react';
import { 
  Palette, 
  Moon, 
  Sun, 
  Monitor,
  ArrowLeft,
  Eye,
  EyeOff,
  Settings,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  compactMode: boolean;
  showSidebar: boolean;
  sidebarCollapsed: boolean;
}

const accentColors = [
  { name: 'Blue', value: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Green', value: '#10b981', class: 'bg-green-500' },
  { name: 'Purple', value: '#8b5cf6', class: 'bg-purple-500' },
  { name: 'Pink', value: '#ec4899', class: 'bg-pink-500' },
  { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
  { name: 'Red', value: '#ef4444', class: 'bg-red-500' },
  { name: 'Indigo', value: '#6366f1', class: 'bg-indigo-500' },
  { name: 'Teal', value: '#14b8a6', class: 'bg-teal-500' },
];

const borderRadiusOptions = [
  { name: 'None', value: 'none', class: 'rounded-none' },
  { name: 'Small', value: 'small', class: 'rounded-sm' },
  { name: 'Medium', value: 'medium', class: 'rounded-md' },
  { name: 'Large', value: 'large', class: 'rounded-lg' },
];

export default function AppearancePage() {
  const [settings, setSettings] = useState<AppearanceSettings>({
    theme: 'system',
    accentColor: '#3b82f6',
    borderRadius: 'medium',
    animations: true,
    reducedMotion: false,
    highContrast: false,
    compactMode: false,
    showSidebar: true,
    sidebarCollapsed: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('appearanceSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading appearance settings:', error);
      }
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }

    // Apply accent color
    root.style.setProperty('--primary', settings.accentColor);
    
    // Apply border radius
    const radiusMap = {
      none: '0px',
      small: '2px',
      medium: '6px',
      large: '12px'
    };
    root.style.setProperty('--radius', radiusMap[settings.borderRadius]);
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--reduced-motion', 'reduce');
    } else {
      root.style.removeProperty('--reduced-motion');
    }
  }, [settings]);

  // Save settings to localStorage
  const saveSettings = async (newSettings: Partial<AppearanceSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    try {
      localStorage.setItem('appearanceSettings', JSON.stringify(updated));
      
      // Also save to server if user is authenticated
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appearanceSettings: updated }),
      });
      
      if (response.ok) {
        toast.success('Appearance settings saved');
      }
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const resetToDefaults = () => {
    const defaults: AppearanceSettings = {
      theme: 'system',
      accentColor: '#3b82f6',
      borderRadius: 'medium',
      animations: true,
      reducedMotion: false,
      highContrast: false,
      compactMode: false,
      showSidebar: true,
      sidebarCollapsed: false
    };
    setSettings(defaults);
    saveSettings(defaults);
    toast.success('Reset to default appearance');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Palette className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Appearance</h1>
              <p className="text-muted-foreground">Customize the look and feel of your newsletter reader</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Moon className="h-5 w-5" />
              <span>Theme</span>
            </CardTitle>
            <CardDescription>
              Choose your preferred color scheme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'light', name: 'Light', icon: Sun, description: 'Clean white background' },
                { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes in low light' },
                { id: 'system', name: 'System', icon: Monitor, description: 'Follows your system preference' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => saveSettings({ theme: theme.id as any })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.theme === theme.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <theme.icon className="h-5 w-5" />
                    <span className="font-medium">{theme.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">{theme.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accent Color */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Accent Color</span>
            </CardTitle>
            <CardDescription>
              Choose your preferred accent color for buttons and highlights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => saveSettings({ accentColor: color.value })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.accentColor === color.value
                      ? 'border-primary scale-105'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${color.class}`} />
                  <span className="text-sm font-medium">{color.name}</span>
                </button>
              ))}
            </div>
            
            {/* Custom Color Picker */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Custom Color</label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                  style={{ backgroundColor: settings.accentColor }}
                  onClick={() => {
                    const colorPicker = document.createElement('input');
                    colorPicker.type = 'color';
                    colorPicker.value = settings.accentColor;
                    colorPicker.onchange = (e) => {
                      saveSettings({ accentColor: (e.target as HTMLInputElement).value });
                    };
                    colorPicker.click();
                  }}
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => saveSettings({ accentColor: e.target.value })}
                  className="flex-1 p-2 border border-border rounded-md"
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Border Radius */}
        <Card>
          <CardHeader>
            <CardTitle>Border Radius</CardTitle>
            <CardDescription>
              Choose the roundness of corners throughout the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {borderRadiusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => saveSettings({ borderRadius: option.value as any })}
                  className={`p-4 border-2 transition-all ${
                    settings.borderRadius === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className={`w-12 h-8 bg-muted mx-auto mb-2 ${option.class}`} />
                  <span className="text-sm font-medium">{option.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility</CardTitle>
            <CardDescription>
              Customize the app for better accessibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Enable animations</label>
                <p className="text-sm text-muted-foreground">Show smooth transitions and animations</p>
              </div>
              <Switch
                checked={settings.animations}
                onChange={(e) => saveSettings({ animations: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Reduced motion</label>
                <p className="text-sm text-muted-foreground">Minimize animations for accessibility</p>
              </div>
              <Switch
                checked={settings.reducedMotion}
                onChange={(e) => saveSettings({ reducedMotion: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">High contrast</label>
                <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
              </div>
              <Switch
                checked={settings.highContrast}
                onChange={(e) => saveSettings({ highContrast: e.target.checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Layout Options */}
        <Card>
          <CardHeader>
            <CardTitle>Layout</CardTitle>
            <CardDescription>
              Customize the layout and spacing of the app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Compact mode</label>
                <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
              </div>
              <Switch
                checked={settings.compactMode}
                onChange={(e) => saveSettings({ compactMode: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Show sidebar</label>
                <p className="text-sm text-muted-foreground">Display the navigation sidebar</p>
              </div>
              <Switch
                checked={settings.showSidebar}
                onChange={(e) => saveSettings({ showSidebar: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Sidebar collapsed</label>
                <p className="text-sm text-muted-foreground">Start with sidebar in collapsed state</p>
              </div>
              <Switch
                checked={settings.sidebarCollapsed}
                onChange={(e) => saveSettings({ sidebarCollapsed: e.target.checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your settings will look
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 border border-border rounded-lg bg-background">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sample Newsletter</h3>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Read
                  </Button>
                  <Button size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground">
                This is a preview of how your newsletters will look with the current appearance settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={() => toast.success('All appearance settings saved!')}>
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
} 