import React from 'react';

export const RadarBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Radar container */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Radar circles */}
        <div className="relative w-96 h-96">
          {/* Outer circles */}
          <div className="absolute inset-0 rounded-full border border-primary/10 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-4 rounded-full border border-primary/15 animate-pulse" style={{ animationDuration: '2.5s' }} />
          <div className="absolute inset-8 rounded-full border border-primary/20 animate-pulse" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-12 rounded-full border border-primary/25 animate-pulse" style={{ animationDuration: '1.5s' }} />
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary/30 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          
          {/* Radar sweep */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div 
              className="absolute top-1/2 left-1/2 w-0 h-0 origin-left transform -translate-y-1/2 animate-spin"
              style={{
                borderTop: '192px solid transparent',
                borderBottom: '192px solid transparent',
                borderLeft: '192px solid hsl(var(--primary) / 0.1)',
                filter: 'blur(2px)',
                animationDuration: '4s',
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite'
              }}
            />
          </div>
        </div>
        
        {/* Secondary radar - smaller and offset */}
        <div className="absolute -top-32 -right-32 w-64 h-64 opacity-60">
          <div className="absolute inset-0 rounded-full border border-primary/8 animate-pulse" style={{ animationDuration: '2.8s' }} />
          <div className="absolute inset-3 rounded-full border border-primary/12 animate-pulse" style={{ animationDuration: '2.3s' }} />
          <div className="absolute inset-6 rounded-full border border-primary/16 animate-pulse" style={{ animationDuration: '1.8s' }} />
          
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary/20 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div 
              className="absolute top-1/2 left-1/2 w-0 h-0 origin-left transform -translate-y-1/2 animate-spin"
              style={{
                borderTop: '128px solid transparent',
                borderBottom: '128px solid transparent',
                borderLeft: '128px solid hsl(var(--primary) / 0.08)',
                filter: 'blur(1px)',
                animationDuration: '6s',
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};