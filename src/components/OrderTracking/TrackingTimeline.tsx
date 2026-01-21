import React from "react";
import { MapPin, Calendar, CheckCircle, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

export interface TrackingEvent {
  id: number;
  status: string;
  description?: string | null;
  location?: string | null;
  timestamp: string;
  isCompleted: boolean;
}

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus?: string;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  events,
  currentStatus,
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("confirmed") || statusLower.includes("processing"))
      return "bg-blue-100 text-blue-800";
    if (statusLower.includes("shipped") || statusLower.includes("transit"))
      return "bg-indigo-100 text-indigo-800";
    if (statusLower.includes("delivered") || statusLower.includes("completed"))
      return "bg-green-100 text-green-800";
    if (statusLower.includes("cancelled") || statusLower.includes("failed"))
      return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          <p>No tracking information available yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => {
            const isLast = index === events.length - 1;
            const isActive = event.isCompleted;

            return (
              <div key={event.id} className="relative">
                {/* Timeline line connector */}
                {!isLast && (
                  <div
                    className={`absolute left-6 top-12 bottom-0 w-0.5 ${
                      events[index + 1]?.isCompleted
                        ? "bg-green-400"
                        : "bg-gray-300"
                    }`}
                  />
                )}

                {/* Event card */}
                <div className="relative pl-16">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-2 top-1 w-4 h-4 rounded-full border-2 ${
                      isActive
                        ? "bg-green-500 border-green-500"
                        : "bg-gray-300 border-gray-400"
                    }`}
                  />

                  <Card
                    className={`p-4 border ${
                      isActive
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadgeColor(event.status)}>
                          {event.status}
                        </Badge>
                        {isActive && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {!isActive && (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-700 mb-3">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {event.timestamp && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span>{formatDate(event.timestamp)}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
