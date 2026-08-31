import { useEffect, useRef } from 'react';
import { Terminal as XTermTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  onData?: (data: string) => void;
}

export const Terminal = ({ onData }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTermTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const xterm = new XTermTerminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selection: '#264f78',
      },
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    xterm.open(terminalRef.current);
    fitAddon.fit();

    xterm.onData((data) => {
      onData?.(data);
    });

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    const handleSshOutput = (event: CustomEvent<string>) => {
      xterm.write(event.detail);
    };

    const handleLocalOutput = (event: CustomEvent<string>) => {
      xterm.write(event.detail);
    };

    window.addEventListener('ssh.onOutput', handleSshOutput as EventListener);
    window.addEventListener('local.onOutput', handleLocalOutput as EventListener);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('ssh.onOutput', handleSshOutput as EventListener);
      window.removeEventListener('local.onOutput', handleLocalOutput as EventListener);
      xterm.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [onData]);

  useEffect(() => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  });

  const write = (data: string) => {
    xtermRef.current?.write(data);
  };

  const clear = () => {
    xtermRef.current?.clear();
  };

  return (
    <div
      ref={terminalRef}
      className="h-full w-full bg-terminal-bg"
      style={{ minHeight: '100%' }}
    />
  );
};