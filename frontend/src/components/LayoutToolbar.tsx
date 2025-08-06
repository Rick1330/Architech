import { useArchitectStore } from '@/stores/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutGrid,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  AlignCenter,
  AlignHorizontalDistributeCenter,
  Move3D,
  Layers,
  Group,
  Ungroup
} from 'lucide-react';

export const LayoutToolbar = () => {
  const {
    nodes,
    autoLayoutNodes,
    alignNodes,
    distributeNodes,
  } = useArchitectStore();

  const selectedNodes = nodes.filter(node => node.selected);
  const hasSelection = selectedNodes.length > 0;
  const canAlign = selectedNodes.length >= 2;
  const canDistribute = selectedNodes.length >= 3;

  return (
    <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg shadow-panel">
      {/* Auto Layout */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={autoLayoutNodes}
          disabled={nodes.length === 0}
          className="h-8 px-2"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Alignment Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alignNodes('left')}
          disabled={!canAlign}
          className="h-8 px-2"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alignNodes('center')}
          disabled={!canAlign}
          className="h-8 px-2"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alignNodes('right')}
          disabled={!canAlign}
          className="h-8 px-2"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alignNodes('top')}
          disabled={!canAlign}
          className="h-8 px-2"
        >
          <AlignVerticalJustifyStart className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alignNodes('bottom')}
          disabled={!canAlign}
          className="h-8 px-2"
        >
          <AlignVerticalJustifyEnd className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Distribution Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => distributeNodes('horizontal')}
          disabled={!canDistribute}
          className="h-8 px-2"
        >
          <AlignHorizontalDistributeCenter className="h-4 w-4 rotate-90" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => distributeNodes('vertical')}
          disabled={!canDistribute}
          className="h-8 px-2"
        >
          <AlignHorizontalDistributeCenter className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Grouping Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canAlign}
          className="h-8 px-2"
        >
          <Group className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasSelection}
          className="h-8 px-2"
        >
          <Ungroup className="h-4 w-4" />
        </Button>
      </div>

      {/* Selection Info */}
      {hasSelection && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <Badge variant="outline" className="text-xs">
            {selectedNodes.length} selected
          </Badge>
        </>
      )}
    </div>
  );
};