'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Eye, 
  EyeOff, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Palette,
  Moon,
  Sun,
  Monitor,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ReadingPreferences {
  fontSize: number;
  lineHeight: number;
  maxWidth: number;
  readingMode: 'normal' | 'focus' | 'distraction-free';
  readingTheme: 'light' | 'dark' | 'sepia';
  autoSaveProgress: boolean;
  showReadingProgress: boolean;
  enableKeyboardShortcuts: boolean;
  autoMarkAsRead: boolean;
}

export default function ReadingPreferencesPage() {
  const [preferences, setPreferences] = useState<ReadingPreferences>({
    fontSize: 18,
    lineHeight: 1.7,
    maxWidth: 65,
    readingMode: 'normal',
    readingTheme: 'light',
    autoSaveProgress: true,
    showReadingProgress: true,
    enableKeyboardShortcuts: true,
    autoMarkAsRead: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('readingPreferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading reading preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = async (newPreferences: Partial<ReadingPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    
    try {
      localStorage.setItem('readingPreferences', JSON.stringify(updated));
      
      // Also save to server if user is authenticated
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingPreferences: updated }),
      });
      
      if (response.ok) {
        toast.success('Preferences saved successfully');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const resetToDefaults = () => {
    const defaults: ReadingPreferences = {
      fontSize: 18,
      lineHeight: 1.7,
      maxWidth: 65,
      readingMode: 'normal',
      readingTheme: 'light',
      autoSaveProgress: true,
      showReadingProgress: true,
      enableKeyboardShortcuts: true,
      autoMarkAsRead: false
    };
    setPreferences(defaults);
    savePreferences(defaults);
    toast.success('Reset to default preferences');
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
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reading Preferences</h1>
              <p className="text-muted-foreground">Customize your newsletter reading experience</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Typography Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ZoomIn className="h-5 w-5" />
              <span>Typography</span>
            </CardTitle>
            <CardDescription>
              Adjust font size, line height, and content width for optimal reading
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Font Size</label>
                <span className="text-sm text-muted-foreground">{preferences.fontSize}px</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => savePreferences({ fontSize: Math.max(preferences.fontSize - 1, 14) })}
                  disabled={preferences.fontSize <= 14}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="14"
                    max="28"
                    value={preferences.fontSize}
                    onChange={(e) => savePreferences({ fontSize: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => savePreferences({ fontSize: Math.min(preferences.fontSize + 1, 28) })}
                  disabled={preferences.fontSize >= 28}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Line Height</label>
                <span className="text-sm text-muted-foreground">{preferences.lineHeight}</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => savePreferences({ lineHeight: Math.max(preferences.lineHeight - 0.1, 1.2) })}
                  disabled={preferences.lineHeight <= 1.2}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="1.2"
                    max="2.2"
                    step="0.1"
                    value={preferences.lineHeight}
                    onChange={(e) => savePreferences({ lineHeight: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => savePreferences({ lineHeight: Math.min(preferences.lineHeight + 0.1, 2.2) })}
                  disabled={preferences.lineHeight >= 2.2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content Width */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Content Width</label>
                <span className="text-sm text-muted-foreground">{preferences.maxWidth}%</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => savePreferences({ maxWidth: Math.max(preferences.maxWidth - 5, 50) })}
                  disabled={preferences.maxWidth <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="5"
                    value={preferences.maxWidth}
                    onChange={(e) => savePreferences({ maxWidth: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => savePreferences({ maxWidth: Math.min(preferences.maxWidth + 5, 90) })}
                  disabled={preferences.maxWidth >= 90}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Reading Mode</span>
            </CardTitle>
            <CardDescription>
              Choose your preferred reading layout and distraction level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'normal', name: 'Normal', icon: BookOpen, description: 'Standard layout with sidebar' },
                { id: 'focus', name: 'Focus', icon: Eye, description: 'Centered content with minimal distractions' },
                { id: 'distraction-free', name: 'Distraction-Free', icon: EyeOff, description: 'Full-screen reading experience' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => savePreferences({ readingMode: mode.id as any })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.readingMode === mode.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <mode.icon className="h-5 w-5" />
                    <span className="font-medium">{mode.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">{mode.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Theme & Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize the visual appearance of your reading experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'light', name: 'Light', icon: Sun, description: 'Clean white background' },
                { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes in low light' },
                { id: 'sepia', name: 'Sepia', icon: Monitor, description: 'Warm, paper-like appearance' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => savePreferences({ readingTheme: theme.id as any })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.readingTheme === theme.id
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

        {/* Reading Behavior */}
        <Card>
          <CardHeader>
            <CardTitle>Reading Behavior</CardTitle>
            <CardDescription>
              Configure how the app behaves while you're reading newsletters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Auto-save reading progress</label>
                <p className="text-sm text-muted-foreground">Remember where you left off in newsletters</p>
              </div>
              <Switch
                checked={preferences.autoSaveProgress}
                onChange={(e) => savePreferences({ autoSaveProgress: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Show reading progress bar</label>
                <p className="text-sm text-muted-foreground">Display progress indicator at the top</p>
              </div>
              <Switch
                checked={preferences.showReadingProgress}
                onChange={(e) => savePreferences({ showReadingProgress: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Enable keyboard shortcuts</label>
                <p className="text-sm text-muted-foreground">Use keyboard for navigation and actions</p>
              </div>
              <Switch
                checked={preferences.enableKeyboardShortcuts}
                onChange={(e) => savePreferences({ enableKeyboardShortcuts: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Auto-mark as read</label>
                <p className="text-sm text-muted-foreground">Mark newsletters as read when opened</p>
              </div>
              <Switch
                checked={preferences.autoMarkAsRead}
                onChange={(e) => savePreferences({ autoMarkAsRead: e.target.checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={() => toast.success('All preferences saved!')}>
            Save All Preferences
          </Button>
        </div>
      </div>
    </div>
  );
} 