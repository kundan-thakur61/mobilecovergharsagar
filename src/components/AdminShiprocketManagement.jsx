import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as shiprocketAPI from '../api/shiprocket';

/**
 * Admin Shiprocket Management Component
 * Manage shipments for orders
 */
export default function AdminShiprocketManagement({ orderId, orderType = 'regular', order, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [shipmentData, setShipmentData] = useState(order?.shiprocket || null);
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [showCourierSelection, setShowCourierSelection] = useState(false);

  // Update shipmentData when order prop changes
  useEffect(() => {
    setShipmentData(order?.shiprocket || null);
  }, [order?.shiprocket]);

  // Get recommended couriers
  const handleGetCouriers = async (skipShipmentCreation = false) => {
    if (loading && !skipShipmentCreation) return;

    try {
      setLoading(true);
      const result = await shiprocketAPI.getRecommendedCouriers(orderId, orderType);

      if (result.success && result.data.couriers) {
        setCouriers(result.data.couriers);
        setShipmentData(prev => ({ ...prev, shipmentId: result.data.shipmentId }));
        setShowCourierSelection(true);
        toast.success(`Found ${result.data.couriers.length} available couriers`);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message === 'Shipment not created yet' && !skipShipmentCreation) {
        toast.error('Please create shipment first using "Create Shipment" button');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch couriers');
        console.error('Get couriers error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create shipment
  const handleCreateShipment = async () => {
    if (loading) return;
    
    if (shipmentData?.shipmentId) {
      toast.info('Shipment already created for this order');
      return;
    }

    try {
      setLoading(true);
      const result = await shiprocketAPI.createShipment(orderId, orderType, {
        pickupLocationId: 19334183,
        dimensions: { length: 17, breadth: 4, height: 2 },
        weight: 0.15
      });

      if (result.success) {
        setShipmentData(result.data);
        toast.success('Shipment created successfully!');

        toast.info('Fetching available couriers...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await handleGetCouriers(true);

        if (onUpdate) onUpdate();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create shipment');
      console.error('Create shipment error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Assign courier
  const handleAssignCourier = async (courierId = null) => {
    if (loading) return;
    
    // If no courierId is provided, auto-select the cheapest courier
    let finalCourierId = courierId;
    if (!finalCourierId && couriers.length > 0) {
      // Sort couriers by freight cost and select the cheapest
      const cheapestCourier = [...couriers].sort((a, b) => a.freight - b.freight)[0];
      finalCourierId = cheapestCourier.id;
      toast.info(`Auto-selected cheapest courier: ${cheapestCourier.name} (₹${cheapestCourier.freight})`);
    }
    
    if (!finalCourierId) {
      toast.error('No courier selected. Please get available couriers first.');
      return;
    }
    
    try {
      setLoading(true);
      const result = await shiprocketAPI.assignCourier(orderId, orderType, finalCourierId);

      if (result.success) {
        toast.success(`Courier assigned! AWB: ${result.data.awbCode}`);
        setShowCourierSelection(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to assign courier';
      toast.error(message);
      console.error('Assign courier error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Request pickup
  const handleRequestPickup = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const result = await shiprocketAPI.requestPickup(orderId, orderType);

      if (result.success) {
        toast.success('Pickup requested successfully!');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request pickup';
      toast.error(message);
      console.error('Request pickup error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate label
  const handleGenerateLabel = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const result = await shiprocketAPI.generateLabel(orderId, orderType);

      if (result.success && result.data.labelUrl) {
        window.open(result.data.labelUrl, '_blank');
        toast.success('Label generated! Opening in new tab...');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate label';
      toast.error(message);
      console.error('Generate label error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cancel shipment
  const handleCancelShipment = async () => {
    if (!confirm('Are you sure you want to cancel this shipment?')) return;

    try {
      setLoading(true);
      const result = await shiprocketAPI.cancelShipment(orderId, orderType);

      if (result.success) {
        toast.success('Shipment cancelled successfully');
        setShipmentData(null); // Clear shipment data on cancel
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      // For cancel shipment, if shipment not created, just show the error
      // (doesn't make sense to create shipment just to cancel it)
      toast.error(error.response?.data?.message || 'Failed to cancel shipment');
      console.error('Cancel shipment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-6 mt-4">
      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-xl sm:text-2xl">🚚</span>
        <span className="truncate">Shiprocket Management</span>
      </h3>

      {/* Existing Shipment Status */}
      {shipmentData?.shipmentId && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600">✅</span>
            <span className="font-semibold text-green-800">Shipment Created</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Shipment ID:</span>
              <span className="font-mono ml-1">{shipmentData.shipmentId}</span>
            </div>
            {shipmentData.awbCode && (
              <div>
                <span className="text-gray-600">AWB Code:</span>
                <span className="font-mono ml-1">{shipmentData.awbCode}</span>
              </div>
            )}
            {shipmentData.courierName && (
              <div>
                <span className="text-gray-600">Courier:</span>
                <span className="ml-1">{shipmentData.courierName}</span>
              </div>
            )}
            {shipmentData.status && (
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-1 capitalize">{shipmentData.status}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-4">
        <button
          onClick={handleCreateShipment}
          disabled={loading || shipmentData?.shipmentId}
          className={`px-3 py-2 sm:px-4 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm ${
            shipmentData?.shipmentId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? '⏳' : '📦'} <span className="hidden sm:inline">Create</span> Shipment
        </button>

        <button
          onClick={() => handleAssignCourier()}
          disabled={loading || !shipmentData?.shipmentId}
          className={`px-3 py-2 sm:px-4 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm ${
            !shipmentData?.shipmentId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? '⏳' : '🚀'} <span className="hidden sm:inline">Auto-</span>Assign
        </button>

        <button
          onClick={handleGetCouriers}
          disabled={loading || !shipmentData?.shipmentId}
          className={`px-3 py-2 sm:px-4 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm ${
            !shipmentData?.shipmentId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {loading ? '⏳' : '📋'} <span className="hidden sm:inline">View</span> Couriers
        </button>

        <button
          onClick={handleRequestPickup}
          disabled={loading || !shipmentData?.shipmentId}
          className={`px-3 py-2 sm:px-4 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm ${
            !shipmentData?.shipmentId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {loading ? '⏳' : '📦'} <span className="hidden sm:inline">Request</span> Pickup
        </button>

        <button
          onClick={handleGenerateLabel}
          disabled={loading || !shipmentData?.shipmentId}
          className={`px-3 py-2 sm:px-4 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm ${
            !shipmentData?.shipmentId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? '⏳' : '🏷️'} <span className="hidden sm:inline">Generate</span> Label
        </button>

        <button
          onClick={handleCancelShipment}
          disabled={loading || !shipmentData?.shipmentId}
          className={`px-3 py-2 sm:px-4 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm col-span-2 sm:col-span-1 ${
            !shipmentData?.shipmentId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {loading ? '⏳' : '❌'} Cancel
        </button>
      </div>

      {/* Courier Selection */}
      {showCourierSelection && couriers.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold mb-3 text-sm sm:text-base">Select Courier:</h4>
          <div className="grid gap-2 sm:gap-3 max-h-80 overflow-y-auto">
            {couriers.map((courier) => (
              <div
                key={courier.id}
                className={`border rounded-lg p-3 sm:p-4 cursor-pointer hover:border-blue-500 transition ${
                  selectedCourier === courier.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedCourier(courier.id)}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm sm:text-base">{courier.name}</h5>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Delivery: {courier.estimatedDeliveryDays}
                      {courier.rating && ` • Rating: ${courier.rating}⭐`}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-base sm:text-lg">₹{courier.freight}</p>
                    {courier.etd && (
                      <p className="text-xs text-gray-500">ETA: {courier.etd}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => handleAssignCourier(selectedCourier)}
            disabled={!selectedCourier || loading}
            className="mt-4 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
          >
            {loading ? 'Assigning...' : 'Assign Selected Courier'}
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg text-xs sm:text-sm text-gray-600">
        <p className="font-semibold mb-2">Workflow:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li key="create-shipment" className={shipmentData?.shipmentId ? 'line-through text-green-600' : ''}>
            Create Shipment in Shiprocket
          </li>
          <li key="assign-courier" className={!shipmentData?.shipmentId ? 'text-gray-400' : shipmentData?.awbCode ? 'line-through text-green-600' : ''}>
            Auto-assign cheapest courier OR select manually
          </li>
          <li key="generate-label" className={!shipmentData?.shipmentId ? 'text-gray-400' : ''}>
            Generate shipping label (optional)
          </li>
          <li key="request-pickup" className={!shipmentData?.shipmentId ? 'text-gray-400' : ''}>
            Request pickup from courier
          </li>
        </ol>
        {shipmentData?.shipmentId && (
          <p className="mt-2 text-green-600 font-medium">
            ✅ Shipment created successfully! Proceed with courier assignment and pickup.
          </p>
        )}
      </div>
    </div>
  );
}
