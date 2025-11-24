# Crew Scheduling System

A comprehensive airline crew scheduling system built as a new card/module in the Aioscrew platform, supporting regulatory compliance, automated roster generation, and disruption management.

## Overview

The Crew Scheduling System provides end-to-end functionality for:
- **Regulatory Compliance**: Rule engine for FAA, EASA, and custom regulations
- **Roster Generation**: Automated monthly roster creation with optimization
- **Disruption Management**: Real-time handling of delays, cancellations, and crew unavailability
- **Crew Self-Service**: Leave requests, swap requests, and notifications
- **Reporting & Analytics**: Compliance reports, utilization metrics, and disruption analysis

## Architecture

### Backend Components

#### Database Schema (`backend/migrations/crew_scheduling_schema.sql`)
- **Crew Master Data**: Qualifications, availability, duty history
- **Regulatory Rules**: Rule definitions, evaluations, overrides
- **Roster Management**: Pairings, assignments, versions
- **Disruption Tracking**: Events, reassignments, impact assessment
- **Self-Service**: Leave requests, swap requests, notifications
- **Reporting**: Compliance reports, utilization reports, disruption analysis

#### API Routes (`backend/api/routes/crew-scheduling.ts`)
- `/api/crew-scheduling/rules` - Regulatory rule management
- `/api/crew-scheduling/compliance/:crewId` - Compliance evaluation
- `/api/crew-scheduling/roster/generate` - Roster generation
- `/api/crew-scheduling/roster/assignments` - Assignment management
- `/api/crew-scheduling/disruptions` - Disruption management
- `/api/crew-scheduling/crew/available` - Crew availability
- `/api/crew-scheduling/reports/compliance` - Compliance reporting

#### Services (`backend/services/crew-scheduling-service.ts`)
- Rule engine for compliance checking
- Roster generation algorithms
- Crew availability filtering
- Disruption handling logic

### Frontend Components

#### Main View (`src/views/CrewSchedulingView.tsx`)
- Dashboard with key metrics
- Quick actions for common tasks
- Recent activity feed
- Active disruptions overview

#### Sub-Views
- **RosterBuilderView** (`src/views/crew-scheduling/RosterBuilderView.tsx`)
  - Period selection
  - Roster generation
  - Version management
  - Publishing workflow

- **RuleEngineView** (`src/views/crew-scheduling/RuleEngineView.tsx`)
  - Regulatory rule configuration
  - Jurisdiction management
  - Rule editing and deletion

- **DisruptionManagementView** (`src/views/crew-scheduling/DisruptionManagementView.tsx`)
  - Disruption listing and filtering
  - Severity classification
  - Reassignment suggestions

- **ComplianceReportsView** (`src/views/crew-scheduling/ComplianceReportsView.tsx`)
  - Period-based compliance reports
  - Violation tracking
  - Export functionality

- **CrewManagementView** (`src/views/crew-scheduling/CrewManagementView.tsx`)
  - Crew directory
  - Qualification management
  - Availability tracking

## Key Features

### 1. Regulatory Rule Engine
- Supports multiple jurisdictions (FAA Domestic, FAA International, EASA, Custom)
- Pre-configured FAA Domestic rules (14 CFR §121.471):
  - Annual limit: 1,000 hours
  - Monthly limit: 100 hours
  - 7-day limit: 30 hours
  - Minimum rest: 8-11 hours based on flight time
- Automated compliance checking during scheduling
- Audit trail of rule evaluations
- Override management with justification

### 2. Roster Generation
- Automated roster generation for any period
- Multiple optimization objectives (cost, utilization, fairness)
- What-if scenario support
- Version control for roster iterations
- Compliance validation before publishing
- Crew notification on publication

### 3. Disruption Management
- Real-time disruption tracking
- Severity classification (critical, major, moderate, minor)
- Automated reassignment suggestions
- Compliance checking for reassignments
- Impact assessment and cost tracking
- Resolution workflow

### 4. Compliance Reporting
- Period-based compliance reports
- Violation tracking by crew, base, rule type
- Compliance rate calculations
- Exportable reports for regulators
- Historical trend analysis

### 5. Crew Self-Service
- Leave request management
- Swap request handling
- Roster viewing and acknowledgment
- Push notifications for changes
- Rule explanations and reminders

## Integration Points

### Database Integration
- Extends existing `crew_members` table
- Links to `trips` table for flight assignments
- Integrates with payroll system for duty tracking

### API Integration Points
- Flight schedule data source (future)
- Crew training systems (future)
- HR/payroll systems (future)
- Operations control systems (future)

## Usage

### Accessing the System
1. Select **"Crew Scheduling System"** from the landing page
2. Navigate through sidebar menu:
   - Dashboard
   - Roster Builder
   - Rule Engine
   - Disruptions
   - Compliance Reports
   - Crew Management

### Generating a Roster
1. Navigate to **Roster Builder**
2. Select period (start and end dates)
3. Click **Generate Roster**
4. Review generated roster versions
5. Check for violations
6. Publish when ready

### Managing Disruptions
1. Navigate to **Disruptions**
2. View open disruptions
3. Click **Suggest Reassignment** for automated solutions
4. Review compliance of suggested reassignments
5. Approve and notify crew

### Viewing Compliance Reports
1. Navigate to **Compliance Reports**
2. Select reporting period
3. Review violations and compliance rates
4. Export report if needed

## Database Setup

Run the migration script to create all necessary tables:

```bash
# Connect to your PostgreSQL database
psql $DATABASE_URL -f backend/migrations/crew_scheduling_schema.sql
```

## API Endpoints

All endpoints are prefixed with `/api/crew-scheduling`:

- `GET /rules` - List regulatory rules
- `POST /rules` - Create new rule
- `GET /compliance/:crewId` - Evaluate crew compliance
- `POST /roster/generate` - Generate roster
- `GET /roster/assignments` - Get assignments
- `GET /roster/versions` - List roster versions
- `POST /roster/publish` - Publish roster
- `GET /disruptions` - List disruptions
- `POST /disruptions` - Create disruption
- `POST /disruptions/:id/resolve` - Resolve disruption
- `GET /crew/available` - Get available crew
- `GET /crew/:id/qualifications` - Get crew qualifications
- `GET /reports/compliance` - Generate compliance report

## Future Enhancements

- Advanced optimization algorithms (genetic algorithms, constraint programming)
- Machine learning for disruption prediction
- Integration with flight operations systems
- Mobile app for crew self-service
- Real-time WebSocket updates
- Advanced analytics and forecasting
- Multi-base support with commuting optimization
- Seniority-based bidding system integration

## Notes

- The system is designed to be configurable without code changes
- Rule engine supports multiple jurisdictions simultaneously
- All actions are logged for audit purposes
- Compliance checking happens in real-time during scheduling
- Disruption management maintains full compliance during reassignments
