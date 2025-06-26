'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface SecuritySettings {
  twoFactorAuth: boolean;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  dataEncryption: boolean;
  autoLogout: boolean;
  autoLogoutMinutes: number;
  sessionTimeout: boolean;
  sessionTimeoutHours: number;
  privacyMode: boolean;
  dataSharing: boolean;
  analytics: boolean;
  marketingEmails: boolean;
  thirdPartyAccess: boolean;
}

interface TwoFactorSetup {
  step: 'disabled' | 'qr' | 'verify' | 'enabled';
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  verificationCode: string;
}

export default function SecurityPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    dataEncryption: true,
    autoLogout: false,
    autoLogoutMinutes: 30,
    sessionTimeout: true,
    sessionTimeoutHours: 24,
    privacyMode: false,
    dataSharing: false,
    analytics: true,
    marketingEmails: false,
    thirdPartyAccess: false
  });
  const [twoFactor, setTwoFactor] = useState<TwoFactorSetup>({
    step: 'disabled',
    verificationCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('securitySettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading security settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = async (newSettings: Partial<SecuritySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    try {
      localStorage.setItem('securitySettings', JSON.stringify(updated));
      
      // Also save to server if user is authenticated
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ securitySettings: updated }),
      });
      
      if (response.ok) {
        toast.success('Security settings saved');
      }
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const setupTwoFactorAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/2fa/setup', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to setup 2FA');

      const { secret, qrCode, backupCodes } = await response.json();
      setTwoFactor({
        step: 'qr',
        secret,
        qrCode,
        backupCodes,
        verificationCode: ''
      });
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error('Failed to setup two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFactorAuth = async () => {
    if (!twoFactor.verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: twoFactor.secret,
          code: twoFactor.verificationCode
        }),
      });

      if (!response.ok) throw new Error('Invalid verification code');

      setTwoFactor({ step: 'enabled', verificationCode: '' });
      saveSettings({ twoFactorAuth: true });
      toast.success('Two-factor authentication enabled successfully');
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error('Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactorAuth = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/2fa/disable', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to disable 2FA');

      setTwoFactor({ step: 'disabled', verificationCode: '' });
      saveSettings({ twoFactorAuth: false });
      toast.success('Two-factor authentication disabled');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Failed to disable two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    const defaults: SecuritySettings = {
      twoFactorAuth: false,
      loginNotifications: true,
      suspiciousActivityAlerts: true,
      dataEncryption: true,
      autoLogout: false,
      autoLogoutMinutes: 30,
      sessionTimeout: true,
      sessionTimeoutHours: 24,
      privacyMode: false,
      dataSharing: false,
      analytics: true,
      marketingEmails: false,
      thirdPartyAccess: false
    };
    setSettings(defaults);
    saveSettings(defaults);
    toast.success('Reset to default security settings');
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please sign in to view security settings</p>
        </div>
      </div>
    );
  }

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
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Security & Privacy</h1>
              <p className="text-muted-foreground">Control data access, privacy settings, and security options</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Two-Factor Authentication</span>
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Two-factor authentication</label>
                <p className="text-sm text-muted-foreground">Require a code from your authenticator app to sign in</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  settings.twoFactorAuth 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {settings.twoFactorAuth ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      <span>Enabled</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      <span>Disabled</span>
                    </>
                  )}
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setupTwoFactorAuth();
                    } else {
                      disableTwoFactorAuth();
                    }
                  }}
                />
              </div>
            </div>

            {/* 2FA Setup Flow */}
            {twoFactor.step === 'qr' && (
              <div className="p-4 border border-border rounded-lg bg-accent/20">
                <h4 className="font-medium mb-3">Setup Two-Factor Authentication</h4>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </div>
                  {twoFactor.qrCode && (
                    <div className="flex justify-center">
                      <img src={twoFactor.qrCode} alt="QR Code" className="border border-border rounded" />
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    2. Enter the 6-digit code from your authenticator app
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={twoFactor.verificationCode}
                      onChange={(e) => setTwoFactor(prev => ({ ...prev, verificationCode: e.target.value }))}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-32"
                    />
                    <Button onClick={verifyTwoFactorAuth} disabled={isLoading}>
                      Verify
                    </Button>
                    <Button variant="outline" onClick={() => setTwoFactor({ step: 'disabled', verificationCode: '' })}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {twoFactor.step === 'enabled' && (
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Two-factor authentication is enabled</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your account is now protected with two-factor authentication.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Login Security */}
        <Card>
          <CardHeader>
            <CardTitle>Login Security</CardTitle>
            <CardDescription>
              Configure how your account handles login attempts and sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Login notifications</label>
                <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
              </div>
              <Switch
                checked={settings.loginNotifications}
                onChange={(e) => saveSettings({ loginNotifications: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Suspicious activity alerts</label>
                <p className="text-sm text-muted-foreground">Alert on unusual account activity</p>
              </div>
              <Switch
                checked={settings.suspiciousActivityAlerts}
                onChange={(e) => saveSettings({ suspiciousActivityAlerts: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Auto-logout</label>
                <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
              </div>
              <Switch
                checked={settings.autoLogout}
                onChange={(e) => saveSettings({ autoLogout: e.target.checked })}
              />
            </div>
            
            {settings.autoLogout && (
              <div className="ml-6">
                <label className="text-sm font-medium mb-2 block">Inactivity timeout (minutes)</label>
                <Input
                  type="number"
                  min="5"
                  max="480"
                  value={settings.autoLogoutMinutes}
                  onChange={(e) => saveSettings({ autoLogoutMinutes: parseInt(e.target.value) })}
                  className="w-32"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Session timeout</label>
                <p className="text-sm text-muted-foreground">Set session expiration time</p>
              </div>
              <Switch
                checked={settings.sessionTimeout}
                onChange={(e) => saveSettings({ sessionTimeout: e.target.checked })}
              />
            </div>
            
            {settings.sessionTimeout && (
              <div className="ml-6">
                <label className="text-sm font-medium mb-2 block">Session timeout (hours)</label>
                <Input
                  type="number"
                  min="1"
                  max="168"
                  value={settings.sessionTimeoutHours}
                  onChange={(e) => saveSettings({ sessionTimeoutHours: parseInt(e.target.value) })}
                  className="w-32"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardHeader>
            <CardTitle>Data Protection</CardTitle>
            <CardDescription>
              Control how your data is protected and encrypted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Data encryption</label>
                <p className="text-sm text-muted-foreground">Encrypt sensitive data at rest</p>
              </div>
              <Switch
                checked={settings.dataEncryption}
                onChange={(e) => saveSettings({ dataEncryption: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Privacy mode</label>
                <p className="text-sm text-muted-foreground">Hide sensitive information</p>
              </div>
              <Switch
                checked={settings.privacyMode}
                onChange={(e) => saveSettings({ privacyMode: e.target.checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>
              Control how your data is used and shared
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Data sharing</label>
                <p className="text-sm text-muted-foreground">Allow data sharing for improvements</p>
              </div>
              <Switch
                checked={settings.dataSharing}
                onChange={(e) => saveSettings({ dataSharing: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Analytics</label>
                <p className="text-sm text-muted-foreground">Help improve the app with usage data</p>
              </div>
              <Switch
                checked={settings.analytics}
                onChange={(e) => saveSettings({ analytics: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Marketing emails</label>
                <p className="text-sm text-muted-foreground">Receive promotional emails</p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onChange={(e) => saveSettings({ marketingEmails: e.target.checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Third-party access</label>
                <p className="text-sm text-muted-foreground">Allow third-party integrations</p>
              </div>
              <Switch
                checked={settings.thirdPartyAccess}
                onChange={(e) => saveSettings({ thirdPartyAccess: e.target.checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage your current login sessions across devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Current Session</div>
                    <div className="text-sm text-muted-foreground">Chrome on macOS • Active now</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">This device</div>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">iPhone 12</div>
                    <div className="text-sm text-muted-foreground">Safari on iOS • 2 hours ago</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  Revoke
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Monitor className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Work Laptop</div>
                    <div className="text-sm text-muted-foreground">Firefox on Windows • 1 day ago</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  Revoke
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card>
          <CardHeader>
            <CardTitle>Security Status</CardTitle>
            <CardDescription>
              Overview of your account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium text-green-800">Strong Password</div>
                <div className="text-sm text-green-600">Your password is secure</div>
              </div>
              
              <div className={`text-center p-4 rounded-lg border ${
                settings.twoFactorAuth 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                {settings.twoFactorAuth ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-medium text-green-800">2FA Enabled</div>
                    <div className="text-sm text-green-600">Extra security active</div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="font-medium text-yellow-800">2FA Disabled</div>
                    <div className="text-sm text-yellow-600">Enable for better security</div>
                  </>
                )}
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-blue-800">Data Encrypted</div>
                <div className="text-sm text-blue-600">Your data is protected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={() => toast.success('All security settings saved!')}>
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
} 