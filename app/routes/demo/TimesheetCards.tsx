import { CalendarViewCard, TeamComparisonCard } from 'app/shared/components/custom/card/timesheets';

// Sample data for demonstration
const sampleAttendanceData = {
  month: 'March 2024',
  totalDays: 22,
  daysPresent: 18,
  daysAbsent: 1,
  daysLeave: 2,
  earlyDepartures: 1,
  overtime: 5,
  performance: 85,
  details: [
    { date: '2024-03-01', status: 'present', hours: 8, notes: 'Project planning meeting' },
    { date: '2024-03-02', status: 'weekend', hours: 0, notes: '' },
    { date: '2024-03-03', status: 'weekend', hours: 0, notes: '' },
    { date: '2024-03-04', status: 'present', hours: 9, notes: 'Overtime: Client presentation' },
    { date: '2024-03-05', status: 'late', hours: 7.5, notes: 'Late arrival: Traffic' },
  ],
};

// Sample team data
const sampleTeamData = [
  { name: 'Alex Chen', attendance: 95, color: 'bg-blue-500' },
  { name: 'Jamie Smith', attendance: 92, color: 'bg-green-500' },
  { name: 'Morgan Lee', attendance: 88, color: 'bg-purple-500' },
  { name: 'Taylor Wong', attendance: 85, color: 'bg-amber-500' },
  { name: 'Jordan Garcia', attendance: 83, color: 'bg-pink-500' },
];

// Generate calendar days data
function generateCalendarDays() {
  const days = [];
  // Sample month with 31 days
  for (let day = 1; day <= 31; day++) {
    let status = 'none';

    // Assign status based on patterns (simplified for demo)
    if (
      day === 1 ||
      day === 4 ||
      (day >= 6 && day <= 10 && day !== 7 && day !== 8) ||
      (day >= 13 && day <= 17 && day !== 14 && day !== 15) ||
      (day >= 20 && day <= 24 && day !== 21 && day !== 22) ||
      (day >= 27 && day <= 31 && day !== 28 && day !== 29)
    ) {
      status = 'present';
    } else if (day === 5) {
      status = 'late';
    } else if (day === 12) {
      status = 'absent';
    } else if (day % 7 === 6 || day % 7 === 0) {
      status = 'weekend';
    }

    days.push({ day, status: status as 'present' | 'weekend' | 'late' | 'none' | 'absent' });
  }
  return days;
}

export function TimesheetCards() {
  return (
    <div className='flex flex-wrap gap-4 space-y-10 p-6'>
      {/* Calendar View */}
      <div className='mb-8'>
        <h2 className='mb-4 text-xl font-semibold'>Calendar View</h2>
        <CalendarViewCard
          month='March'
          year={2024}
          days={generateCalendarDays()}
          daysPresent={sampleAttendanceData.daysPresent}
          daysAbsent={sampleAttendanceData.daysAbsent}
          daysLeave={sampleAttendanceData.daysLeave}
        />
      </div>

      {/* Team Comparison */}
      <div className='mb-8'>
        <h2 className='mb-4 text-xl font-semibold'>Team Comparison</h2>
        <TeamComparisonCard month={sampleAttendanceData.month} teamMembers={sampleTeamData} />
      </div>
    </div>
  );
}

export default TimesheetCards;
