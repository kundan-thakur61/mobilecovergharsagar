import React, { useState, useRef, useCallback } from 'react';

const MobileFrameMockup = ({ selectedModel, onDesignComplete }) => {
  const [userImage, setUserImage] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Calculate screen rectangle based on the model's frame image
  const [screenRect, setScreenRect] = useState({ left: 30, top: 100, width: 240, height: 400 });

  const calculateScreenRect = (frameWidth = 300, frameHeight = 600) => {
    // These values are approximations - adjust based on actual frame dimensions
    const paddingPercentage = { x: 0.06, y: 0.12 }; // 6% horizontal, 12% vertical padding
    const width = frameWidth * 0.88; // 88% of frame width
    const height = frameHeight * 0.72; // 72% of frame height
    const left = (frameWidth - width) / 2;
    const top = (frameHeight - height) / 2;

    return { left, top, width, height };
  };

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        alert('Image must be under 8MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target.result);
        setTransform({ x: 0, y: 0, scale: 1 });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (!userImage) return;
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - (transform.x * screenRect.width), 
      y: e.clientY - (transform.y * screenRect.height) 
    });
  }, [userImage, transform, screenRect]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !userImage) return;
    const newX = (e.clientX - dragStart.x) / screenRect.width;
    const newY = (e.clientY - dragStart.y) / screenRect.height;
    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart, userImage, screenRect]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const zoomIn = useCallback(() => {
    setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5) }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.1) }));
  }, []);

  const resetPosition = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  const exportAsPNG = useCallback(() => {
    if (!selectedModel || !userImage) return;

    // Create a temporary canvas for the mockup
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on the selected model's first frame
    const frameImage = new Image();
    frameImage.crossOrigin = 'anonymous';
    frameImage.onload = () => {
      canvas.width = frameImage.width;
      canvas.height = frameImage.height;
      
      // Draw the frame
      ctx.drawImage(frameImage, 0, 0);
      
      // Calculate position for the user image within the screen area
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Calculate scaled image dimensions to maintain aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth = screenRect.width * transform.scale;
        let drawHeight = drawWidth / aspectRatio;
        
        if (drawHeight > screenRect.height * transform.scale) {
          drawHeight = screenRect.height * transform.scale;
          drawWidth = drawHeight * aspectRatio;
        }
        
        // Calculate position to center the image and apply transforms
        const x = screenRect.left + (screenRect.width - drawWidth) / 2 + transform.x * screenRect.width;
        const y = screenRect.top + (screenRect.height - drawHeight) / 2 + transform.y * screenRect.height;
        
        // Draw the user image
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Download the combined image
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${selectedModel.name.replace(/\s+/g, '_')}_mockup.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      };
      img.src = userImage;
    };
    
    // Use the first frame of the model as the base
    if (selectedModel.images && selectedModel.images.length > 0) {
      frameImage.src = selectedModel.images[0].url;
    } else {
      // Fallback to a generic frame if no specific frames are available
      // For now we'll use a simple colored rectangle
      canvas.width = 300;
      canvas.height = 600;
      
      // Draw a simple frame
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 300, 600);
      
      // Draw a screen area
      ctx.fillStyle = '#ccc';
      ctx.fillRect(30, 100, 240, 400);
      
      // Draw the user image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Calculate scaled image dimensions to maintain aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth = screenRect.width * transform.scale;
        let drawHeight = drawWidth / aspectRatio;
        
        if (drawHeight > screenRect.height * transform.scale) {
          drawHeight = screenRect.height * transform.scale;
          drawWidth = drawHeight * aspectRatio;
        }
        
        // Calculate position to center the image and apply transforms
        const x = screenRect.left + (screenRect.width - drawWidth) / 2 + transform.x * screenRect.width;
        const y = screenRect.top + (screenRect.height - drawHeight) / 2 + transform.y * screenRect.height;
        
        // Draw the user image
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Download the combined image
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${selectedModel.name.replace(/\s+/g, '_')}_mockup.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      };
      img.src = userImage;
      return; // Skip the rest of the function since we're handling it here
    }
  }, [selectedModel, userImage, transform, screenRect]);

  const handleSaveDesign = useCallback(() => {
    if (!userImage || !selectedModel) {
      alert('Please upload an image and select a model first');
      return;
    }

    // Prepare the design data
    const designData = {
      model: selectedModel,
      image: userImage,
      transform,
      timestamp: new Date().toISOString()
    };

    // Call the callback to handle the completed design
    onDesignComplete && onDesignComplete(designData);
  }, [userImage, selectedModel, transform, onDesignComplete]);

  if (!selectedModel) {
    return <div className="text-center p-8">Please select a phone model first</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Customize Your {selectedModel.company?.name} {selectedModel.name} Cover
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Canvas Preview */}
        <div className="flex justify-center">
          <div
            ref={canvasRef}
            className="relative bg-gray-100 border-2 border-gray-300 cursor-move select-none"
            style={{ 
              width: selectedModel.images && selectedModel.images.length > 0 ? '100%' : '300px',
              height: selectedModel.images && selectedModel.images.length > 0 ? '100%' : '600px',
              maxWidth: '100%',
              maxHeight: '70vh'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Phone Frame Overlay - use the first frame from the model */}
            {selectedModel.images && selectedModel.images.length > 0 ? (
              <img
                src={selectedModel.images[0].url}
                alt={`${selectedModel.name} frame`}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ zIndex: 1 }}
                onLoad={(e) => {
                  // Update canvas dimensions to match the loaded image
                  const img = e.target;
                  canvasRef.current.style.width = `${img.naturalWidth}px`;
                  canvasRef.current.style.height = `${img.naturalHeight}px`;
                  
                  // Update the screen rectangle based on the actual image dimensions
                  const newScreenRect = calculateScreenRect(img.naturalWidth, img.naturalHeight);
                  setScreenRect(newScreenRect);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-[32px]">
                <div className="text-center">
                  <div className="mx-auto bg-gray-300 rounded-[24px] w-64 aspect-[9/19] flex items-center justify-center">
                    <span className="text-gray-500">Frame not available</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Contact admin to add frames for this model</p>
                </div>
              </div>
            )}

            {/* User Image positioned within the screen area */}
            {userImage && selectedModel.images && selectedModel.images.length > 0 && (
              <div 
                className="absolute pointer-events-none"
                style={{
                  left: `${screenRect.left}px`,
                  top: `${screenRect.top}px`,
                  width: `${screenRect.width}px`,
                  height: `${screenRect.height}px`,
                  overflow: 'hidden',
                  zIndex: 2
                }}
              >
                <img
                  src={userImage}
                  alt="User design"
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) scale(${transform.scale}) translate(${transform.x * 100}%, ${transform.y * 100}%)`,
                    transformOrigin: 'center center',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-gray-400 transition-colors rounded-lg">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-gray-600">
                  {userImage ? 'Replace Image' : 'Click to upload your image'}
                </p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 8MB</p>
              </div>
            </label>
          </div>

          {/* Transform Controls */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Adjust Image</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={zoomIn}
                className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Zoom In
              </button>
              <button
                onClick={zoomOut}
                className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Zoom Out
              </button>
              <button
                onClick={resetPosition}
                className="p-3 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={exportAsPNG}
                disabled={!userImage}
                className={`w-full p-3 rounded ${
                  userImage 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Download Mockup
              </button>
              <button
                onClick={handleSaveDesign}
                disabled={!userImage}
                className={`w-full p-3 rounded ${
                  userImage 
                    ? 'bg-purple-500 text-white hover:bg-purple-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save Design
              </button>
            </div>
          </div>

          {/* Model Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Selected Model:</h4>
            <p className="text-sm text-gray-700">
              <span className="font-medium">{selectedModel.company?.name || 'Unknown'}</span> - {selectedModel.name}
            </p>
            {selectedModel.images && selectedModel.images.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Available frames: {selectedModel.images.length}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFrameMockup;