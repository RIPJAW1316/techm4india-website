'use client';

import React, { useEffect, useState } from 'react';
import { hrmsClient, type Announcement } from '@/lib/hrms-client';

interface ForumPost {
  id: string;
  title: string;
  author: string;
  department: string;
  date: string;
  replies: number;
  preview: string;
}

const mockForumPosts: ForumPost[] = [];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notices' | 'forum'>('notices');

  // New Notice Modal
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePriority, setNoticePriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await hrmsClient.getAnnouncements();
      setAnnouncements(res.data || []);
    } catch (err: any) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitting(true);

    try {
      await hrmsClient.createAnnouncement({
        title: noticeTitle,
        content: noticeContent,
        priority: noticePriority,
      });

      setSubmitSuccess('Announcement published to company notice board.');
      setNoticeTitle('');
      setNoticeContent('');
      setShowNoticeModal(false);
      await loadData();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create notice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--tm-navy)', margin: '0 0 6px 0' }}>
            Notice Board & Knowledge Sharing
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Hr.my-style broadcast notices, company-wide circulars, and cross-department discussion forums.
          </p>
        </div>

        <button
          onClick={() => setShowNoticeModal(true)}
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--tm-navy)',
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
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>campaign</span>
          Publish Notice
        </button>
      </div>

      {submitSuccess && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
          ✓ {submitSuccess}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('notices')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'notices' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'notices' ? 600 : 500,
            color: activeTab === 'notices' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Company Broadcasts ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('forum')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'forum' ? '2px solid var(--tm-navy)' : '2px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'forum' ? 600 : 500,
            color: activeTab === 'forum' ? 'var(--tm-navy)' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Discussion Forums ({mockForumPosts.length})
        </button>
      </div>

      {/* Notices Feed */}
      {activeTab === 'notices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.length === 0 ? (
            <div style={{ backgroundColor: '#fff', padding: '36px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8' }}>
              No official announcements posted yet. Click "Publish Notice" to post.
            </div>
          ) : (
            announcements.map((ann) => (
              <div
                key={ann.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px 24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--tm-navy)', margin: 0 }}>
                      {ann.title}
                    </h3>
                    {ann.priority === 'URGENT' && (
                      <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px' }}>
                        URGENT
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(ann.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: '8px 0 12px 0' }}>
                  {ann.content}
                </p>

                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                  <span>Published by <strong>HR Management</strong></span>
                  <span>•</span>
                  <span>Audience: <strong>All Employees</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Discussion Forum Feed */}
      {activeTab === 'forum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mockForumPosts.map((post) => (
            <div
              key={post.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--tm-navy)', margin: '0 0 6px 0' }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 12px 0' }}>
                    {post.preview}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                    <span>By <strong>{post.author}</strong> ({post.department})</span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--tm-navy)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chat_bubble</span>
                  {post.replies} replies
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notice Publish Modal */}
      {showNoticeModal && (
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
                Publish Company Notice
              </h2>
              <button
                onClick={() => setShowNoticeModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNotice} style={{ padding: '24px' }}>
              {submitError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                  {submitError}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  NOTICE TITLE *
                </label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Annual Diwali Celebrations & Office Holiday Schedule"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  PRIORITY *
                </label>
                <select
                  value={noticePriority}
                  onChange={(e: any) => setNoticePriority(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent Broadcast</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  ANNOUNCEMENT DETAILS *
                </label>
                <textarea
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Draft message body..."
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  style={{ padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '10px 18px', backgroundColor: 'var(--tm-navy)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  {submitting ? 'Publishing...' : 'Publish To Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
