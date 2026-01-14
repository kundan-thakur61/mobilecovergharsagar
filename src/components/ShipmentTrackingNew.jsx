import { useState, useEffect } from 'react';
import { FiPackage, FiTruck, FiMapPin, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { trackShipment } from '../api/shiprocket';

const ShipmentTracking = ({ orderId, waybill, className = '' }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call Shiprocket tracking API
        const data = await trackShipment(orderId, 'regular');

        if (data.success) {
          setTrackingData(data.data);
        } else {
          setError(data.message || 'Failed to fetch tracking data');
        }
      } catch (err) {
        console.error('Tracking fetch error:', err);
        setError('Failed to fetch tracking information');
        toast.error('Tracking information unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [orderId]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'in transit':
      case 'out for delivery':
        return <FiTruck className="w-5 h-5 text-blue-600" />;
      case 'manifested':
      case 'dispatched':
        return <FiPackage className="w-5 h-5 text-orange-600" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'in transit':
      case 'out for delivery':
        return 'text-blue-600 bg-blue-100';
      case 'manifested':
      case 'dispatched':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!waybill) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipment Tracking</h3>
          <p className="text-gray-600">Tracking information will be available once your order is shipped.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tracking Unavailable</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FiPackage className="w-6 h-6 text-primary-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Shipment Tracking</h3>
            <p className="text-sm text-gray-600">Waybill: {waybill}</p>
          </div>
        </div>

        {trackingData && (
          <div className="space-y-4">
            {/* Current Status */}
            <div className={`flex items-center gap-3 p-4 rounded-lg ${getStatusColor(trackingData.status)}`}>
              {getStatusIcon(trackingData.status)}
              <div>
                <h4 className="font-semibold text-lg">{trackingData.status}</h4>
                <p className="text-sm">{trackingData.location}</p>
                {trackingData.dateTime && (
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(trackingData.dateTime).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Tracking History */}
            {trackingData.trackingHistory && trackingData.trackingHistory.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Tracking History</h4>
                <div className="space-y-3">
                  {trackingData.trackingHistory.map((event, index) => (
                    <div key={index} className="flex gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          event.status?.toLowerCase() === 'delivered' ? 'bg-green-100' :
                          event.status?.toLowerCase() === 'in transit' ? 'bg-blue-100' :
                          'bg-gray-100'
                        }`}>
                          {getStatusIcon(event.status)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{event.status}</p>
                        <p className="text-sm text-gray-600">{event.location}</p>
                        {event.date && (
                          <p className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleString()}
                          </p>
                        )}
                        {event.activity && (
                          <p className="text-sm text-gray-600 mt-1">{event.activity}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracking URL */}
            {trackingData.trackingUrl && (
              <div className="text-center">
                <a
                  href={trackingData.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Track on Shiprocket Website
                </a>
              </div>
            )}
          </div>
        )}

        {/* Shiprocket Branding */}
        <div className="text-center text-xs text-gray-500 mt-6">
          Powered by Shiprocket
        </div>
      </div>
    </div>
  );
};

export default ShipmentTracking;
