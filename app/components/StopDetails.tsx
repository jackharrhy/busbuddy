interface BusStopDetailsCardProps {
    details: any;
    position: { x: number; y: number };
    isLeft: boolean;
    isUp: boolean;
    onClose: () => void;
  }
  
  const BusStopDetailsCard: React.FC<BusStopDetailsCardProps> = ({
    details,
    position,
    isLeft,
    isUp,
    onClose,
  }) => {
    const cardWidth = 250; 
  
    const cardStyle = {
      top: isUp ? 'auto' : `${position.y}px`,
      bottom: isUp ? `${window.innerHeight - position.y}px` : 'auto',
      left: isLeft ? `${position.x - cardWidth - 10}px` : `${position.x + 10}px`,
      right: isLeft ? 'auto' : 'auto',
      maxWidth: '250px',
    };
  
    return (
      <div
        style={cardStyle}
        className="absolute bg-white p-4 border-black border-2 rounded shadow-lg z-10"
      >
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-2xl pb-1">Bus Stop Details</h3>
          <button
            className="ml-2 bg-black text-white p-1 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <p>
          <span className="font-bold">Stop #:</span> {details.stop_id}
        </p>
        <p>
          <span className="font-bold">Stop Name:</span> {details.stop_name}
        </p>
      </div>
    );
  };
  
  export default BusStopDetailsCard;
  