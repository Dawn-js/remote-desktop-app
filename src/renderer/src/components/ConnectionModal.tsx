import React, { useState } from 'react';

interface ConnectionModalProps {
  onClose: () => void;
  onConnect: (server: {
    name: string;
    host: string;
    port: number;
    username: string;
    authMethod: 'password' | 'key';
    password?: string;
    privateKeyPath?: string;
    group: string;
  }) => void;
}

export default function ConnectionModal({ onClose, onConnect }: ConnectionModalProps) {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('');
  const [authMethod, setAuthMethod] = useState<'password' | 'key'>('password');
  const [password, setPassword] = useState('');
  const [privateKeyPath, setPrivateKeyPath] = useState('');
  const [group, setGroup] = useState('Cloud');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect({
      name,
      host,
      port: Number(port),
      username,
      authMethod,
      password: authMethod === 'password' ? password : undefined,
      privateKeyPath: authMethod === 'key' ? privateKeyPath : undefined,
      group,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-terminal-black border border-terminal-selection rounded-xl p-6 w-[480px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-terminal-fg mb-4">New Connection</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-terminal-brightBlack mb-1">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Server" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm text-terminal-brightBlack mb-1">Host</label>
              <input className="input" value={host} onChange={(e) => setHost(e.target.value)} placeholder="192.168.1.1" required />
            </div>
            <div>
              <label className="block text-sm text-terminal-brightBlack mb-1">Port</label>
              <input className="input" value={port} onChange={(e) => setPort(e.target.value)} placeholder="22" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-terminal-brightBlack mb-1">Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="root" required />
          </div>
          <div>
            <label className="block text-sm text-terminal-brightBlack mb-1">Auth Method</label>
            <select className="input" value={authMethod} onChange={(e) => setAuthMethod(e.target.value as 'password' | 'key')}>
              <option value="password">Password</option>
              <option value="key">SSH Key</option>
            </select>
          </div>
          {authMethod === 'password' ? (
            <div>
              <label className="block text-sm text-terminal-brightBlack mb-1">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-terminal-brightBlack mb-1">Private Key Path</label>
              <input className="input" value={privateKeyPath} onChange={(e) => setPrivateKeyPath(e.target.value)} placeholder="~/.ssh/id_rsa" required />
            </div>
          )}
          <div>
            <label className="block text-sm text-terminal-brightBlack mb-1">Group</label>
            <select className="input" value={group} onChange={(e) => setGroup(e.target.value)}>
              <option>Local</option>
              <option>Cloud</option>
              <option>Production</option>
              <option>Development</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Connect</button>
          </div>
        </form>
      </div>
    </div>
  );
}
