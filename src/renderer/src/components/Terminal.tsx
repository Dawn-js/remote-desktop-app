import { useEffect, useRef } from 'react';
import { Terminal as XTermTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  sessionId: string;
  type: 'ssh' | 'local';
  serverId?: string;
}

export default function Terminal({ sessionId, type, serverId }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTermTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const xterm = new XTermTerminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Fira Code, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
      } as any,
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    xterm.open(terminalRef.current);
    fitAddon.fit();

    xterm.onData((data) => {
      if (type === 'ssh') {
        window.electronAPI.ssh.sendInput(sessionId, data);
      } else {
        window.electronAPI.local.sendInput(sessionId, data);
      }
    });

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    const unsubscribeOutput = (type === 'ssh'
      ? window.electronAPI.ssh.onOutput
      : window.electronAPI.local.onOutput
    )((data) => {
      xterm.write(data.data);
    });

    const unsubscribeExit = (type === 'ssh'
      ? window.electronAPI.ssh.onExit
      : window.electronAPI.local.onExit
    )(() => {
      xterm.write('\r\n\x1b[31mSession ended\x1b[0m\r\n');
    });

    const unsubscribeError = (type === 'ssh'
      ? window.electronAPI.ssh.onError
      : window.electronAPI.local.onError
    )((data) => {
      xterm.write(`\r\n\x1b[31mError: ${data.error}\x1b[0m\r\n`);
    });

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribeOutput();
      unsubscribeExit();
      unsubscribeError();
      xterm.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [sessionId, type]);

  useEffect(() => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  });

  return (
    <div
      ref={terminalRef}
      className="h-full w-full bg-terminal-bg"
      style={{ minHeight: '100%' }}
    />
  );
}
