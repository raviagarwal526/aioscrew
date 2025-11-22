import { CrewMember, Trip, Claim, AlertItem } from '../types';

export const crewMembers: CrewMember[] = [
  {
    id: 'CM001',
    name: 'Sarah Martinez',
    role: 'Captain',
    base: 'BUR',
    seniority: 8,
    qualification: '737-800',
    email: 's.martinez@copa.com',
    ytdEarnings: 87450,
    upcomingTraining: { type: 'Recurrent', daysUntil: 23 },
    currentPay: { period: 'Nov 16-30', amount: 4875, verified: true }
  },
  {
    id: 'CM002',
    name: 'John Smith',
    role: 'First Officer',
    base: 'PTY',
    seniority: 3,
    qualification: '737-MAX',
    email: 'j.smith@copa.com',
    ytdEarnings: 72300,
    currentPay: { period: 'Nov 16-30', amount: 3650, verified: true }
  },
  {
    id: 'CM003',
    name: 'Michael Chen',
    role: 'First Officer',
    base: 'BUR',
    seniority: 5,
    qualification: '737-800',
    email: 'm.chen@copa.com',
    ytdEarnings: 78900,
    currentPay: { period: 'Nov 16-30', amount: 3980, verified: true }
  },
  {
    id: 'CM004',
    name: 'Emily Rodriguez',
    role: 'Captain',
    base: 'PTY',
    seniority: 12,
    qualification: '737-MAX',
    email: 'e.rodriguez@copa.com',
    ytdEarnings: 95200,
    upcomingTraining: { type: 'Line Check', daysUntil: 45 },
    currentPay: { period: 'Nov 16-30', amount: 5125, verified: true }
  },
  {
    id: 'CM006',
    name: 'David Park',
    role: 'First Officer',
    base: 'PTY',
    seniority: 2,
    qualification: '737-800',
    email: 'd.park@copa.com',
    ytdEarnings: 68500,
    currentPay: { period: 'Nov 16-30', amount: 3420, verified: false }
  },
  {
    id: 'FA012',
    name: 'Jessica Taylor',
    role: 'Flight Attendant',
    base: 'BUR',
    seniority: 6,
    qualification: 'International',
    email: 'j.taylor@copa.com',
    ytdEarnings: 52300,
    currentPay: { period: 'Nov 16-30', amount: 2580, verified: true }
  },
  {
    id: 'FA015',
    name: 'Marcus Johnson',
    role: 'Flight Attendant',
    base: 'BUR',
    seniority: 4,
    qualification: 'International',
    email: 'm.johnson@copa.com',
    ytdEarnings: 48900,
    currentPay: { period: 'Nov 16-30', amount: 2410, verified: true }
  },
  {
    id: 'FA020',
    name: 'Ana Silva',
    role: 'Flight Attendant',
    base: 'PTY',
    seniority: 7,
    qualification: 'International',
    email: 'a.silva@copa.com',
    ytdEarnings: 54200,
    currentPay: { period: 'Nov 16-30', amount: 2650, verified: true }
  },
  {
    id: 'FA021',
    name: 'Robert Lee',
    role: 'Flight Attendant',
    base: 'PTY',
    seniority: 3,
    qualification: 'Domestic',
    email: 'r.lee@copa.com',
    ytdEarnings: 46800,
    currentPay: { period: 'Nov 16-30', amount: 2320, verified: true }
  }
];

export const trips: Trip[] = [
  {
    id: 'CM100',
    date: '2024-11-23',
    route: 'BUR → PTY',
    crewAssigned: ['CM001', 'CM003', 'FA012', 'FA015'],
    flightTime: 5.2,
    creditHours: 6.5,
    layover: 'PTY',
    international: true,
    status: 'scheduled'
  },
  {
    id: 'CM450',
    date: '2024-11-22',
    route: 'PTY → LAX → PTY',
    crewAssigned: ['CM004', 'CM006', 'FA020', 'FA021'],
    flightTime: 8.4,
    creditHours: 10.2,
    layover: 'LAX',
    international: true,
    status: 'cancelled',
    disruption: true,
    crewAffected: ['CM004', 'CM006', 'FA020', 'FA021']
  },
  {
    id: 'CM230',
    date: '2024-11-22',
    route: 'PTY → MIA → PTY',
    crewAssigned: ['CM002', 'CM003', 'FA012', 'FA020'],
    flightTime: 6.8,
    creditHours: 8.5,
    layover: 'MIA',
    international: true,
    status: 'delayed',
    delayMinutes: 120
  },
  {
    id: 'CM105',
    date: '2024-11-25',
    route: 'BUR → PTY',
    crewAssigned: ['CM001', 'CM003', 'FA015', 'FA021'],
    flightTime: 5.2,
    creditHours: 6.5,
    layover: 'PTY',
    international: true,
    status: 'scheduled'
  },
  {
    id: 'CM777',
    date: '2024-12-25',
    route: 'PTY → LAX',
    crewAssigned: [],
    flightTime: 5.8,
    creditHours: 7.2,
    layover: 'LAX',
    international: true,
    status: 'scheduled'
  },
  {
    id: 'CM460',
    date: '2024-11-22',
    route: 'PTY → SFO',
    crewAssigned: ['CM004', 'CM002', 'FA020', 'FA012'],
    flightTime: 6.2,
    creditHours: 7.8,
    layover: 'SFO',
    international: true,
    status: 'scheduled'
  }
];

export const claims: Claim[] = [
  {
    id: 'CLM-2024-1156',
    crewId: 'CM001',
    type: 'International Premium',
    flight: 'CM450',
    date: '2024-11-18',
    amount: 125,
    status: 'approved',
    aiValidation: true,
    explanation: 'Flight CM450 to GUA (Guatemala) qualifies for international premium per CBA Section 12.4'
  },
  {
    id: 'CLM-2024-1157',
    crewId: 'CM002',
    type: 'Per Diem',
    flight: 'CM230',
    date: '2024-11-19',
    amount: 75,
    status: 'approved',
    aiValidation: true,
    explanation: 'Portland overnight qualifies for domestic per diem rate: 1 night × $75'
  },
  {
    id: 'CLM-2024-1158',
    crewId: 'CM001',
    type: 'International Premium',
    flight: 'CM100',
    date: '2024-11-20',
    amount: 125,
    status: 'pending',
    aiValidation: true,
    explanation: 'Panama City international destination per CBA Section 12.4'
  },
  {
    id: 'CLM-2024-1159',
    crewId: 'CM004',
    type: 'Holiday Pay',
    flight: 'CM450',
    date: '2024-11-28',
    amount: 75,
    status: 'approved',
    aiValidation: true,
    explanation: 'Thanksgiving Day premium per CBA Section 15.2'
  },
  {
    id: 'CLM-2024-1160',
    crewId: 'CM002',
    type: 'International Premium',
    flight: 'CM460',
    date: '2024-11-21',
    amount: 125,
    status: 'pending',
    aiValidation: true,
    explanation: 'Costa Rica international destination per CBA Section 12.4'
  }
];

export const alerts: AlertItem[] = [
  {
    id: 'ALT-001',
    type: 'critical',
    message: 'CM450 cancelled - 4 crew need reassignment',
    timestamp: new Date('2024-11-22T08:30:00'),
    resolved: false
  },
  {
    id: 'ALT-002',
    type: 'warning',
    message: 'CM230 delayed 2hrs - crew approaching duty limit',
    timestamp: new Date('2024-11-22T09:15:00'),
    resolved: false
  },
  {
    id: 'ALT-003',
    type: 'info',
    message: '3 reserve crew available for call-out',
    timestamp: new Date('2024-11-22T07:00:00'),
    resolved: false
  }
];

export const agentResponses: Record<string, Record<string, string>> = {
  'crew-member': {
    'next day off': "Your next day off is Sunday, November 24th. After that, you're scheduled for CM105 (BUR→PTY) on Monday the 25th. You have 4 consecutive days off starting December 1st.",
    'per diem portland': "Yes! You received per diem for your Portland overnight on Nov 18-19. The calculation: 1 night × $75 domestic rate = $75. This was included in your Nov 16-30 pay period. Would you like to see the detailed breakdown?",
    'bid london trips': "Great question! London trips require 777 qualification and 5+ years seniority. You're 737-800 qualified with 8 years seniority. To bid London: 1) Complete 777 transition training (next class: Jan 15), 2) Submit bid in December window. Want me to flag you when the bid opens?",
    'international pay flight 450': "I'll help you submit that claim. Flight 450 on Nov 18 was to Guatemala City (GUA), which qualifies for international premium pay of $125 per CBA Section 12.4. I've created claim CLM-2024-1161 and sent it to payroll for verification. Expected processing time: 2-3 business days."
  },
  'scheduler': {
    'optimize december': "I analyzed December's roster and found $45,200 in savings: 1) Reduce deadheads by 7 (saves $12K), 2) Optimize crew positioning (saves $18K), 3) Better reserve utilization (saves $15K). This maintains 99.8% legality compliance and improves crew satisfaction by 12%. Ready to apply changes?",
    'unassigned christmas': "Found 23 unassigned trips for Dec 24-26: 8 international, 15 domestic. Highest priority: CM777 (PTY-LAX) Christmas Day - needs Captain with 737-MAX qual. I have 3 crew available who meet requirements. Want to see the list?",
    'who can fly p-447': "Found 8 crew members legally able to fly pairing P-447: Captains: Sarah Martinez (BUR), Emily Rodriguez (PTY), Michael Chen (BUR). All meet 737-800 qualification, duty time limits, and rest requirements. Rodriguez is most cost-effective (already in PTY, saves positioning). Want to assign?",
    'new hire roster': "I'll build rosters for 15 new hires starting Jan 1. Recommendations: 8 to BUR base (high demand), 7 to PTY (backfill retirements). Training pipeline: Jan 1-15 initial, Jan 16-31 line flying. Assign mentors? I suggest pairing with senior crew (8+ years) for first month."
  },
  'controller': {
    'flight 123 cancelled': "CM123 cancelled - here's the optimal recovery: 4 crew affected (2 pilots, 2 FAs). Recommendation: Assign to CM460 departing 3hrs later (same route). This keeps them legal and saves $1,200 vs hotel + repositioning. Reserve backup: Captain Wilson available if needed. Approve this plan?",
    'crew in disruption': "Currently 8 crew members affected by disruptions: CM450 cancellation (4 crew), CM230 delay (4 crew). All have recovery plans: CM450 crew reassigned to CM460 (saves $1,200), CM230 crew cleared for continued ops (duty time: 11.2hrs, limit: 14hrs). Want details on any specific crew?",
    'call reserves': "3 reserve crew available for tonight: Captain James Wilson (PTY, 737-MAX), FO Lisa Chang (BUR, 737-800), FA Maria Santos (PTY, International). All meet rest requirements and available within 2-hour call-out. Recommend Wilson for CM777 coverage. Call now?"
  },
  'payroll': {
    'john smith premium': "John Smith earned $450 in premium pay for Nov 16-30: International Premium (3 flights × $125 = $375) + Holiday Pay (Thanksgiving, 1 day × $75 = $75). Details: Flights CM450, CM460, CM470 all to international destinations per CBA Section 12.4. Calculations verified ✓",
    'claims this week': "Found 23 claims filed this week: 15 International Premium (avg $125), 5 Per Diem (avg $75), 3 Holiday Pay (avg $75). Status: 20 auto-approved by AI (98% accuracy), 3 pending manual review. Total value: $3,275. Want to see the pending ones?",
    'export payroll': "Preparing payroll export for period ending 11/30/2024... Included: 127 crew members, $523,450 total payroll, 234 claims processed. Format: CSV with columns (Crew ID, Name, Base Hours, Premium Pay, Per Diem, Deductions, Net Pay). Download ready in 5 seconds.",
    'captain lee per diem': "Captain Lee's per diem for Nov 16-30: 8 layover nights total. Breakdown: 5 international nights × $95 = $475, 3 domestic nights × $75 = $225. Total: $700. Destinations: PTY (3), GUA (2), SFO (2), PDX (1). All verified against flight logs ✓"
  },
  'management': {
    'crew cost q4': "Q4 crew costs trending down 4.2% vs budget: Oct: $2.4M (-3%), Nov: $2.3M (-4%), Dec: projected $2.35M (-5%). Key drivers: Better reserve utilization (-$45K), reduced deadheads (-$38K), optimized positioning (-$52K). Forecast: $7.05M total vs $7.36M budget. $310K under budget.",
    'utilization by base': "Utilization by base (Nov): BUR: 87.2 hrs/crew (target: 85), PTY: 89.4 hrs/crew (target: 85). BUR +2.6% above target (good), PTY +5.2% above target (monitor for burnout). Recommendation: Hire 2 crew for PTY to reduce to 86 hrs/crew by Jan.",
    'summer staffing': "Summer peak staffing prediction (Jun-Aug): Need 18 additional crew (+14% vs current). Breakdown: 12 pilots (6 Captains, 6 FOs), 6 flight attendants. Reasoning: 23% flight increase, vacation coverage, training backfill. Recommend start hiring by Feb to complete training by May."
  },
  'union': {
    'contract violations': "Found 4 potential contract violations this month: 1) CM230 crew exceeded 12hr duty day (12.3hrs on Nov 15), 2) Reserve crew called with <10hrs rest (CM006, Nov 18), 3) Per diem short-paid for international overnight (CM002, Nov 12), 4) Training conducted on scheduled day off (FA015, Nov 20). Want detailed reports?",
    'average per diem': "Average per diem by base (Nov): BUR: $82/day (59% international rate), PTY: $88/day (67% international rate). Contract minimum: $75 domestic, $95 international. Compliance: 100%. PTY higher due to more international flying. Year-over-year: +$3 per day (+3.5%).",
    'duty time exceeded': "Found 2 instances of duty time concerns this month: 1) CM230 crew on Nov 15 (12.3hrs, limit 14hrs) - legal but flagged, 2) CM450 crew would have exceeded if not cancelled (projected 14.2hrs). Recommendation: Review scheduling buffer for delay recovery. No violations, but close calls increasing."
  }
};

export const suggestedPrompts: Record<string, string[]> = {
  'crew-member': [
    'When is my next day off?',
    'Did I get per diem for my Portland overnight?',
    'Can I bid for the London trips?',
    'Submit claim: International pay for Flight 450'
  ],
  'scheduler': [
    'Optimize December for minimum cost',
    'Show all unassigned Christmas trips',
    'Who can legally fly pairing P-447?',
    'Build roster for 15 new hires starting Jan 1'
  ],
  'controller': [
    'Flight 123 cancelled, who do I reassign?',
    'Show me all crew in disruption right now',
    'Call reserves for tonight\'s coverage',
    'What\'s the fastest recovery for CM450 crew?'
  ],
  'payroll': [
    'Why did John Smith get $450 premium pay?',
    'Show me all claims filed this week',
    'Export payroll for period ending 11/30',
    'Explain the per diem calculation for Captain Lee'
  ],
  'management': [
    'What\'s our crew cost trend for Q4?',
    'Show me utilization by base',
    'Predict staffing needs for summer peak',
    'What are the biggest cost optimization opportunities?'
  ],
  'union': [
    'Show me any contract violations this month',
    'What\'s the average per diem rate by base?',
    'Are duty time limits being exceeded?',
    'Show me grievances filed this quarter'
  ]
};
