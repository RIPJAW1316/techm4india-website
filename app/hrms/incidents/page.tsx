'use client';

import React, { useEffect, useState } from 'react';
import { hrmsClient, type IncidentReport } from '@/lib/hrms-client';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<'SAFETY' | 'HARASSMENT' | 'SECURITY' | 'POLICY_VIOLATION' | 'OTHER'>('SAFETY');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const res = await hrmsClient.getIncidents();
      setIncidents(res.data || []);
    } catch (err: any) {
      console.error('Failed to load incident reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitting(true);

    try {
      await hrmsClient.reportIncident({
        title,
        incidentDate: new Date(incidentDate).toISOString(),
        location,
        category,
        severity,
        description,
        isAnonymous,
      });

      setSubmitSuccess('Incident report securely submitted to POSH / Workplace Safety Committee.');
      setTitle('');
      setLocation('');
      setDescription('');
      setIsAnonymous(false);
      setShowModal(false);
      await loadIncidents();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit incident report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', margin: '0 0 6px 0' }}>
            Workplace Safety & Incident Reporting
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Confidential reporting channel for safety hazards, POSH grievances, and compliance breaches with optional anonymous whistleblowing.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 18px',
            backgroundColor: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>report</span>
          Report An Incident
        </button>
      </div>

      {submitSuccess && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
          ✓ {submitSuccess}
        </div>
      )}

      {/* Safety Notice Banner */}
      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span className="material-symbols-outlined" style={{ color: '#dc2626', fontSize: '28px' }}>health_and_safety</span>
        <div style={{ fontSize: '13px', color: '#991b1b' }}>
          <strong>Zero Tolerance Policy:</strong> TechM4India provides a strictly protected channel for all workplace health, safety, and POSH complaints. Anonymous submissions are scrubbed of personal identifiers.
        </div>
      </div>

      {/* Incidents Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--tm-navy)' }}>
            Reported Workplace Incidents ({incidents.length})
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Reviewed by Internal Complaints Committee (ICC)
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Incident Title & Location</th>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Severity</th>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Reporter</th>
              <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  No workplace safety incidents reported. Clean record for current quarter.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--tm-navy)' }}>
                    {new Date(inc.incidentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600 }}>{inc.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Location: {inc.location || 'Office Premises'}</div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontWeight: 500, fontSize: '11px' }}>
                      {inc.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? '#fee2e2' : '#fef3c7',
                        color: inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? '#991b1b' : '#92400e',
                      }}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: inc.isAnonymous ? '#64748b' : 'var(--tm-navy)', fontStyle: inc.isAnonymous ? 'italic' : 'normal' }}>
                    {inc.isAnonymous ? 'Anonymous Reporter' : (inc.reporter ? `${inc.reporter.firstName} ${inc.reporter.lastName}` : 'Confidential')}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: inc.status === 'RESOLVED' ? '#dcfce7' : inc.status === 'INVESTIGATING' ? '#dbeafe' : '#fef3c7',
                        color: inc.status === 'RESOLVED' ? '#166534' : inc.status === 'INVESTIGATING' ? '#1d4ed8' : '#92400e',
                      }}
                    >
                      {inc.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Report Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              width: '520px',
              maxWidth: '90vw',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--tm-navy)', margin: 0 }}>
                Report Safety / Workplace Incident
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {submitError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                  {submitError}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  INCIDENT TITLE *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken handrail on 3rd floor staircase"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    CATEGORY *
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="SAFETY">Safety Hazard</option>
                    <option value="HARASSMENT">Harassment / POSH</option>
                    <option value="SECURITY">Physical Security</option>
                    <option value="POLICY_VIOLATION">Policy Violation</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    SEVERITY *
                  </label>
                  <select
                    value={severity}
                    onChange={(e: any) => setSeverity(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical Emergency</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    INCIDENT DATE *
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    LOCATION
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hyderabad Campus, Wing B"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  DESCRIPTION OF OCCURRENCE *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide objective facts regarding the incident..."
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anonymousCheck" style={{ fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  <strong>Submit Anonymously</strong> (Do not attach my name or employee ID)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '10px 18px', backgroundColor: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
