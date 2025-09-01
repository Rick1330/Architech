import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Check, 
  AlertCircle, 
  Copy,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'json' | 'yaml' | 'javascript';
  placeholder?: string;
  height?: string;
  disabled?: boolean;
}

export const CodeEditor = ({ 
  value, 
  onChange, 
  language = 'json',
  placeholder = 'Enter your code here...',
  height = '200px',
  disabled = false
}: CodeEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  const validateCode = (code: string) => {
    if (!code.trim()) {
      setValidationError(null);
      setIsValid(true);
      return;
    }

    try {
      if (language === 'json') {
        JSON.parse(code);
      }
      setValidationError(null);
      setIsValid(true);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Invalid code');
      setIsValid(false);
    }
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    validateCode(newValue);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const formatCode = () => {
    try {
      if (language === 'json' && value.trim()) {
        const formatted = JSON.stringify(JSON.parse(value), null, 2);
        handleChange(formatted);
      }
    } catch (error) {
      console.warn('JSON formatting failed:', error);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            {language.toUpperCase()}
          </Badge>
          {isValid ? (
            <Check className="h-4 w-4 text-status-active" />
          ) : (
            <AlertCircle className="h-4 w-4 text-status-error" />
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!value.trim()}
            className="h-6 px-2"
          >
            <Copy className="h-3 w-3" />
          </Button>
          {language === 'json' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={formatCode}
              disabled={!value.trim() || !isValid}
              className="h-6 px-2"
            >
              Format
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2"
          >
            {isExpanded ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className={`relative ${isExpanded ? 'fixed inset-4 z-50 bg-background border border-border rounded-lg shadow-panel' : ''}`}>
        {isExpanded && (
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="font-medium">Code Editor</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className={isExpanded ? 'p-3' : ''}>
          <Textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`font-mono text-sm resize-none ${
              !isValid ? 'border-status-error' : ''
            }`}
            style={{
              height: isExpanded ? 'calc(100vh - 200px)' : height,
              minHeight: isExpanded ? '400px' : '120px',
            }}
          />
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-start gap-2 p-2 bg-status-error/10 border border-status-error/20 rounded-md">
          <AlertCircle className="h-4 w-4 text-status-error mt-0.5 flex-shrink-0" />
          <div className="text-sm text-status-error">
            <p className="font-medium">Validation Error</p>
            <p className="text-xs mt-1">{validationError}</p>
          </div>
        </div>
      )}
    </div>
  );
};