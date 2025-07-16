import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useBoards } from '../../hooks/useBoardsQuery';
import { useTheme } from '../../contexts/ThemeContext';

interface CalendarViewProps {
  onDateClick: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onDateClick }) => {
  const { data: boards = [] } = useBoards();
  const { isDarkMode } = useTheme();

  const events = boards.flatMap(board =>
    board.lists.flatMap(list =>
      list.cards
        .filter(card => card.dueDate) // Only include cards with due dates
        .map(card => {
          const isCompleted = card.checklists.every(c => c.items.every(i => i.completed));
          const isDue = new Date(card.dueDate!) < new Date();
          const isInProgress = !isCompleted && !isDue;

          let className = '';
          if (isCompleted) {
            className = 'bg-green-500 border-green-500';
          } else if (isDue) {
            className = 'bg-red-500 border-red-500';
          } else if (isInProgress) {
            className = 'bg-yellow-500 border-yellow-500';
          } else {
            className = 'bg-blue-500 border-blue-500';
          }

          return {
            title: card.title,
            date: card.dueDate,
            className,
          };
        })
    )
  );

  return (
    <div className={`p-6 rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventContent={renderEventContent}
        dateClick={(info) => onDateClick(info.date)}
        eventDidMount={(info: any) => {
          if (info.event.classNames.includes('bg-green-500')) {
            info.el.style.animation = 'pulse 2s infinite';
          } else if (info.event.classNames.includes('bg-red-500')) {
            info.el.style.animation = 'shake 0.5s infinite';
          }
        }}
      />
    </div>
  );
};

function renderEventContent(eventInfo: any) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  );
}

export default CalendarView;