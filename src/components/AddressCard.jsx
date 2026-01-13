import PropTypes from 'prop-types';
import { FiEdit2, FiTrash2, FiMapPin, FiPhone, FiCheck } from 'react-icons/fi';

const AddressCard = ({ 
  address, 
  onEdit, 
  onDelete, 
  onSetDefault,
  selectable = false,
  selected = false,
  onSelect
}) => {
  const getAddressTypeColor = (type) => {
    switch (type) {
      case 'home':
        return 'bg-blue-100 text-blue-800';
      case 'work':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${
        selectable
          ? selected
            ? 'border-indigo-600 bg-indigo-50 shadow-md'
            : 'border-gray-200 hover:border-indigo-300 cursor-pointer'
          : address.isDefault
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200'
      }`}
      onClick={selectable ? () => onSelect(address._id) : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiMapPin className="text-gray-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">{address.fullName}</p>
            <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium mt-1 ${getAddressTypeColor(address.addressType)}`}>
              {address.addressType}
            </span>
          </div>
        </div>

        {address.isDefault && !selectable && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-md flex items-center gap-1">
            <FiCheck size={12} />
            Default
          </span>
        )}

        {selected && selectable && (
          <div className="bg-indigo-600 text-white rounded-full p-1">
            <FiCheck size={16} />
          </div>
        )}
      </div>

      {/* Address Details */}
      <div className="space-y-1 text-sm text-gray-600 mb-3">
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>{address.city}, {address.state} - {address.pincode}</p>
        <p>{address.country}</p>
        <div className="flex items-center gap-1 mt-2 text-gray-700">
          <FiPhone size={14} />
          <span>{address.phone}</span>
        </div>
      </div>

      {/* Actions */}
      {!selectable && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
          {!address.isDefault && (
            <button
              onClick={() => onSetDefault(address._id)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Set as default
            </button>
          )}
          
          <button
            onClick={() => onEdit(address)}
            className="ml-auto text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            title="Edit address"
          >
            <FiEdit2 size={16} />
          </button>
          
          <button
            onClick={() => onDelete(address._id)}
            className="text-sm text-gray-600 hover:text-red-600 transition-colors"
            title="Delete address"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

AddressCard.propTypes = {
  address: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    addressLine1: PropTypes.string.isRequired,
    addressLine2: PropTypes.string,
    city: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    pincode: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    addressType: PropTypes.string.isRequired,
    isDefault: PropTypes.bool
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSetDefault: PropTypes.func,
  selectable: PropTypes.bool,
  selected: PropTypes.bool,
  onSelect: PropTypes.func
};

export default AddressCard;
