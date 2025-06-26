'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Globe, 
  ArrowLeft,
  Save,
  Clock,
  Calendar,
  Smartphone,
  Monitor,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface NotificationSettings {
  emailNotifications: boolean;
  browserNotifications: boolean;
  pushNotifications: boolean;
  notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  categories: {
    tech: boolean;
    business: boolean;
    personal: boolean;
    marketing: boolean;
    all: boolean;
  };
  soundEnabled: boolean;
  desktopNotifications: boolean;
  mobileNotifications: boolean;
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly';
  digestTime: string;
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    browserNotifications: true,
    pushNotifications: false,
    notificationFrequency: 'hourly',
    quietHours: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    categories: {
      tech: true,
      business: true,
      personal: true,
      marketing: false,
      all: false
    },
    soundEnabled: true,
    desktopNotifications: true,
    mobileNotifications: false,
    digestEnabled: false,
    digestFrequency: 'daily',
    digestTime: '09:00'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(updated));
      
      // Also save to server if user is authenticated
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationSettings: updated }),
      });
      
      if (response.ok) {
        toast.success('Notification settings saved');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        saveSettings({ browserNotifications: true });
        toast.success('Browser notifications enabled');
      } else {
        toast.error('Notification permission denied');
      }
    } else {
      toast.error('Browser notifications not supported');
    }
  };

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Newsletter Reader', {
        body: 'This is a test notification from your newsletter reader',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
      toast.success('Test notification sent');
    } else {
      toast.error('Please enable browser notifications first');
    }
  };

  const resetToDefaults = () => {
    const defaults: NotificationSettings = {
      emailNotifications: true,
      browserNotifications: true,
      pushNotifications: false,
      notificationFrequency: 'hourly',
      quietHours: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      categories: {
        tech: true,
        business: true,
        personal: true,
        marketing: false,
        all: false
      },
      soundEnabled: true,
      desktopNotifications: true,
      mobileNotifications: false,
      digestEnabled: false,
      digestFrequency: 'daily',
      digestTime: '09:00'
    };
    setSettings(defaults);
    saveSettings(defaults);
    toast.success('Reset to default notification settings');
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
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground">Configure how you receive notifications about new newsletters</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Choose how you want to be notified about new newsletters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Email notifications</label>
                <p className="text-sm text-muted-foreground">Receive email alerts for new newsletters</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onChange={(e) => saveSettings({ emailNotifications: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Browser notifications</label>
                <p className="text-sm text-muted-foreground">Show desktop notifications in your browser</p>
              </div>
              <Switch
                checked={settings.browserNotifications}
                onChange={(e) => saveSettings({ browserNotifications: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Push notifications</label>
                <p className="text-sm text-muted-foreground">Receive push notifications on mobile devices</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onChange={(e) => saveSettings({ pushNotifications: e.target.checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Notification Frequency</span>
            </CardTitle>
            <CardDescription>
              How often should you receive notifications?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'immediate', name: 'Immediate', description: 'Get notified as soon as newsletters arrive' },
                { id: 'hourly', name: 'Hourly', description: 'Receive notifications every hour' },
                { id: 'daily', name: 'Daily', description: 'Get a daily summary of new newsletters' },
                { id: 'weekly', name: 'Weekly', description: 'Receive a weekly digest' }
              ].map((frequency) => (
                <button
                  key={frequency.id}
                  onClick={() => saveSettings({ notificationFrequency: frequency.id as any })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    settings.notificationFrequency === frequency.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="font-medium mb-1">{frequency.name}</div>
                  <div className="text-sm text-muted-foreground">{frequency.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Quiet Hours</span>
            </CardTitle>
            <CardDescription>
              Set times when you don't want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Quiet hours</label>
                <p className="text-sm text-muted-foreground">Pause notifications during specific hours</p>
              </div>
              <Switch
                checked={settings.quietHours}
                onChange={(e) => saveSettings({ quietHours: e.target.checked })}
              />
            </div>
            
            {settings.quietHours && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Time</label>
                  <Input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => saveSettings({ quietHoursStart: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Time</label>
                  <Input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => saveSettings({ quietHoursEnd: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Category Notifications</CardTitle>
            <CardDescription>
              Choose which newsletter categories you want to be notified about
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">All categories</label>
                <p className="text-sm text-muted-foreground">Receive notifications for all newsletter categories</p>
              </div>
              <Switch
                checked={settings.categories.all}
                onChange={(e) => saveSettings({ 
                  categories: { ...settings.categories, all: e.target.checked }
                })}
              />
            </div>
            
            {!settings.categories.all && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tech newsletters</span>
                  <Switch
                    checked={settings.categories.tech}
                    onChange={(e) => saveSettings({ 
                      categories: { ...settings.categories, tech: e.target.checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Business newsletters</span>
                  <Switch
                    checked={settings.categories.business}
                    onChange={(e) => saveSettings({ 
                      categories: { ...settings.categories, business: e.target.checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Personal newsletters</span>
                  <Switch
                    checked={settings.categories.personal}
                    onChange={(e) => saveSettings({ 
                      categories: { ...settings.categories, personal: e.target.checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Marketing newsletters</span>
                  <Switch
                    checked={settings.categories.marketing}
                    onChange={(e) => saveSettings({ 
                      categories: { ...settings.categories, marketing: e.target.checked }
                    })}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Digest Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Email Digest</CardTitle>
            <CardDescription>
              Configure your email digest preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Email digest</label>
                <p className="text-sm text-muted-foreground">Receive a summary of newsletters</p>
              </div>
              <Switch
                checked={settings.digestEnabled}
                onChange={(e) => saveSettings({ digestEnabled: e.target.checked })}
              />
            </div>
            
            {settings.digestEnabled && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Digest Frequency</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'daily', name: 'Daily' },
                      { id: 'weekly', name: 'Weekly' }
                    ].map((frequency) => (
                      <button
                        key={frequency.id}
                        onClick={() => saveSettings({ digestFrequency: frequency.id as any })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          settings.digestFrequency === frequency.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        {frequency.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Digest Time</label>
                  <Input
                    type="time"
                    value={settings.digestTime}
                    onChange={(e) => saveSettings({ digestTime: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
            <CardDescription>
              Fine-tune your notification experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Sound notifications</label>
                <p className="text-sm text-muted-foreground">Play sound when notifications arrive</p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onChange={(e) => saveSettings({ soundEnabled: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Desktop notifications</label>
                <p className="text-sm text-muted-foreground">Show notifications on desktop</p>
              </div>
              <Switch
                checked={settings.desktopNotifications}
                onChange={(e) => saveSettings({ desktopNotifications: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Mobile notifications</label>
                <p className="text-sm text-muted-foreground">Show notifications on mobile devices</p>
              </div>
              <Switch
                checked={settings.mobileNotifications}
                onChange={(e) => saveSettings({ mobileNotifications: e.target.checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Test Notifications</CardTitle>
            <CardDescription>
              Test your notification settings to make sure they work correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button onClick={testNotification} variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Test Browser Notification
              </Button>
              <Button onClick={() => toast.success('Test email notification would be sent')} variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Test Email Notification
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={() => toast.success('All notification settings saved!')}>
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
} 