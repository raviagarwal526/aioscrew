import { X } from 'lucide-react';

interface TripDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: any;
}

export default function TripDetailsModal({ isOpen, onClose, trip }: TripDetailsModalProps) {
  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold">Trip Details</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Trip details will appear here</p>
        </div>
      </div>
    </div>
  );
}
