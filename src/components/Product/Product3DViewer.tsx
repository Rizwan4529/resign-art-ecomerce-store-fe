import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Move3D } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { getImageUrl } from '../../utils/imageUtils';

interface Product3DViewerProps {
  images: string[];
  productName: string;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({ images, productName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotation(prev => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.2));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(0.5, prev - 0.2));
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Auto-rotate simulation
  useEffect(() => {
    if (!isDragging) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isDragging, images.length]);

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl overflow-hidden">
      {/* 3D Viewer Container */}
      <div
        ref={viewerRef}
        className="relative aspect-square cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Main Product Image with 3D Transform */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          <ImageWithFallback
            src={getImageUrl(images[currentImageIndex])}
            alt={`${productName} - View ${currentImageIndex + 1}`}
            className="w-full h-full object-cover rounded-lg shadow-2xl"
          />
          
          {/* Reflection Effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent pointer-events-none"
            style={{
              transform: `rotateX(${Math.abs(rotation.x) * 0.1}deg)`
            }}
          />
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex
                  ? 'bg-white shadow-lg'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Loading Overlay for 3D Effect */}
        {isDragging && (
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        )}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={zoomIn}
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={zoomOut}
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={resetView}
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Move3D className="w-4 h-4" />
          <span>Drag to rotate • Scroll to zoom</span>
        </div>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-sm px-3 py-1 rounded-lg">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};