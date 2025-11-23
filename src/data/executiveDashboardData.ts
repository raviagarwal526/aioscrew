import { OperationalCard } from '../types/executive-dashboard';

// Executive Level Cards (10 operational areas)
export const executiveCards: OperationalCard[] = [
  {
    id: 'crew-ops',
    title: 'Crew Operations',
    icon: 'Users',
    description: 'Complete crew management, scheduling, and operations',
    kpis: [
      { label: 'Total Crew', value: '127', trend: 'up', trendValue: '+3%' },
      { label: 'On-Time Performance', value: '94.2%', trend: 'up', trendValue: '+1.2%' },
      { label: 'Monthly Payroll', value: '$2.3M', trend: 'down', trendValue: '-4%' },
      { label: 'Compliance Rate', value: '99.8%', trend: 'stable', trendValue: '0%' }
    ],
    isActive: true,
    category: 'executive',
    viewLevel: 'executive'
  },
  {
    id: 'flight-ops',
    title: 'Flight Operations',
    icon: 'Plane',
    description: 'Daily flight operations, scheduling, and performance',
    kpis: [
      { label: 'Daily Flights', value: '142', trend: 'up', trendValue: '+5%' },
      { label: 'On-Time Departure', value: '91.5%', trend: 'up', trendValue: '+0.8%' },
      { label: 'Fuel Efficiency', value: '2.8L/km', trend: 'down', trendValue: '-2%' },
      { label: 'Diversion Rate', value: '0.3%', trend: 'stable', trendValue: '0%' }
    ],
    isActive: false,
    category: 'executive',
    viewLevel: 'executive'
  },
  {
    id: 'maintenance',
    title: 'Maintenance & Engineering',
    icon: 'Settings',
    description: 'Fleet maintenance, engineering, and aircraft availability',
    kpis: [
      { label: 'Fleet Availability', value: '96.2%', trend: 'up', trendValue: '+1.5%' },
      { label: 'Avg Turnaround', value: '45 min', trend: 'down', trendValue: '-3%' },
      { label: 'AOG Count', value: '2', trend: 'down', trendValue: '-33%' },
      { label: 'Maint Delay Rate', value: '1.2%', trend: 'down', trendValue: '-0.5%' }
    ],
    isActive: false,
    category: 'executive',
    viewLevel: 'executive'
  },
  {
    id: 'passenger-services',
    title: 'Passenger Services',
    icon: 'UserCheck',
    description: 'Customer experience, satisfaction, and service quality',
    kpis: [
      { label: 'Monthly Passengers', value: '485K', trend: 'up', trendValue: '+8%' },
      { label: 'Load Factor', value: '87.3%', trend: 'up', trendValue: '+2.1%' },
      { label: 'Net Promoter Score', value: '72', trend: 'up', trendValue: '+4' },
      { label: 'Complaint Rate', value: '0.8%', trend: 'down', trendValue: '-0.2%' }
    ],
    isActive: false,
    category: 'executive',
    viewLevel: 'executive'
  },
  {
    id: 'revenue-management',
    title: 'Revenue Management',
    icon: 'DollarSign',
    description: 'Revenue optimization, pricing, and yield management',
    kpis: [
      { label: 'Monthly Revenue', value: '$42.5M', trend: 'up', trendValue: '+12%' },
      { label: 'RASK', value: '$0.085', trend: 'up', trendValue: '+3%' },
      { label: 'Ancillary Revenue', value: '$8.2', trend: 'up', trendValue: '+15%' },
      { label: 'Yield', value: '$0.142', trend: 'up', trendValue: '+5%' }
    ],
    isActive: false,
    category: 'executive',
    viewLevel: 'executive'
  },
  {
    id: 'network-planning',
    title: 'Network Planning',
    icon: 'Map',
    description: 'Route planning, network optimization, and capacity',
    kpis: [
      { label: 'Active Routes', value: '78', trend: 'up', trendValue: '+4' },
      { label: 'ASKs (M)', value: '2,450', trend: 'up', trendValue: '+6%' },
      { label: 'Network Efficiency', value: '92.1%', trend: 'up', trendValue: '+1.8%' },
      { label: 'New Routes', value: '3', trend: 'stable', trendValue: 'Q4' }
    ],
    isActive: false,
    category: 'executive',
    viewLevel: 'executive'
  },
  {
    id: 'ground-ops',
    title: 'Ground Operations',
    icon: 'Package',
    description: 'Baggage handling, ramp operations, and ground services',
    kpis: [
      { label: 'Bags Handled', value: '485K', trend: 'up', trendValue: '+8%' },
      { label: 'Mishandled Rate', value: '0.12%', trend: 'down', trendValue: '-0.03%' },
      { label: 'Ramp Safety Score', value: '98.5', trend: 'up', trendValue: '+0.5' },
      { label: 'GSE Availability', value: '97.8%', trend: 'stable', trendValue: '0%' }
    ],
    isActive: false,
    category: 'executive',
    viewLevel: 'executive'
  },
  {
    id: 'cargo-ops',
    title: 'Cargo Operations',
    icon: 'Truck',
    description: 'Cargo handling, revenue, and logistics management',
    kpis: [
      { label: 'Monthly Tonnage', value: '1,245', trend: 'up', trendValue: '+12%' },
      { label: 'Cargo Revenue', value: '$3.2M', trend: 'up', trendValue: '+18%' },
      { label: 'Load Factor', value: '78.5%', trend: 'up', trendValue: '+5%' },
      { label: 'On-Time Delivery', value: '96.8%', trend: 'up', trendValue: '+1.2%' }
    ],
    isActive: false,
    category: 'executive',
    viewLevel: 'executive'
  },
  {
    id: 'safety-compliance',
    title: 'Safety & Compliance',
    icon: 'Shield',
    description: 'Safety management, compliance, and audit tracking',
    kpis: [
      { label: 'Safety Score', value: '98.7', trend: 'up', trendValue: '+0.3' },
      { label: 'Incidents', value: '2', trend: 'down', trendValue: '-50%' },
      { label: 'Audit Compliance', value: '100%', trend: 'stable', trendValue: '0%' },
      { label: 'Training Currency', value: '94%', trend: 'up', trendValue: '+2%' }
    ],
    isActive: false,
    category: 'executive',
    viewLevel: 'executive'
  },
  {
    id: 'financial-performance',
    title: 'Financial Performance',
    icon: 'TrendingUp',
    description: 'Financial metrics, margins, and cash management',
    kpis: [
      { label: 'Operating Margin', value: '12.5%', trend: 'up', trendValue: '+1.8%' },
      { label: 'CASK', value: '$0.072', trend: 'down', trendValue: '-3%' },
      { label: 'EBITDA', value: '$5.3M', trend: 'up', trendValue: '+15%' },
      { label: 'Cash Position', value: '$125M', trend: 'up', trendValue: '+8%' }
    ],
    isActive: false,
    category: 'executive',
    viewLevel: 'executive'
  }
];

// VP Crew Level Cards (8 crew subsystems)
export const vpCrewCards: OperationalCard[] = [
  {
    id: 'crew-scheduling',
    title: 'Crew Scheduling',
    icon: 'Calendar',
    description: 'AI-powered pairing and roster optimization',
    kpis: [
      { label: 'Crew Utilization', value: '87.2%', trend: 'up', trendValue: '+2.6%' },
      { label: 'Schedule Changes', value: '12', trend: 'down', trendValue: '-25%' },
      { label: 'Reserve Activation', value: '8.5%', trend: 'down', trendValue: '-1.2%' },
      { label: 'Open Positions', value: '3', trend: 'down', trendValue: '-40%' }
    ],
    isActive: true,
    category: 'crew',
    viewLevel: 'vp-crew'
  },
  {
    id: 'payroll-claims',
    title: 'Payroll & Claims',
    icon: 'DollarSign',
    description: 'Automated calculations and processing',
    kpis: [
      { label: 'Monthly Payroll', value: '$2.3M', trend: 'down', trendValue: '-4%' },
      { label: 'Pending Claims', value: '23', trend: 'down', trendValue: '-18%' },
      { label: 'Processing Time', value: '2.1 days', trend: 'down', trendValue: '-15%' },
      { label: 'Accuracy Rate', value: '99.7%', trend: 'up', trendValue: '+0.2%' }
    ],
    isActive: true,
    category: 'crew',
    viewLevel: 'vp-crew'
  },
  {
    id: 'training-qualification',
    title: 'Training & Qualification',
    icon: 'GraduationCap',
    description: 'Compliance and competency tracking',
    kpis: [
      { label: 'Qualification %', value: '94%', trend: 'up', trendValue: '+2%' },
      { label: 'Training Sessions', value: '45', trend: 'up', trendValue: '+12%' },
      { label: 'Expiring Certs', value: '8', trend: 'down', trendValue: '-33%' },
      { label: 'Completion Rate', value: '98.5%', trend: 'up', trendValue: '+1.5%' }
    ],
    isActive: true,
    category: 'crew',
    viewLevel: 'vp-crew'
  },
  {
    id: 'fatigue-management',
    title: 'Fatigue Management',
    icon: 'Moon',
    description: 'FDP monitoring and wellness scoring',
    kpis: [
      { label: 'FDP Compliance', value: '99.8%', trend: 'stable', trendValue: '0%' },
      { label: 'Avg Rest Hours', value: '12.3', trend: 'up', trendValue: '+0.5' },
      { label: 'Fatigue Alerts', value: '2', trend: 'down', trendValue: '-60%' },
      { label: 'Wellness Score', value: '92.5', trend: 'up', trendValue: '+2.1' }
    ],
    isActive: true,
    category: 'crew',
    viewLevel: 'vp-crew'
  },
  {
    id: 'performance-analytics',
    title: 'Performance Analytics',
    icon: 'BarChart3',
    description: 'Predictive insights and trend analysis',
    kpis: [
      { label: 'Avg Performance', value: '4.6/5', trend: 'up', trendValue: '+0.1' },
      { label: 'Retention Rate', value: '96.2%', trend: 'up', trendValue: '+1.8%' },
      { label: 'Absence Rate', value: '2.1%', trend: 'down', trendValue: '-0.4%' },
      { label: 'Engagement Score', value: '88.5', trend: 'up', trendValue: '+3.2' }
    ],
    isActive: true,
    category: 'crew',
    viewLevel: 'vp-crew'
  },
  {
    id: 'resource-planning',
    title: 'Resource Planning',
    icon: 'Users',
    description: 'Demand forecasting and capacity management',
    kpis: [
      { label: 'Demand Forecast', value: '+18 crew', trend: 'up', trendValue: 'Q2 2025' },
      { label: 'Hiring Pipeline', value: '12', trend: 'up', trendValue: '+4' },
      { label: 'Capacity Gap', value: '5%', trend: 'down', trendValue: '-2%' },
      { label: 'Turnover Rate', value: '3.8%', trend: 'down', trendValue: '-0.5%' }
    ],
    isActive: true,
    category: 'crew',
    viewLevel: 'vp-crew'
  },
  {
    id: 'communications',
    title: 'Communications',
    icon: 'MessageSquare',
    description: 'Two-way crew messaging platform',
    kpis: [
      { label: 'Message Volume', value: '1,245', trend: 'up', trendValue: '+15%' },
      { label: 'Read Rate', value: '94.2%', trend: 'up', trendValue: '+2.1%' },
      { label: 'Response Time', value: '2.3 hrs', trend: 'down', trendValue: '-18%' },
      { label: 'Satisfaction Score', value: '4.5/5', trend: 'up', trendValue: '+0.2' }
    ],
    isActive: true,
    category: 'crew',
    viewLevel: 'vp-crew'
  },
  {
    id: 'compliance-management',
    title: 'Compliance Management',
    icon: 'Shield',
    description: 'Regulatory tracking and audit support',
    kpis: [
      { label: 'Compliance Rate', value: '99.8%', trend: 'stable', trendValue: '0%' },
      { label: 'Open Findings', value: '2', trend: 'down', trendValue: '-50%' },
      { label: 'Audit Score', value: '98.5', trend: 'up', trendValue: '+1.2' },
      { label: 'Policy Updates', value: '3', trend: 'stable', trendValue: 'This month' }
    ],
    isActive: true,
    category: 'crew',
    viewLevel: 'vp-crew'
  }
];
