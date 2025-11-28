# Minimal Airline Standard Enhancements

## Overview

This migration adds **only essential tables** required for real-world airline payroll and operations. It focuses on what's actually needed, not what's nice-to-have.

## What Was Added (Minimal Set)

### 1. Pay Rates (`pay_rates`)
- **Why**: Need to know what to pay crew based on role and seniority
- **Simplified**: No aircraft-specific rates (can be handled in application logic)
- **Usage**: Links to `crew_members.pay_rate_id`

### 2. Tax Profiles (`tax_profiles`)
- **Why**: Essential for payroll tax calculations
- **Contains**: Filing status, allowances, state code, additional withholding
- **Usage**: Used to calculate federal, state, and local taxes in payroll

### 3. Payroll Records (`pay_periods` + `payroll_records`)
- **Why**: Essential - need to track what was actually paid
- **Contains**: Gross pay, taxes (federal, state, local, SS, Medicare), deductions, net pay
- **Usage**: Links claims to actual payroll payments

### 3. Per Diem Rates (`per_diem_rates`)
- **Why**: Currently hardcoded in scripts, should be in database
- **Usage**: Lookup per diem by airport code

### 4. Bank Accounts (`bank_accounts`)
- **Why**: Essential for direct deposit payroll
- **Security**: Account numbers encrypted

### 5. Flight Logs (`flight_logs`)
- **Why**: Need actual vs scheduled times for accurate payroll
- **Usage**: Track actual flight times, delays, and calculate accurate pay

### 6. Leave Balances (`leave_balances`)
- **Why**: Basic HR requirement - track vacation/sick leave
- **Simplified**: Just hours, not complex accrual rules

### 7. Bidding System (`bid_periods`, `bid_lines`, `bid_submissions`, `bid_awards`)
- **Why**: Essential for crew scheduling - seniority-based line bidding
- **Contains**: 
  - `bid_periods`: Bidding windows with open/close dates
  - `bid_lines`: Available lines to bid on (by base, aircraft type)
  - `bid_submissions`: Crew member bid preferences (ranked choices)
  - `bid_awards`: Final award results based on seniority
- **Usage**: Links to roster assignments for crew scheduling

### 8. Enhanced Crew Member Fields
Added to `crew_members`:
- `employee_number` - Unique employee ID
- `pay_rate_id` - Link to pay rate
- `union_member` + `union_code` - Simple union tracking
- `pay_frequency` - How often they get paid

### 9. Enhanced Trip Fields
Added to `trips`:
- `actual_departure_time` / `actual_arrival_time` - Actual times
- `actual_flight_time_hours` - Actual flight time
- `delay_minutes` / `delay_code` - Delay tracking
- `aircraft_registration` - Tail number

### 10. Links Between Claims and Payroll
- `pay_claims.payroll_id` - Link approved claims to payroll
- `payment_items.payroll_id` - Link payments to payroll records

## What Was NOT Added (Intentionally Removed)

❌ **Complex CBA structure** - Already in Neo4j, don't duplicate
❌ **Tax/deduction details** - Basic tax profiles added, detailed deductions in app logic
✅ **Bidding system** - Added (essential for crew scheduling)
❌ **Performance evaluations** - Separate HR system
❌ **Disciplinary records** - Separate HR system
❌ **Cost centers** - Accounting system handles this
❌ **License tracking** - Training records table already exists
❌ **Complex leave accruals** - Simple balance tracking is enough
❌ **Time zones** - Handle in application logic
❌ **Aircraft master data** - Not needed for payroll
❌ **Route qualifications** - Crew qualifications table exists

## Industry Standards Addressed

✅ **Payroll Processing**: Pay rates, tax profiles, payroll records, bank accounts
✅ **Tax Calculations**: Tax profiles with filing status and allowances
✅ **Bidding System**: Complete bidding workflow (periods, lines, submissions, awards)
✅ **Per Diem Management**: Location-based rates (currently hardcoded)
✅ **Actual Flight Times**: Track actual vs scheduled for accurate pay
✅ **Leave Management**: Basic leave balance tracking
✅ **Data Integrity**: Foreign key constraints

## Migration Order

Run migrations in this order:
1. `base_schema.sql`
2. `admin_schema.sql`
3. `crew_scheduling_schema.sql`
4. **`airline_standard_enhancements.sql`** (this file)

## Total Tables Added: 11

1. `pay_rates`
2. `tax_profiles`
3. `pay_periods`
4. `payroll_records`
5. `per_diem_rates`
6. `bank_accounts`
7. `flight_logs`
8. `leave_balances`
9. `bid_periods`
10. `bid_lines`
11. `bid_submissions`
12. `bid_awards`

Plus enhanced fields on existing tables.

## Next Steps

1. **Seed Data**: Populate `pay_rates` and `per_diem_rates` with actual rates
2. **Update Services**: Update payroll services to use new tables
3. **Data Migration**: Link existing crew to pay rates
4. **Testing**: Test payroll calculations with actual flight times
