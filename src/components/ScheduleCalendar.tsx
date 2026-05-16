import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ScheduledVideoItem {
  id: string;
  date: Date;
  type: "ai" | "self";
  title: string;
  time?: string;
  status?: "ready" | "generating" | "scheduled";
}

interface ScheduleCalendarProps {
  scheduledVideos: ScheduledVideoItem[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onMonthChange?: (month: Date) => void;
  className?: string;
}

const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export function ScheduleCalendar({
  scheduledVideos,
  selectedDate,
  onDateSelect,
  onMonthChange,
  className,
}: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate || new Date()
  );

  const getVideosForDate = (date: Date): ScheduledVideoItem[] => {
    return scheduledVideos.filter((video) => {
      const videoDate = new Date(video.date);
      return (
        videoDate.getDate() === date.getDate() &&
        videoDate.getMonth() === date.getMonth() &&
        videoDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onMonthChange?.(today);
    onDateSelect?.(today);
  };

  const handleDateSelect = (date: Date) => {
    onDateSelect?.(date);
  };

  const isSameDate = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDate(date, today);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
            Calendar
          </p>
          <h3 className="text-2xl font-bold">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-muted-foreground font-medium py-2"
          >
            {day}
          </div>
        ))}

        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const videos = getVideosForDate(date);
          const aiVideos = videos.filter((v) => v.type === "ai");
          const selfVideos = videos.filter((v) => v.type === "self");

          const isSelected = selectedDate && isSameDate(date, selectedDate);
          const today = isToday(date);

          return (
            <button
              key={index}
              onClick={() => handleDateSelect(date)}
              className={cn(
                "relative aspect-square p-1 text-sm font-medium rounded-lg transition-all",
                "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                isSelected &&
                "bg-primary text-primary-foreground hover:bg-primary/90",
                today &&
                !isSelected &&
                "border-2 border-[#4F81ED] text-[#4F81ED]",
                !isCurrentMonth &&
                "text-muted-foreground/40 hover:bg-muted/50",
                isCurrentMonth &&
                !isSelected &&
                !today &&
                "text-foreground"
              )}
            >
              <span className="relative z-10">{date.getDate()}</span>
              {videos.length > 0 && !isSelected && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 justify-center">
                  {aiVideos.slice(0, 3).map((_, i) => (
                    <div
                      key={`ai-${i}`}
                      className="w-1.5 h-1.5 rounded-full ai-dot"
                    />
                  ))}
                  {selfVideos
                    .slice(0, Math.max(0, 3 - aiVideos.length))
                    .map((_, i) => (
                      <div
                        key={`self-${i}`}
                        className="w-1.5 h-1.5 rounded-full self-dot"
                      />
                    ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full ai-dot"></div>
          <span className="text-muted-foreground">AI Generated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full self-dot"></div>
          <span className="text-muted-foreground">Self Script</span>
        </div>
      </div>
    </div>
  );
}
