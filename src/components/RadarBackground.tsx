import React from 'react';

export const RadarBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Radar container */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Radar circles */}
        <div className="relative w-[600px] h-[600px]">
          {/* Outer circles */}
          <div className="absolute inset-0 rounded-full border border-gray-500/5 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-6 rounded-full border border-gray-400/8 animate-pulse" style={{ animationDuration: '3.5s' }} />
          <div className="absolute inset-12 rounded-full border border-gray-400/10 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-18 rounded-full border border-gray-300/12 animate-pulse" style={{ animationDuration: '2.5s' }} />
          <div className="absolute inset-24 rounded-full border border-gray-300/15 animate-pulse" style={{ animationDuration: '2s' }} />
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-400/20 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          
          {/* Radar sweep */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div 
              className="absolute top-1/2 left-1/2 w-0 h-0 origin-left transform -translate-y-1/2 animate-spin"
              style={{
                borderTop: '300px solid transparent',
                borderBottom: '300px solid transparent',
                borderLeft: '300px solid hsl(220 9% 46% / 0.06)',
                filter: 'blur(3px)',
                animationDuration: '6s',
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite'
              }}
            />
          </div>
        </div>
        
        {/* Secondary radar - smaller and offset */}
        <div className="absolute -top-48 -right-48 w-96 h-96 opacity-40">
          <div className="absolute inset-0 rounded-full border border-gray-500/4 animate-pulse" style={{ animationDuration: '3.8s' }} />
          <div className="absolute inset-4 rounded-full border border-gray-400/6 animate-pulse" style={{ animationDuration: '3.3s' }} />
          <div className="absolute inset-8 rounded-full border border-gray-400/8 animate-pulse" style={{ animationDuration: '2.8s' }} />
          
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-gray-400/15 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div 
              className="absolute top-1/2 left-1/2 w-0 h-0 origin-left transform -translate-y-1/2 animate-spin"
              style={{
                borderTop: '192px solid transparent',
                borderBottom: '192px solid transparent',
                borderLeft: '192px solid hsl(220 9% 46% / 0.04)',
                filter: 'blur(2px)',
                animationDuration: '8s',
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