import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className={`
        relative w-16 h-8 rounded-full border-2 transition-all duration-300 overflow-hidden
        ${theme === 'dark' 
          ? 'bg-slate-800 border-slate-600 hover:bg-slate-700' 
          : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
        }
      `}
    >
      {/* Toggle slider */}
      <div
        className={`
          absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center
          ${theme === 'dark'
            ? 'left-0.5 bg-slate-900 text-yellow-400'
            : 'left-8 bg-white text-slate-600'
          }
        `}
      >
        {theme === 'dark' ? (
          <Moon className="w-3 h-3" />
        ) : (
          <Sun className="w-3 h-3" />
        )}
      </div>
      
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Moon className={`w-3 h-3 transition-opacity ${theme === 'dark' ? 'opacity-0' : 'opacity-30'}`} />
        <Sun className={`w-3 h-3 transition-opacity ${theme === 'light' ? 'opacity-0' : 'opacity-30'}`} />
      </div>
    </Button>
  );
}