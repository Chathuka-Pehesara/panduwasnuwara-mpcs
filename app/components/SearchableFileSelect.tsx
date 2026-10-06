'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, FileSpreadsheet, Layers } from 'lucide-react';

export interface FileOption {
  fileName: string;
  displayName?: string;
  count: number;
}

interface SearchableFileSelectProps {
  files: FileOption[];
  selectedFile: string;
  onSelect: (fileName: string) => void;
  totalCount?: number;
  allLabel?: string;
  placeholder?: string;
  theme?: 'blue' | 'emerald';
  isSinhala?: boolean;
  className?: string;
}

export default function SearchableFileSelect({
  files,
  selectedFile,
  onSelect,
  totalCount,
  allLabel,
  placeholder,
  theme = 'blue',
  isSinhala = false,
  className = ''
}: SearchableFileSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute total if not explicitly passed
  const computedTotal = useMemo(() => {
    if (typeof totalCount === 'number') return totalCount;
    return files.reduce((acc, f) => acc + (f.count || 0), 0);
  }, [totalCount, files]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return files;
    return files.filter(f => 
      f.fileName.toLowerCase().includes(q) || 
      (f.displayName && f.displayName.toLowerCase().includes(q))
    );
  }, [files, searchQuery]);

  // Selected item details
  const selectedItem = useMemo(() => {
    if (!selectedFile || selectedFile === 'all') return null;
    return files.find(f => f.fileName.toLowerCase() === selectedFile.toLowerCase());
  }, [files, selectedFile]);

  // Theme styling tokens
  const isEmerald = theme === 'emerald';
  const borderFocusClass = isEmerald ? 'focus:border-emerald-600 focus:ring-emerald-600' : 'focus:border-[#003399] focus:ring-[#003399]';
  const activeBgClass = isEmerald ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-blue-50 text-[#003399] border-blue-200';
  const activeIconClass = isEmerald ? 'text-emerald-700' : 'text-[#003399]';
  const badgeClass = isEmerald ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-[#003399]';

  const defaultAllText = isSinhala 
    ? `සියලු ගොනු (${computedTotal.toLocaleString()})`
    : `All Files (${computedTotal.toLocaleString()})`;

  const resolvedAllLabel = allLabel || defaultAllText;

  const handleSelectOption = (fileName: string) => {
    onSelect(fileName);
    setIsOpen(false);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect('all');
  };

  return (
    <div ref={containerRef} className={`relative w-full min-w-0 ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-w-0 flex items-center justify-between gap-2 px-3 py-2 bg-white border rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs text-left ${
          isOpen 
            ? `${isEmerald ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-[#003399] ring-2 ring-[#003399]/20'}` 
            : 'border-neutral-200 hover:border-neutral-300 hover:bg-slate-50/60'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          {selectedItem ? (
            <FileSpreadsheet className={`w-4 h-4 shrink-0 ${activeIconClass}`} />
          ) : (
            <Layers className="w-4 h-4 shrink-0 text-neutral-400" />
          )}

          <span className="truncate text-neutral-900 font-mono text-xs sm:text-[13px] min-w-0">
            {selectedItem ? selectedItem.fileName : resolvedAllLabel}
          </span>

          {selectedItem && (
            <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md font-sans font-bold shrink-0 ${badgeClass}`}>
              {selectedItem.count.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-neutral-400">
          {selectedItem && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClearSelection}
              className="p-1 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
              title={isSinhala ? 'සියල්ල තෝරන්න' : 'Reset to All'}
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-neutral-700' : ''}`} />
        </div>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-150 flex flex-col max-h-80">
          {/* Search Header */}
          <div className="p-2.5 border-b border-neutral-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={placeholder || (isSinhala ? `ගොනු ${files.length}ක් අතර සොයන්න...` : `Search across ${files.length} files...`)}
                className={`w-full pl-8.5 pr-8 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none ${borderFocusClass} transition-all`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1.5 px-1 font-sans">
                <span>
                  {isSinhala ? 'ගැලපෙන ගොනු:' : 'Matching files:'} {filteredFiles.length} / {files.length}
                </span>
                {filteredFiles.length > 0 && (
                  <span>{filteredFiles.reduce((sum, f) => sum + f.count, 0).toLocaleString()} {isSinhala ? 'පේළි' : 'records'}</span>
                )}
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 divide-y divide-neutral-100/60 p-1">
            {/* Pinned "All Files" option */}
            {!searchQuery && (
              <button
                type="button"
                onClick={() => handleSelectOption('all')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                  selectedFile === 'all' || !selectedFile
                    ? activeBgClass
                    : 'hover:bg-slate-50 text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Layers className={`w-3.5 h-3.5 shrink-0 ${selectedFile === 'all' || !selectedFile ? activeIconClass : 'text-neutral-400'}`} />
                  <span className="truncate">{resolvedAllLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-neutral-600 font-bold">
                    {computedTotal.toLocaleString()}
                  </span>
                  {(selectedFile === 'all' || !selectedFile) && (
                    <Check className={`w-3.5 h-3.5 ${activeIconClass}`} />
                  )}
                </div>
              </button>
            )}

            {/* List of Files */}
            {filteredFiles.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400 space-y-1">
                <FileSpreadsheet className="w-6 h-6 mx-auto text-neutral-300" />
                <p className="font-semibold text-neutral-600">
                  {isSinhala ? 'ගොනු කිසිවක් හමු නොවීය' : 'No matching files found'}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {isSinhala ? `"${searchQuery}" සෙවුම වෙනස් කර බලන්න` : `No files match "${searchQuery}"`}
                </p>
              </div>
            ) : (
              filteredFiles.map(f => {
                const isSelected = selectedFile === f.fileName;
                return (
                  <button
                    key={f.fileName}
                    type="button"
                    onClick={() => handleSelectOption(f.fileName)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? activeBgClass
                        : 'hover:bg-slate-50 text-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileSpreadsheet className={`w-3.5 h-3.5 shrink-0 ${isSelected ? activeIconClass : 'text-neutral-400'}`} />
                      <span className="truncate font-mono text-[11.5px] sm:text-xs">
                        {f.fileName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-sans px-1.5 py-0.5 rounded font-bold ${
                        isSelected ? badgeClass : 'bg-slate-100 text-neutral-500'
                      }`}>
                        {f.count.toLocaleString()} {isSinhala ? 'පේළි' : 'rows'}
                      </span>
                      {isSelected && (
                        <Check className={`w-3.5 h-3.5 ${activeIconClass}`} />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer count indicator */}
          <div className="p-2 border-t border-neutral-100 bg-slate-50/60 text-[10.5px] text-neutral-400 flex items-center justify-between px-3">
            <span>
              {isSinhala ? 'මුළු ගොනු ගණන:' : 'Total CSV files:'} <strong className="text-neutral-700">{files.length}</strong>
            </span>
            <span>
              {isSinhala ? 'මුළු දත්ත:' : 'Total rows:'} <strong className="text-neutral-700">{computedTotal.toLocaleString()}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
