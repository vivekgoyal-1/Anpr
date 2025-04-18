import React, { useState } from 'react';
import { addVehicle } from '../services/api';

const ActionPanel = ({ result, onVehicleAdded }) => {
  const { plateNumber, isRegistered } = result || {};
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: '',
    contactInfo: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!plateNumber) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-center">
          <p className="text-gray-500">No plate detected yet</p>
          <p className="text-sm text-gray-400 mt-1">Actions will appear when a plate is detected</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ownerName || !formData.contactInfo) {
      alert('Owner name and contact information are required.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await addVehicle({
        plateNumber,
        ownerInfo: {
          ownerName: formData.ownerName,
          contactInfo: formData.contactInfo,
          additionalInfo: formData.additionalInfo
        }
      });
      
      alert(`Vehicle with plate ${plateNumber} added successfully!`);
      setShowAddForm(false);
      
      // Notify parent component to refresh data
      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Failed to add vehicle to database: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showAddForm) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add Vehicle</h2>
        <form onSubmit={handleSubmit} className="space-y-3 p-3 border border-gray-200 rounded-md bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
            <input
              type="text"
              value={plateNumber}
              disabled
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name*</label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info*</label>
            <input
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info</label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="2"
            ></textarea>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Actions</h2>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Vehicle Status:</span>
          {isRegistered ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Registered</span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Not Registered</span>
          )}
        </div>
        
        {isRegistered ? (
          <>
            <button
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              onClick={() => alert('Vehicle details accessed')}
            >
              View Full Details
            </button>
            
            <button
              className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              onClick={() => alert(`Log created for plate number: ${plateNumber}`)}
            >
              Log Entry
            </button>
          </>
        ) : (
          <>
            <button
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              onClick={() => setShowAddForm(true)}
            >
              Add to Database
            </button>
            
            <button
              className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors"
              onClick={() => alert(`Alert created for unregistered vehicle: ${plateNumber}`)}
            >
              Create Alert
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionPanel;