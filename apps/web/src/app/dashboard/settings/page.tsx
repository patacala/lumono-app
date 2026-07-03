'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth/context/auth-context';
import { Card, CardHeader, CardBody, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

// Icon components
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const MonitorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'auth', label: 'Emails & Auth', icon: LockIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'sessions', label: 'Active Sessions', icon: MonitorIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-surface-900">Settings</h1>
        <p className="mt-1 text-sm text-surface-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardBody className="p-4">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
                        : 'text-surface-700 hover:bg-surface-300 hover:text-surface-900'
                    }`}
                  >
                    <span className={activeSection === section.id ? 'text-[var(--accent)]' : 'text-surface-600'}>
                      <Icon />
                    </span>
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </CardBody>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    User name
                  </label>
                  <p className="text-sm text-surface-600 mb-2">
                    This is a display name and is not used for authentication
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={user?.name || ''}
                      disabled
                      className="flex-1 px-4 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-surface-200 cursor-not-allowed"
                    />
                    <Button variant="ghost" size="sm" type="button">
                      Edit
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Profile image
                  </label>
                  <p className="text-sm text-surface-600 mb-4">
                    Upload your own image as your avatar
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--accent-dim)] flex items-center justify-center">
                      <span className="text-[var(--accent)] font-bold text-2xl">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <Button variant="secondary" size="sm" type="button">
                      Upload Image
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeSection === 'auth' && (
            <Card>
              <CardHeader>
                <CardTitle>Emails & Authentication</CardTitle>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Email address
                  </label>
                  <p className="text-sm text-surface-900">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Change password
                  </label>
                  <Button type="button">
                    Update Password
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-surface-900">Low stock alerts</p>
                    <p className="text-sm text-surface-600">Get notified when stock is low</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-[var(--accent)] rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-surface-900">New movements</p>
                    <p className="text-sm text-surface-600">Get notified of new inventory movements</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-[var(--accent)] rounded" />
                </div>
              </CardBody>
            </Card>
          )}

          {activeSection === 'sessions' && (
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="p-4 bg-surface-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-surface-900">Current Session</p>
                        <p className="text-sm text-surface-600">Active now</p>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium bg-[var(--status-ok)] text-[#5caa80] rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeSection === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Language
                  </label>
                  <select className="block w-full px-4 py-2.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)]">
                    <option>English</option>
                    <option>Spanish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Timezone
                  </label>
                  <select className="block w-full px-4 py-2.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)]">
                    <option>UTC</option>
                    <option>America/New_York</option>
                  </select>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
