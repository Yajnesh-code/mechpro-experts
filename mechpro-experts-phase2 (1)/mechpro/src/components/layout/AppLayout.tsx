import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  context: string;
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function AppLayout({ context, title, actions, children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar context={context} title={title} actions={actions} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
