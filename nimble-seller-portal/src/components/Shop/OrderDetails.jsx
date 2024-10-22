import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllOrdersOfShop, getOrderById } from '../../redux/actions/order';
import { server } from '../../server';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AlertCircle, ShoppingCart, ThumbsUp, UtensilsCrossed, Box, Check, X, ArrowLeft, MessageCircle } from 'lucide-react';
import VerificationModal from './VerificationModal';
import AskAlternativesModal from './AskAlternativesModal';

const OrderDetails = () => {
  const { orderDetails, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [action, setAction] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [outOfStockModalOpen, setOutOfStockModalOpen] = useState(false);
  const [confirmModificationModalOpen, setConfirmModificationModalOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [showModifications, setShowModifications] = useState(false);
  const [isAskForAlternatives, setisAskForAlternatives] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [modifiedHasError, setModifiedHasError] = useState(false);
  const [originalHasError, setOriginalHasError] = useState(false);
  const [askAlternativesModalOpen, setAskAlternativesModalOpen] = useState(false);

  const toggleModificationView = () => setShowModifications(!showModifications);

  useEffect(() => {
    dispatch(getOrderById(id));
  }, [dispatch, id]);

  const data = orderDetails;

  useEffect(() => {
    if (data && !data.stockChecked) {
      checkStockAvailability(data.status == 'Needs Review' ? data.modifiedCart : data.cart, setOutOfStockItems);
    }

    if(data && (data.status === 'Ask For Alternatives' || data.status === 'Needs Review')) {
      setisAskForAlternatives(true);
    }
  }, [data]);

  // Function to determine if an item has been modified (added or changed quantity)
  const isItemModified = (originalItem, modifiedItem) => {
    if (!modifiedItem) return false;
    if (!originalItem) return true; // New item
    return originalItem.qty !== modifiedItem.qty;
  };

  // Function to check if an item has been removed
  const isItemRemoved = (originalCart, modifiedCart, itemId) => {
    const modifiedItem = modifiedCart.find((item) => item._id === itemId);
    return !modifiedItem;
  };

  const orderUpdateHandler = async (newStatus) => {
    try {
      await axios.put(
        `${server}/order/update-order-status/${id}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success('Order updated!');
      navigate('/dashboard-orders');
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };


  const handleSuggestAlternate = () => {
  setAskAlternativesModalOpen(true);
};

const handleAlternativesSubmit = async (alternateItems) => {
  try {
    await axios.put(
      `${server}/order/update-order-status/${id}`,
      {
        status: 'User Action Required',
        alternateItems
      },
      { withCredentials: true }
    );
    toast.success('Alternatives requested successfully');
    setAskAlternativesModalOpen(false);
    dispatch(getOrderById(id));
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error updating order');
  }
};

  const handleAction = async (actionType) => {
    setAction(actionType);
    if (actionType === 'Confirm' && data.status === 'Needs Review') {
      try {
        await updateCartAndClearModification();
        const outOfStockItems = await checkStockAvailability(data.modifiedCart);
        if (outOfStockItems.length > 0) {
          setOutOfStockModalOpen(true);
        } else {
          await orderUpdateHandler('Preparing');
        }
      } catch (error) {
        console.error('Error handling confirmation:', error);
      }
    } else if (actionType === 'Reject' && data.status === 'Needs Review') {
      orderUpdateHandler('Cancelled');
    } else if (actionType === 'Accept' && outOfStockItems.length > 0) {
      setOutOfStockModalOpen(true);
    } else {
      let nextStatus;
      switch (actionType) {
        case 'Accept':
          nextStatus = 'Preparing';
          break;
        case 'Reject':
          nextStatus = 'Cancelled';
          break;
        case 'Ask For Alternatives':
          nextStatus = 'Ask For Alternatives';
          break;
        case 'Needs Review':
          nextStatus = 'Needs Review';
          break;
        default:
          return;
      }
      orderUpdateHandler(nextStatus);
    }
  };

  const handleConfirmModification = async () => {
    setConfirmModificationModalOpen(false);
    const outOfStockItems = await checkStockAvailability(data.modifiedCart);
    if (outOfStockItems.length > 0) {
      setOutOfStockModalOpen(true);
    } else {
      await updateCartAndClearModification();
    }
  };

  const updateCartAndClearModification = async () => {
    try {
      await axios.put(
        `${server}/order/update-cart/${id}`,
        {
          modifiedCart: data.modifiedCart
        },
        { withCredentials: true }
      );
      toast.success('Cart updated successfully');
    } catch (error) {
      toast.error('Failed to update cart');
      throw error;
    }
  };

  const getNextStatus = (currentStatus) => {
    const currentIndex = stages.indexOf(currentStatus);
    return currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  };

  const handleStatusUpdate = () => {
    const nextStatus = getNextStatus(data?.status);
    if (data?.status === 'Ready') {
      setModalOpen(true);
    } else if (nextStatus) {
      orderUpdateHandler(nextStatus);
    }
  };

  const stages = isAskForAlternatives
    ? ['Placed', 'Ask For Alternatives', 'Needs Review', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled']
    : ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

    const checkStockAvailability = async (cart) => {
    if (data.stockChecked) {
      console.log('Stock already checked, skipping...');
      return;
    }

    try {
      const productQuantities = cart.map(item => ({
        id: item._id,
        quantity: item.qty
      }));

      const response = await axios.post(`${server}/product/availability`, { productQuantities }, { withCredentials: true });

      const outOfStockItems = cart.filter(cartItem =>
        response.data.some(product =>
          product.productId === cartItem._id && product.available === false
        )
      );

      setOutOfStockItems(outOfStockItems);
      return outOfStockItems;

    } catch (error) {
      console.error('Error checking stock availability:', error);
      toast.error('Error checking stock availability');
      return [];
    }
  };

  const OutOfStockWarningModal = ({ open, onClose, onConfirm, outOfStockItems }) => {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-red-600">Warning: Out of Stock Items</h2>
          <p className="mb-4">The following items are out of stock:</p>
          <ul className="list-disc pl-5 mb-4">
            {outOfStockItems.map((item, index) => (
              <li key={index}>{item.name}</li>
            ))}
          </ul>
          <p className="mb-4">Are you sure you want to accept this order?</p>
          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
              Cancel
            </button>
            <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Accept Anyway
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <button onClick={() => navigate('/dashboard-orders')} className="flex items-center text-teal-600 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Orders
          </button>
          
          <h1 className="text-3xl font-bold text-center mb-6 text-teal-600">Order #{data?._id}</h1>
          
          <ProgressStepper currentStep={data?.status} isAskForAlternatives={isAskForAlternatives} />

          {data?.status === 'Needs Review' && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Action Needed:</strong> The customer has requested a modification.
                <button 
                  className="ml-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  onClick={toggleModificationView}>
                  {showModifications ? 'Back to Full Cart' : 'View Modification Details'}
                </button>
              </p>
            </div>
          )}

          {showModifications && data?.modifiedCart ? (
            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <h2 className="text-xl font-semibold mb-3 text-teal-600">Modified Order Items</h2>
              <div className="space-y-4">
                {data.cart.map((originalItem, index) => {
                  const modifiedItem = data.modifiedCart.find((item) => item._id === originalItem._id);
                  const isRemoved = isItemRemoved(data.cart, data.modifiedCart, originalItem._id);
                  const isModified = isItemModified(originalItem, modifiedItem);

                  return (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-4 rounded-lg transition-all duration-300 ${
                        isRemoved 
                          ? 'bg-gray-200 text-gray-500' 
                          : isModified 
                            ? 'bg-teal-100 border-l-4 border-teal-500' 
                            : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex-grow">
                        <div className={`font-medium ${isModified ? 'text-teal-700' : isRemoved ? 'text-gray-500' : 'text-gray-800'}`}>
                          {originalItem.name} 
                          {!isRemoved && (
                            <span className="ml-2 text-sm font-normal">
                              (Qty: {modifiedItem?.qty || originalItem.qty})
                            </span>
                          )}
                        </div>
                        <div className={`text-sm ${isRemoved ? 'text-gray-400' : 'text-gray-500'}`}>
                          US${originalItem.discountPrice} x {modifiedItem?.qty || originalItem.qty}
                        </div>
                        {isRemoved && (
                          <div className="text-red-500 mt-2 text-sm">
                            This item has been removed
                          </div>
                        )}
                        {isModified && !isRemoved && (
                          <div className="text-teal-600 mt-2 text-sm">
                            Quantity changed: {originalItem.qty} → {modifiedItem.qty}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                      {!originalHasError && originalItem.images && originalItem.images.length > 0 ? (
                        <img 
                          src={originalItem.images[0]?.url} 
                          alt={originalItem.name} 
                          className={`w-16 h-16 object-cover rounded-full ${isRemoved ? 'opacity-50' : ''}`} 
                          onError={() => setOriginalHasError(true)} 
                        />
                      ) : (
                        <div className="flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full">
                          <span className="text-lg font-bold text-white">{originalItem.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      </div>
                    </div>
                  );
                })}

                {data.modifiedCart.map((modifiedItem, index) => {
                  const originalItem = data.cart.find((item) => item._id === modifiedItem._id);
                  if (!originalItem) {
                    return (
                      <div key={index} className="flex justify-between items-center p-4 rounded-lg bg-teal-100 border-l-4 border-teal-500">
                        <div className="flex-grow">
                          <div className="font-medium text-teal-700">
                            {modifiedItem.name} 
                            <span className="ml-2 text-sm font-normal">
                              (Qty: {modifiedItem.qty})
                            </span>
                          </div>
                          <div className="text-sm text-teal-600">
                            US${modifiedItem.discountPrice} x {modifiedItem.qty}
                          </div>
                          <div className="text-teal-600 mt-2 text-sm">
                            New item added
                          </div>
                        </div>
                        <div className="ml-4">
                        {!modifiedHasError && modifiedItem.images && modifiedItem.images.length > 0 ? (
                          <img 
                            src={modifiedItem.images[0]?.url} 
                            alt={modifiedItem.name} 
                            className="w-16 h-16 object-cover rounded-full" 
                            onError={() => setModifiedHasError(true)} 
                          />
                        ) : (
                          <div className="flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full">
                            <span className="text-lg font-bold text-white">{modifiedItem.name.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ) :  (
            <>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-teal-600">Customer Information</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{data?.user?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium">#{data?._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collection Time:</span>
                      <span className="font-medium">{data?.selectedCollectionTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Code:</span>
                      <span className="font-medium">{data?.orderCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${getStatusColor(data?.status)}`}>{data?.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subscription:</span>
                      <span className="font-medium">{data?.isPremium ? 'Premium' : 'Normal'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold text-teal-600">Order Items</h2>
                  <span 
                    onClick={handleSuggestAlternate}
                    className="text-blue-500 underline cursor-pointer"
                  >
                    Ask For Alternatives
                  </span>
                </div>
                <div className="space-y-4">
                  {(data?.status === 'Needs Review' && data?.modifiedCart ? data.modifiedCart : data?.cart)?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <div className="font-medium">
                          {item.name} (Qty: {item.qty})
                        </div>
                        <div className="text-sm text-gray-500">
                          US${item.discountPrice} x {item.qty}
                        </div>
                        {outOfStockItems.find((outOfStockItem) => outOfStockItem._id === item._id) && (
                          <div className="text-red-500 mt-2">
                          {console.log({item})}
                            {item.name} is Out of Stock
                          </div>
                        )}
                      </div>
                      <div>
                        {!hasError && item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]?.url}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-full"
                            onError={() => setHasError(true)}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full">
                            <span className="text-lg font-bold text-white">
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-teal-600">Order Summary</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">US${data?.totalPrice}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-teal-600 mt-3">
                      <span>Total</span>
                      <span>US${data?.totalPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-teal-600">Payment Information</h2>
                  <p>Status: {data?.paymentInfo?.status ? data?.paymentInfo?.status : 'Not Paid'}</p>
                </div>

                <div className="mt-8">
                  {data?.status === 'Needs Review' && (
                    <div className="flex space-x-2">
                      <button className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold" onClick={() => handleAction('Confirm')}>
                        Confirm Modification
                      </button>
                      <button className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold" onClick={() => handleAction('Reject')}>
                        Reject Modification
                      </button>
                    </div>
                  )}
                  {(data?.status === 'Placed' || data?.status === "Ask For Alternatives") && (
                    <div className="flex space-x-2">
                      <button className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold" onClick={() => handleAction('Accept')}>
                        Accept Order
                      </button>
                      <button className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold" onClick={() => handleAction('Reject')}>
                        Reject Order
                      </button>
                    </div>
                  )}
                  {!['Placed', 'Cancelled', 'Ask For Alternatives', 'Needs Review', 'Delivered'].includes(data?.status) && (
                    <button
                      className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                      onClick={handleStatusUpdate}
                    >
                      {`Update to ${getNextStatus(data?.status)}`}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <VerificationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onVerify={() => {
          orderUpdateHandler('Delivered');
          setModalOpen(false);
        }}
        orderId={id}
      />

      <OutOfStockWarningModal
        open={outOfStockModalOpen}
        onClose={() => setOutOfStockModalOpen(false)}
        onConfirm={() => {
          setOutOfStockModalOpen(false);
          orderUpdateHandler('Preparing');
        }}
        outOfStockItems={outOfStockItems}
      />

      <AskAlternativesModal
        open={askAlternativesModalOpen}
        onClose={() => setAskAlternativesModalOpen(false)}
        cart={data?.cart || []}
        onSubmit={handleAlternativesSubmit}
      />
    

      <OutOfStockWarningModal
        open={confirmModificationModalOpen}
        onClose={() => setConfirmModificationModalOpen(false)}
        onConfirm={handleConfirmModification}
        outOfStockItems={[]}
      />
    </div>
  );
};

const ProgressStepper = ({ currentStep, isAskForAlternatives }) => {
  const baseSteps = [
    { key: 'Placed', icon: ShoppingCart, label: 'Placed' },
    { key: 'Confirmed', icon: ThumbsUp, label: 'Confirmed' },
    { key: 'Preparing', icon: UtensilsCrossed, label: 'Preparing' },
    { key: 'Ready', icon: Box, label: 'Ready' },
    { key: 'Delivered', icon: Check, label: 'Delivered' },
    { key: 'Cancelled', icon: X, label: 'Cancelled' }
  ];

  const additionalSteps = [
    { key: 'Ask For Alternatives', icon: MessageCircle, label: 'Ask For Alternatives' },
    { key: 'Needs Review', icon: AlertCircle, label: 'Needs Review' },
  ];

  const steps = isAskForAlternatives
    ? [
        baseSteps[0],
        ...additionalSteps,
        ...baseSteps.slice(1)
      ]
    : baseSteps;

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        return (
          <div key={step.key} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStepIndex ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
              <StepIcon size={20} />
            </div>
            <div className="text-xs mt-2 text-center">{step.label}</div>
          </div>
        );
      })}
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Placed':
    case 'Confirmed':
      return 'text-blue-500';
    case 'Needs Review':
      return 'text-yellow-500';
    case 'Preparing':
      return 'text-orange-500';
    case 'Ready':
    case 'Delivered':
      return 'text-green-500';
    case 'Cancelled':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export default OrderDetails;