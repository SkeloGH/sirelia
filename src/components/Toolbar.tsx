import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText,
  Image,
  GitBranch,
  Move,
  MousePointer
} from 'lucide-react';

interface ToolbarProps {
  scale: number;
  navigationMode: 'drag' | 'select';
  isDisabled?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleNavigationMode: () => void;
  onExportMmd: () => void;
  onExportGv: () => void;
  onExportPng: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  scale,
  navigationMode,
  isDisabled = false,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleNavigationMode,
  onExportMmd,
  onExportGv,
  onExportPng
}) => {
  const buttonClass = isDisabled 
    ? "p-1.5 text-gray-400 cursor-not-allowed" 
    : "p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors";

  const navigationButtonClass = isDisabled
    ? "p-1.5 text-gray-400 cursor-not-allowed"
    : navigationMode === 'drag'
      ? "p-1.5 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 rounded transition-colors"
      : "p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors";

  return (
    <div className={`flex-shrink-0 flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${isDisabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center space-x-1">
        <button
          disabled={isDisabled}
          onClick={onZoomIn}
          className={buttonClass}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          disabled={isDisabled}
          onClick={onZoomOut}
          className={buttonClass}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          disabled={isDisabled}
          onClick={onResetView}
          className={buttonClass}
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
          {Math.round(scale * 100)}%
        </span>
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          disabled={isDisabled}
          onClick={onToggleNavigationMode}
          className={navigationButtonClass}
          title={navigationMode === 'drag' ? 'Drag Mode (Active)' : 'Select Mode (Active)'}
        >
          {navigationMode === 'drag' ? (
            <Move className="w-4 h-4" />
          ) : (
            <MousePointer className="w-4 h-4" />
          )}
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400 mx-2">
          {navigationMode === 'drag' ? 'Drag' : 'Select'}
        </span>
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          disabled={isDisabled}
          onClick={onExportMmd}
          className={buttonClass}
          title="Export as .mmd"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button
          disabled={isDisabled}
          onClick={onExportGv}
          className={buttonClass}
          title="Export as .gv"
        >
          <GitBranch className="w-4 h-4" />
        </button>
        <button
          disabled={isDisabled}
          onClick={onExportPng}
          className={buttonClass}
          title="Export as .png"
        >
          <Image className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar; 