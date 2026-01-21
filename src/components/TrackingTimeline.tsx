import React from "react";
import { CheckCircle, Clock, MapPin, Calendar } from "lucide-react";

export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
  isCompleted: boolean;
}

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  events,
}) => {
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("delivered")) return "bg-green-500";
    if (lowerStatus.includes("shipped") || lowerStatus.includes("transit"))
      return "bg-blue-500";
    if (
      lowerStatus.includes("processing") ||
      lowerStatus.includes("production")
    )
      return "bg-purple-500";
    if (lowerStatus.includes("confirmed")) return "bg-indigo-500";
    return "bg-gray-500";
  };

  const getStatusBadgeColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("delivered")) return "bg-green-100 text-green-800";
    if (lowerStatus.includes("shipped") || lowerStatus.includes("transit"))
      return "bg-blue-100 text-blue-800";
    if (
      lowerStatus.includes("processing") ||
      lowerStatus.includes("production")
    )
      return "bg-purple-100 text-purple-800";
    if (lowerStatus.includes("confirmed"))
      return "bg-indigo-100 text-indigo-800";
    return "bg-gray-100 text-gray-800";
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tracking events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const isActive = event.isCompleted;

        return (
          <div key={event.id} className="relative flex">
            {/* Timeline Line */}
            <div className="flex flex-col items-center mr-6">
              {/* Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? getStatusColor(event.status) : "bg-gray-300"
                } text-white flex-shrink-0 z-10`}
              >
                {isActive ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Clock className="w-6 h-6" />
                )}
              </div>

              {/* Line to next event */}
              {!isLast && (
                <div
                  className={`w-1 flex-1 mt-2 ${
                    events[index + 1]?.isCompleted
                      ? getStatusColor(events[index + 1].status)
                      : "bg-gray-300"
                  }`}
                  style={{ minHeight: "60px" }}
                />
              )}
            </div>

            {/* Event Content */}
            <div className="flex-1 pb-6 pt-1">
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${getStatusBadgeColor(event.status)}`}
              >
                {event.status}
              </div>
              <h4
                className={`font-semibold text-sm mb-1 ${isActive ? "text-gray-900" : "text-gray-500"}`}
              >
                {event.description}
              </h4>

              {/* Location */}
              {event.location && (
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
              )}

              {/* Timestamp */}
              {event.timestamp && (
                <div className="flex items-center text-gray-500 text-xs">
                  <Calendar className="w-3 h-3 mr-1.5 flex-shrink-0" />
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
