import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { useApp } from '../../hooks/useApp';

interface TopbarProps {
  context: string;
  title: string;
  actions?: React.ReactNode;
}

export default function Topbar({ context, title, actions }: TopbarProps) {
  const [search, setSearch] = useState('');

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-context">{context}</span>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        <div className="search-bar">
          <Search size={14} color="var(--text-muted)" />
          <input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="icon-btn">
          <Bell size={16} />
        </button>
        {actions}
        <button className="btn-logout">Logout</button>
      </div>
    </header>
  );
}
