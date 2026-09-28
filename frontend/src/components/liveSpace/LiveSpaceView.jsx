import React from 'react';
import { ThreeDimensionalTwinView } from '../virtualLab/ThreeDimensionalTwinView';

export function LiveSpaceView() {
  return (
    <div className="w-full h-full min-h-[calc(100vh-2rem)] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      <ThreeDimensionalTwinView />
    </div>
  );
}
