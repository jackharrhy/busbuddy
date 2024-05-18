interface BusDetailsCardProps {
  details: any;
  position: { x: number; y: number };
  isLeft: boolean;
  onClose: () => void;
}

const BusDetailsCard: React.FC<BusDetailsCardProps> = ({
  details,
  position,
  isLeft,
  onClose,
}) => {
  const cardStyle = {
    top: `${position.y}px`,
    left: isLeft ? `${position.x - 250}px` : `${position.x + 20}px`,
  };

  const toSentenceCase = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


  const deviationSentenceCase = toSentenceCase(details.deviation);

  return (
    <div
      style={cardStyle}
      className="absolute top-4 left-4 bg-white p-4 border-black border-2 rounded shadow-lg z-10 max-w-xs"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-2xl pb-1">Bus Details</h3>
        <button
          className="ml-2 bg-black text-white p-1 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <p>
        <span className="font-bold">Bus #:</span> {details.vehicle}
      </p>
      <p>
        <span className="font-bold">Route #:</span> {details.routerun}
      </p>
      <p>
        <span className="font-bold">Destination:</span>{" "}
        {details.gtfs_trip_headsign}
      </p>
      <p>
        <span className="font-bold">Status:</span> {deviationSentenceCase}
      </p>
    </div>
  );
};

export default BusDetailsCard;
