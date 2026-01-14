import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiTruck, FiMapPin, FiCreditCard, FiShoppingBag, FiRefreshCw } from 'react-icons/fi';
import orderAPI from '../api/orderAPI';
import paymentAPI from '../api/paymentAPI';
import { formatPrice, formatDate, getProductImage, resolveImageUrl, generateOrderNumber } from '../utils/helpers';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import ShipmentTrackingNew from '../components/ShipmentTrackingNew';


const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch payment status
  const fetchPaymentStatus = useCallback(async () => {
    try {
      const response = await paymentAPI.getPaymentStatus(id);
      const status = response.data?.data;
      setPaymentStatus(status);
      return status;
    } catch (err) {
      console.debug('Failed to fetch payment status:', err);
      return null;
    }
  }, [id]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [orderRes, statusRes] = await Promise.all([
        orderAPI.getOrder(id),
        fetchPaymentStatus()
      ]);
      const orderData = orderRes.data?.data?.order || orderRes.data?.order || orderRes.data;
      setOrder(orderData);
      toast.success('Order status updated');
    } catch (err) {
      toast.error('Failed to refresh status');
    } finally {
      setIsRefreshing(false);
    }
  };


  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderAPI.getOrder(id);
        // Handle different response structures
        const orderData = response.data?.data?.order || response.data?.order || response.data;
        setOrder(orderData);
        // Also fetch initial payment status
        await fetchPaymentStatus();
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError(err.response?.data?.message || 'Failed to load order details');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, fetchPaymentStatus]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!id) return;

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 
                      window.location.origin;
    
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.debug('Socket connected for order updates');
      // Join the order room to receive updates
      socket.emit('join', id);
    });

    // Listen for payment status updates
    socket.on('paymentSuccess', (data) => {
      if (data.orderId === id) {
        toast.success('Payment confirmed!');
        setPaymentStatus(prev => ({ ...prev, paymentStatus: 'paid' }));
        // Refresh order data
        orderAPI.getOrder(id).then(res => {
          const orderData = res.data?.data?.order || res.data?.order || res.data;
          setOrder(orderData);
        });
      }
    });

    socket.on('paymentFailed', (data) => {
      if (data.orderId === id) {
        toast.error('Payment failed: ' + (data.error || 'Unknown error'));
        setPaymentStatus(prev => ({ ...prev, paymentStatus: 'failed' }));
      }
    });

    socket.on('orderStatusUpdate', (data) => {
      if (data.orderId === id) {
        toast.info(`Order status: ${data.status}`);
        setOrder(prev => prev ? { ...prev, status: data.status } : prev);
      }
    });

    socket.on('refundCompleted', (data) => {
      if (data.orderId === id) {
        toast.info('Refund processed successfully');
        setPaymentStatus(prev => ({ ...prev, refundStatus: 'completed' }));
      }
    });

    return () => {
      socket.emit('leave', id);
      socket.disconnect();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiPackage className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you\'re looking for doesn\'t exist.'}</p>
          <Link
            to="/products"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const orderNumber = order._id ? generateOrderNumber(order._id) : 'ORD-XXXXXX';
  const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SEO
        title={`Order Confirmed - ${orderNumber} | Mobile Covers`}
        description="Your order has been successfully placed. View order details and track your shipment."
        url={`/order-success/${id}`}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Success Header */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-6 text-center">
            <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
            </div>
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FiPackage className="w-5 h-5" />
                  Order Items ({totalItems})
                </h2>
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image ? resolveImageUrl(item.image) : getProductImage(item.productId)}
                          alt={item.title || item.productId?.title || 'Product'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.svg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {item.title || item.designMeta?.title || item.designMeta?.name || item.productId?.title || 'Custom Product'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.brand} • {item.model}{item.material ? ` • ${item.material}` : ''}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Qty: {item.quantity || 1}</span>
                          <span className="font-semibold">{formatPrice(item.price * (item.quantity || 1))}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FiTruck className="w-5 h-5" />
                  Order Status
                </h2>
                
                {/* Shipment Tracking Component */}
                {order.shiprocket?.waybill && (
                  <ShipmentTrackingNew
                    waybill={order.shiprocket.waybill}
                    orderId={order._id}
                    className="mt-4"
                  />
                )}
                
                {/* Fallback for orders without shipment */}
                {!order.shiprocket?.waybill && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Order Placed</p>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt || new Date())}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiPackage className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Order Confirmed</p>
                        <p className="text-sm text-gray-600">We're preparing your order for shipment</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Order Summary Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number</span>
                    <span className="font-semibold">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date</span>
                    <span className="font-semibold">{formatDate(order.createdAt || new Date())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-semibold capitalize">{order.payment?.method || 'Online Payment'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-semibold capitalize ${
                      order.status === 'delivered' ? 'text-green-600' :
                      order.status === 'cancelled' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(order.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5" />
                  Shipping Address
                </h2>
                {order.shippingAddress && (
                  <div className="text-gray-700">
                    <p className="font-semibold">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.phone}</p>
                    <p className="mt-2">
                      {order.shippingAddress.address1}
                      {order.shippingAddress.address2 && `, ${order.shippingAddress.address2}`}
                    </p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5" />
                  Payment Information
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-semibold capitalize">{order.payment?.method || 'Online Payment'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-semibold">{formatPrice(order.total || 0)}</span>
                  </div>
                  {order.payment?.status && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status</span>
                      <span className={`font-semibold capitalize ${
                        (paymentStatus?.paymentStatus || order.payment?.status) === 'paid' ? 'text-green-600' :
                        (paymentStatus?.paymentStatus || order.payment?.status) === 'failed' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {paymentStatus?.paymentStatus || order.payment?.status}
                      </span>
                    </div>
                  )}
                  {paymentStatus?.refundStatus && paymentStatus.refundStatus !== 'none' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refund Status</span>
                      <span className={`font-semibold capitalize ${
                        paymentStatus.refundStatus === 'completed' ? 'text-green-600' :
                        paymentStatus.refundStatus === 'failed' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {paymentStatus.refundStatus}
                      </span>
                    </div>
                  )}
                  {paymentStatus?.refundAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refund Amount</span>
                      <span className="font-semibold">{formatPrice(paymentStatus.refundAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">What's Next?</h2>
                <div className="space-y-3">
                  <Link
                    to="/orders"
                    className="w-full bg-primary-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiPackage className="w-5 h-5" />
                    View All Orders
                  </Link>
                  <Link
                    to="/products"
                    className="w-full bg-gray-100 text-gray-900 text-center py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiShoppingBag className="w-5 h-5" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
  );
};

export default OrderSuccess;
