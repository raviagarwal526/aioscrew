import { useState } from 'react';
import ClaimsReviewDashboard from '../components/admin/ClaimsReviewDashboard';
import ExcessPaymentReview from '../components/admin/ExcessPaymentReview';

interface PayrollViewImprovedProps {
  activeView?: string;
}

export default function PayrollViewImproved({ activeView = 'claims' }: PayrollViewImprovedProps) {
  // Route to appropriate submenu based on activeView
  if (activeView === 'claims') {
    return <ClaimsReviewDashboard />;
  }

  if (activeView === 'excess-payments') {
    return <ExcessPaymentReview />;
  }

  if (activeView === 'payments') {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Payments</h2>
        <p className="text-gray-600">Payments dashboard coming soon...</p>
      </div>
    );
  }

  if (activeView === 'reports') {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Reports</h2>
        <p className="text-gray-600">Reports dashboard coming soon...</p>
      </div>
    );
  }

  if (activeView === 'settings') {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <p className="text-gray-600">Settings dashboard coming soon...</p>
      </div>
    );
  }

  // Default to Claims Review
  return <ClaimsReviewDashboard />;
}
