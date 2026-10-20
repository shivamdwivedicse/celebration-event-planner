/**
 * Timeline Section component.
 * Displays backward-counting milestone phases, rush plan alerts,
 * day-of run-of-show schedule, and post-event wrap-up tasks.
 */

import React, { useState } from 'react';
import { AlertCircle, Calendar, CheckSquare, Clock, Flag, ListOrdered } from 'lucide-react';
import { TimelinePlan } from '../types.ts';

interface TimelineSectionProps {
  timeline: TimelinePlan;
  eventDate: string;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ timeline, eventDate }) => {
  const [activeTab, setActiveTab] = useState<'phases' | 'dayOf' | 'postEvent'>('phases');
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('celebration_completed_timeline_tasks');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggleTask = (id: string) => {
    setCompletedTaskIds((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('celebration_completed_timeline_tasks', JSON.stringify(updated));
      } catch {
        // Safe fallback if local storage restricted
      }
      return updated;
    });
  };

  return (
    <section className="card" aria-labelledby="timeline-heading">
      <div className="card-header flex-between">
        <div>
          <h2 id="timeline-heading" className="card-title">
            Timeline & Execution Roadmap
          </h2>
          <p className="card-subtitle">
            Target Event Date: <strong>{eventDate}</strong> ({timeline.totalWeeks} weeks remaining).
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="tab-nav" role="tablist" aria-label="Timeline navigation views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'phases'}
            aria-controls="tab-panel-phases"
            id="tab-btn-phases"
            className={`tab-btn ${activeTab === 'phases' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('phases')}
          >
            <Calendar size={14} aria-hidden="true" />
            <span>Milestone Countdown</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'dayOf'}
            aria-controls="tab-panel-dayOf"
            id="tab-btn-dayOf"
            className={`tab-btn ${activeTab === 'dayOf' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('dayOf')}
          >
            <Clock size={14} aria-hidden="true" />
            <span>Day-Of Schedule</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'postEvent'}
            aria-controls="tab-panel-postEvent"
            id="tab-btn-postEvent"
            className={`tab-btn ${activeTab === 'postEvent' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('postEvent')}
          >
            <Flag size={14} aria-hidden="true" />
            <span>Post-Event Wrap Up</span>
          </button>
        </div>
      </div>

      {/* Rush Plan Notification Banner */}
      {timeline.isRushPlan && (
        <div className="rush-banner" role="alert">
          <AlertCircle size={20} aria-hidden="true" className="rush-icon" />
          <div className="rush-text">
            <strong className="rush-title">RUSH PLAN ACTIVE</strong>
            <p className="rush-desc">{timeline.rushNotice}</p>
          </div>
        </div>
      )}

      {/* Tab 1: Backward Milestone Countdown */}
      {activeTab === 'phases' && (
        <div
          id="tab-panel-phases"
          role="tabpanel"
          aria-labelledby="tab-btn-phases"
          className="timeline-phases"
        >
          {timeline.phases.map((phase, pIdx) => (
            <div key={phase.phaseName} className="phase-card">
              <div className="phase-header">
                <span className="phase-badge">Phase {pIdx + 1}</span>
                <h3 className="phase-title">{phase.phaseName}</h3>
                <span className="phase-timeframe text-muted">{phase.timeframe}</span>
              </div>
              <ul className="task-list" aria-label={`Tasks for ${phase.phaseName}`}>
                {phase.tasks.map((task) => {
                  const isChecked = Boolean(completedTaskIds[task.id]);
                  return (
                    <li
                      key={task.id}
                      className={`task-item ${isChecked ? 'task-completed' : ''} ${task.isPriority ? 'task-priority' : ''}`}
                    >
                      <label className="task-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTask(task.id)}
                          className="task-checkbox"
                          aria-label={`Mark "${task.title}" as completed`}
                        />
                        <div className="task-body">
                          <div className="task-title-row">
                            <span className="task-title">{task.title}</span>
                            {task.isPriority && (
                              <span className="badge badge-priority" aria-label="Critical priority task">
                                Critical Path
                              </span>
                            )}
                            <span className="badge badge-category">{task.category}</span>
                          </div>
                          <p className="task-desc">{task.description}</p>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Day-Of Hour-by-Hour Run-of-Show */}
      {activeTab === 'dayOf' && (
        <div
          id="tab-panel-dayOf"
          role="tabpanel"
          aria-labelledby="tab-btn-dayOf"
          className="day-of-schedule"
        >
          <div className="day-of-intro">
            <ListOrdered size={16} aria-hidden="true" />
            <span>Master Run-of-Show: Precise hourly staging for on-site coordinators, crew, and vendors.</span>
          </div>

          <div className="schedule-timeline">
            {timeline.dayOfSchedule.map((item, idx) => (
              <div key={idx} className="schedule-entry">
                <div className="schedule-time-col">
                  <span className="schedule-time-badge">{item.time}</span>
                </div>
                <div className="schedule-marker" aria-hidden="true" />
                <div className="schedule-content">
                  <div className="schedule-head">
                    <h4 className="schedule-activity">{item.activity}</h4>
                    <span className="schedule-role">Lead: {item.assignedRole}</span>
                  </div>
                  <p className="schedule-details">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Post-Event Wrap Up */}
      {activeTab === 'postEvent' && (
        <div
          id="tab-panel-postEvent"
          role="tabpanel"
          aria-labelledby="tab-btn-postEvent"
          className="post-event-container"
        >
          <p className="text-muted mb-3">
            Final closure steps to return borrowed equipment, close open invoices, share photos, and thank contributors.
          </p>
          <ul className="task-list" aria-label="Post-event tasks">
            {timeline.postEventTasks.map((task) => {
              const isChecked = Boolean(completedTaskIds[task.id]);
              return (
                <li
                  key={task.id}
                  className={`task-item ${isChecked ? 'task-completed' : ''}`}
                >
                  <label className="task-label">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox"
                      aria-label={`Mark "${task.title}" as completed`}
                    />
                    <div className="task-body">
                      <div className="task-title-row">
                        <span className="task-title">{task.title}</span>
                        <span className="badge badge-category">{task.timeframe}</span>
                      </div>
                      <p className="task-desc">{task.description}</p>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
};
