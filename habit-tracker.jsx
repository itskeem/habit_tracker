import React, { useState, useEffect } from 'react';
import { Plus, Check, Flame, Calendar, TrendingUp, X } from 'lucide-react';

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [showConfetti, setShowConfetti] = useState(false);

  // Check if all habits are completed today
  useEffect(() => {
    if (habits.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const allComplete = habits.every(habit => habit.completions[today]);
    
    if (allComplete && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Hide after 5 seconds
    }
  }, [habits]);

  // Load habits from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('habits-tracker-data');
    if (stored) {
      setHabits(JSON.parse(stored));
    }
  }, []);

  // Save habits to localStorage
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem('habits-tracker-data', JSON.stringify(habits));
    }
  }, [habits]);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    
    const newHabit = {
      id: Date.now(),
      name: newHabitName,
      completions: {},
      createdAt: new Date().toISOString()
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setShowAddModal(false);
  };

  const toggleCompletion = (habitId) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const completions = { ...habit.completions };
        if (completions[selectedDate]) {
          delete completions[selectedDate];
        } else {
          completions[selectedDate] = true;
        }
        return { ...habit, completions };
      }
      return habit;
    }));
  };

  const deleteHabit = (habitId) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const startEditing = (habit) => {
    setEditingId(habit.id);
    setEditingName(habit.name);
  };

  const saveEdit = () => {
    if (!editingName.trim()) return;
    
    setHabits(habits.map(habit => 
      habit.id === editingId ? { ...habit, name: editingName } : habit
    ));
    setEditingId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const getStreak = (habit) => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (habit.completions[dateStr]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: i === 0
      });
    }
    
    return days;
  };

  const getMonthDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for first day (0 = Sunday)
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Add all days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      
      days.push({
        date: dateStr,
        day: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }
    
    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return {
      days,
      monthName: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  };

  const totalCompletions = habits.reduce((sum, habit) => 
    sum + Object.keys(habit.completions).length, 0
  );

  const todayCompletions = habits.filter(h => 
    h.completions[new Date().toISOString().split('T')[0]]
  ).length;

  const allHabitsCompleteToday = habits.length > 0 && todayCompletions === habits.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      fontFamily: '"Courier New", monospace',
      color: '#fff',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 40px, rgba(255,255,255,0.03) 41px),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 40px, rgba(255,255,255,0.03) 41px)
        `,
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{
          marginBottom: '3rem',
          borderBottom: '4px solid #00ff88',
          paddingBottom: '1.5rem',
          animation: 'slideDown 0.6s ease-out'
        }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            letterSpacing: '-0.05em',
            margin: 0,
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 40px rgba(0, 255, 136, 0.3)'
          }}>
            HABITS.SYS
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#888',
            margin: '0.5rem 0 0 0',
            letterSpacing: '0.2em',
            textTransform: 'uppercase'
          }}>
            BUILD ▸ TRACK ▸ CONQUER
          </p>
        </header>

        {/* Stats Dashboard */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem',
          animation: 'fadeIn 0.8s ease-out 0.2s both'
        }}>
          <StatCard 
            icon={<TrendingUp size={32} />}
            label="ACTIVE HABITS"
            value={habits.length}
            color="#00ff88"
          />
          <StatCard 
            icon={<Check size={32} />}
            label="TODAY"
            value={`${todayCompletions}/${habits.length}`}
            color="#00d4ff"
            highlight={allHabitsCompleteToday}
          />
          <StatCard 
            icon={<Flame size={32} />}
            label="TOTAL DONE"
            value={totalCompletions}
            color="#ff0080"
          />
        </div>

        {/* Add Habit Button */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              fontFamily: '"Courier New", monospace',
              color: '#000',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              boxShadow: '0 8px 32px rgba(0, 255, 136, 0.3)',
              transition: 'all 0.3s ease',
              animation: 'fadeIn 1s ease-out 0.4s both',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 40px rgba(0, 255, 136, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(0, 255, 136, 0.3)';
            }}
          >
            <Plus size={20} /> NEW HABIT
          </button>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            border: '2px solid #333',
            animation: 'fadeIn 1s ease-out 0.4s both'
          }}>
            <button
              onClick={() => setViewMode('week')}
              style={{
                background: viewMode === 'week' ? '#00ff88' : 'transparent',
                border: 'none',
                padding: '1rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                fontFamily: '"Courier New", monospace',
                color: viewMode === 'week' ? '#000' : '#888',
                cursor: 'pointer',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              7 DAYS
            </button>
            <button
              onClick={() => setViewMode('month')}
              style={{
                background: viewMode === 'month' ? '#00ff88' : 'transparent',
                border: 'none',
                borderLeft: '2px solid #333',
                padding: '1rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                fontFamily: '"Courier New", monospace',
                color: viewMode === 'month' ? '#000' : '#888',
                cursor: 'pointer',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              MONTH
            </button>
          </div>
        </div>

        {/* Habits List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {habits.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              border: '2px dashed #333',
              borderRadius: '4px',
              color: '#666',
              animation: 'fadeIn 1s ease-out 0.6s both'
            }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>NO HABITS DETECTED</p>
              <p style={{ fontSize: '1rem' }}>INITIALIZE YOUR FIRST HABIT TO BEGIN</p>
            </div>
          ) : (
            habits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={toggleCompletion}
                onDelete={deleteHabit}
                getStreak={getStreak}
                getLast7Days={getLast7Days}
                getMonthDays={getMonthDays}
                viewMode={viewMode}
                index={index}
                isEditing={editingId === habit.id}
                editingName={editingName}
                onStartEdit={startEditing}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                onEditNameChange={setEditingName}
              />
            ))
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              background: '#1a1a2e',
              border: '3px solid #00ff88',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.4)',
              animation: 'scaleIn 0.3s ease-out'
            }}>
              <h2 style={{
                fontSize: '2rem',
                marginBottom: '1.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#00ff88'
              }}>
                NEW HABIT
              </h2>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                placeholder="ENTER HABIT NAME..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  background: '#0a0a0a',
                  border: '2px solid #333',
                  color: '#fff',
                  fontFamily: '"Courier New", monospace',
                  marginBottom: '1.5rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={addHabit}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: '#00ff88',
                    border: 'none',
                    color: '#000',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    fontFamily: '"Courier New", monospace',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#00d4a0'}
                  onMouseLeave={(e) => e.target.style.background = '#00ff88'}
                >
                  ADD
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewHabitName('');
                  }}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'transparent',
                    border: '2px solid #666',
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    fontFamily: '"Courier New", monospace',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#fff';
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#666';
                    e.target.style.color = '#666';
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect />}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

function ConfettiEffect() {
  const particles = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDelay: Math.random() * 0.5,
    animationDuration: 2 + Math.random() * 2,
    color: ['#00ff88', '#00d4ff', '#ff0080', '#ffff00'][Math.floor(Math.random() * 4)],
    rotation: Math.random() * 360,
    size: 8 + Math.random() * 12
  }));

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* Success message */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0, 0, 0, 0.95)',
        border: '3px solid #00ff88',
        padding: '2rem 3rem',
        fontSize: '2.5rem',
        fontFamily: '"Courier New", monospace',
        fontWeight: 'bold',
        color: '#00ff88',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        animation: 'confettiPop 0.5s ease-out',
        boxShadow: '0 0 60px rgba(0, 255, 136, 0.5)',
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        ALL HABITS<br/>COMPLETED! 🔥
      </div>

      {/* Confetti particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.left}%`,
            top: '-20px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confettiFall ${particle.animationDuration}s linear ${particle.animationDelay}s forwards`,
            opacity: 0.9
          }}
        />
      ))}

      {/* Additional animations */}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes confettiPop {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, color, highlight = false }) {
  return (
    <div style={{
      background: highlight ? `${color}20` : 'rgba(255, 255, 255, 0.05)',
      border: `2px solid ${color}`,
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      transition: 'all 0.3s ease',
      cursor: 'default',
      animation: highlight ? 'pulse 2s ease-in-out infinite' : 'none',
      boxShadow: highlight ? `0 0 30px ${color}60` : 'none'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = `${color}15`;
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 8px 24px ${color}40`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = highlight ? `${color}20` : 'rgba(255, 255, 255, 0.05)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = highlight ? `0 0 30px ${color}60` : 'none';
    }}
    >
      <div style={{ color }}>{icon}</div>
      <div style={{
        fontSize: '0.8rem',
        color: '#888',
        letterSpacing: '0.15em',
        textTransform: 'uppercase'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color
      }}>
        {value}
      </div>
      {highlight && (
        <div style={{
          fontSize: '0.9rem',
          color: color,
          fontWeight: 'bold',
          letterSpacing: '0.1em',
          marginTop: '0.5rem'
        }}>
          ✨ PERFECT!
        </div>
      )}
    </div>
  );
}

function HabitCard({ habit, onToggle, onDelete, getStreak, getLast7Days, getMonthDays, viewMode, index, isEditing, editingName, onStartEdit, onSaveEdit, onCancelEdit, onEditNameChange }) {
  const streak = getStreak(habit);
  const days = getLast7Days();
  const monthData = getMonthDays();
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completions[today];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '2px solid #333',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      transition: 'all 0.3s ease',
      animation: `fadeIn 0.5s ease-out ${0.6 + index * 0.1}s both`
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#00ff88';
      e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#333';
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={editingName}
                onChange={(e) => onEditNameChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') onSaveEdit();
                  if (e.key === 'Escape') onCancelEdit();
                }}
                onBlur={onSaveEdit}
                autoFocus
                style={{
                  fontSize: '1.5rem',
                  background: '#0a0a0a',
                  border: '2px solid #00ff88',
                  color: '#fff',
                  fontFamily: '"Courier New", monospace',
                  padding: '0.5rem',
                  outline: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  flex: 1
                }}
              />
              <button
                onClick={onSaveEdit}
                style={{
                  background: '#00ff88',
                  border: 'none',
                  color: '#000',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontFamily: '"Courier New", monospace',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                SAVE
              </button>
              <button
                onClick={onCancelEdit}
                style={{
                  background: 'transparent',
                  border: '2px solid #666',
                  color: '#666',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontFamily: '"Courier New", monospace',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                CANCEL
              </button>
            </div>
          ) : (
            <h3 
              onDoubleClick={() => onStartEdit(habit)}
              style={{
                fontSize: '1.5rem',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#fff',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#00ff88'}
              onMouseLeave={(e) => e.target.style.color = '#fff'}
              title="Double-click to edit"
            >
              {habit.name}
            </h3>
          )}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
            color: streak > 0 ? '#ff0080' : '#666'
          }}>
            <Flame size={16} />
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
              {streak} DAY STREAK
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(habit.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            padding: '0.5rem',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#ff0080'}
          onMouseLeave={(e) => e.target.style.color = '#666'}
        >
          <X size={20} />
        </button>
      </div>

      {/* Calendar visualization - Week or Month */}
      {viewMode === 'week' ? (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {days.map((day) => (
            <div
              key={day.date}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <div style={{
                fontSize: '0.7rem',
                color: day.isToday ? '#00ff88' : '#666',
                fontWeight: day.isToday ? 'bold' : 'normal'
              }}>
                {day.label}
              </div>
              <div style={{
                width: '100%',
                height: '40px',
                background: habit.completions[day.date] ? 
                  'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)' : 
                  'rgba(255, 255, 255, 0.1)',
                border: day.isToday ? '2px solid #00ff88' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!habit.completions[day.date]) {
                  e.target.style.background = 'rgba(0, 255, 136, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!habit.completions[day.date]) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              >
                {habit.completions[day.date] && <Check size={20} color="#000" />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{
            fontSize: '0.9rem',
            color: '#00ff88',
            marginBottom: '0.75rem',
            letterSpacing: '0.1em',
            fontWeight: 'bold'
          }}>
            {monthData.monthName}
          </div>
          
          {/* Day headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.25rem',
            marginBottom: '0.25rem'
          }}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} style={{
                fontSize: '0.6rem',
                color: '#666',
                textAlign: 'center',
                padding: '0.25rem'
              }}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.25rem'
          }}>
            {monthData.days.map((day, idx) => (
              <div
                key={idx}
                style={{
                  aspectRatio: '1',
                  background: habit.completions[day.date] ?
                    'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)' :
                    'rgba(255, 255, 255, 0.1)',
                  border: day.isToday ? '2px solid #00ff88' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  color: day.isCurrentMonth ? '#fff' : '#444',
                  opacity: day.isCurrentMonth ? 1 : 0.4,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!habit.completions[day.date]) {
                    e.currentTarget.style.background = 'rgba(0, 255, 136, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!habit.completions[day.date]) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  left: '2px',
                  fontSize: '0.65rem',
                  fontWeight: day.isToday ? 'bold' : 'normal'
                }}>
                  {day.day}
                </span>
                {habit.completions[day.date] && (
                  <Check size={12} color={habit.completions[day.date] ? '#000' : '#666'} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete today button */}
      <button
        onClick={() => onToggle(habit.id)}
        style={{
          padding: '1rem',
          background: isCompletedToday ? 
            'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)' : 
            'transparent',
          border: isCompletedToday ? 'none' : '2px solid #00ff88',
          color: isCompletedToday ? '#000' : '#00ff88',
          fontSize: '1rem',
          fontWeight: 'bold',
          fontFamily: '"Courier New", monospace',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isCompletedToday) {
            e.target.style.background = 'rgba(0, 255, 136, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isCompletedToday) {
            e.target.style.background = 'transparent';
          }
        }}
      >
        {isCompletedToday ? (
          <>
            <Check size={20} /> COMPLETED TODAY
          </>
        ) : (
          <>
            MARK AS COMPLETE
          </>
        )}
      </button>
    </div>
  );
}
