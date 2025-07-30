'use client';
import { useAppContext } from '@/contexts/app-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { LogEntry } from '@/lib/types';
import { useMemo } from 'react';

interface ComponentLogsProps {
    componentId: string;
}

export default function ComponentLogs({ componentId }: ComponentLogsProps) {
  const { state } = useAppContext();
  
  const filteredLogs = useMemo(() => {
    return state.logs.filter(log => log.component.startsWith(componentId));
  }, [state.logs, componentId]);

  const getLevelBadge = (level: LogEntry['level']) => {
    return (
      <Badge
        variant="outline"
        className={cn(
          level === 'INFO' && 'border-blue-500 text-blue-500',
          level === 'WARN' && 'border-yellow-500 text-yellow-500',
          level === 'ERROR' && 'border-red-500 text-red-500'
        )}
      >
        {level}
      </Badge>
    );
  };
  
  if (filteredLogs.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No logs for this component.</div>
  }

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[80px]">Level</TableHead>
            <TableHead className="w-[150px]">Timestamp</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.map(log => (
            <TableRow key={log.id}>
              <TableCell>{getLevelBadge(log.level)}</TableCell>
              <TableCell className="text-muted-foreground text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
              <TableCell>
                <span className="text-muted-foreground font-mono">{log.message}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
