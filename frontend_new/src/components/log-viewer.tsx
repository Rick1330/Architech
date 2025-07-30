'use client';
import { useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { LogEntry } from '@/lib/types';

export default function LogViewer() {
  const { state } = useAppContext();
  const { logs } = state;
  const [levelFilter, setLevelFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredLogs = logs.filter(log => {
    const levelMatch = levelFilter === 'all' || log.level.toLowerCase() === levelFilter;
    const searchMatch = searchFilter === '' || log.message.toLowerCase().includes(searchFilter.toLowerCase()) || log.component.toLowerCase().includes(searchFilter.toLowerCase());
    return levelMatch && searchMatch;
  });

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Log Viewer</CardTitle>
        <CardDescription>View structured logs from the simulation.</CardDescription>
        <div className="flex items-center gap-2 pt-2">
          <Input 
            placeholder="Search logs..." 
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="flex-1"
          />
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead className="w-[100px]">Level</TableHead>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{getLevelBadge(log.level)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground mr-2">{log.component}:</span>
                    <span className="text-muted-foreground font-mono">{log.message}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
