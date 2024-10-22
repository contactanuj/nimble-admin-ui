import React, { useState } from 'react';
import { X } from 'lucide-react';

const AskAlternativesModal = ({ open, onClose, cart, onSubmit }) => {
  const [selectedItems, setSelectedItems] = useState({});

  const handleQuantityChange = (itemId, quantity) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        requestedQuantity: Math.max(1, Math.min(quantity, prev[itemId]?.item.qty || 1))
      }
    }));
  };

  const handleCheckboxChange = (item) => {
    setSelectedItems(prev => {
      if (prev[item._id]) {
        const { [item._id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [item._id]: {
          item,
          requestedQuantity: item.qty,
          note: ''
        }
      };
    });
  };

  const handleNoteChange = (itemId, note) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        note
      }
    }));
  };

  const handleSubmit = () => {
    const alternateItems = Object.values(selectedItems).map(({ item, requestedQuantity, note }) => ({
      _id: item._id,
      name: item.name,
      originalQuantity: item.qty,
      requestedQuantity,
      note,
      images: item.images,
      discountPrice: item.discountPrice
    }));

    onSubmit(alternateItems);
  };

  const resetForm = () => {
    setSelectedItems({});
  };

  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-teal-600">Request Alternatives</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Select items that need alternatives and specify the quantity needed:
          </p>
          
          <div className="space-y-4">
            {cart?.map((item) => (
              <div key={item._id} className="flex flex-col p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={!!selectedItems[item._id]}
                      onChange={() => handleCheckboxChange(item)}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <div className="flex items-center space-x-3">
                      {item.images && item.images[0] ? (
                        <img
                          src={item.images[0].url}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-500">{item.name[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Current qty: {item.qty}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedItems[item._id] && (
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Need alternatives for:</label>
                      <input
                        type="number"
                        min="1"
                        max={item.qty}
                        value={selectedItems[item._id].requestedQuantity}
                        onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border rounded focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  )}
                </div>

                {selectedItems[item._id] && (
                  <div className="mt-2">
                    <textarea
                      placeholder="Add a note about alternatives (optional)"
                      value={selectedItems[item._id].note}
                      onChange={(e) => handleNoteChange(item._id, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm"
                      rows="2"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedItems).length === 0}
            className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Request Alternatives
          </button>
        </div>
      </div>
    </div>
  );
};

export default AskAlternativesModal;