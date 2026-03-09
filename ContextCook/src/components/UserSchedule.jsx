import { useState, useEffect } from 'react';

const AvailabilityTracker = ({ isOpen, onClose, onSaveSchedule, savedActivities }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if(isOpen) {
      setActivities(savedActivities || []);
    }
  }, [isOpen, savedActivities]);

  if (!isOpen) return null;

  const addEvent = () => {
    setActivities([...activities, { id: Date.now(), start: '', end: '', label: '' }]);
  };

  const updateEvent = (id, field, value) => {
    setActivities(activities.map(activity => activity.id === id ? { ...activity, [field]: value } : activity));
  };

  const removeEvent = (id) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const handleFinish = () => {
    // Only keep activities that have a label, a start time, AND an end time
    const validatedActivities = activities.filter(activity => 
      activity.label.trim() !== "" && 
      activity.start !== "" && 
      activity.end !== ""
    );

    setActivities(validatedActivities);
    onSaveSchedule(validatedActivities);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000, // Stays above everything
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '85vh',
        borderRadius: '20px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Your Schedule</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Scrollable List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '24px', paddingRight: '8px' }}>
          {activities.length === 0 && (
            <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>No activities added yet.</p>
          )}
          {activities.map((activity) => (
            <div key={activity.id} style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
              <input 
                type="time" 
                value={activity.start || ""}
                onChange={(e) => updateEvent(activity.id, 'start', e.target.value)} 
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
              <span>to</span>
              <input 
                type="time" 
                value={activity.end || ""}
                onChange={(e) => updateEvent(activity.id, 'end', e.target.value)} 
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
              <input 
                type="text" 
                value={activity.label || ""}
                placeholder="Activity" 
                onChange={(e) => updateEvent(activity.id, 'label', e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', flexGrow: 1 }}
              />
              {/* The Remove Button */}
              <button 
                onClick={() => removeEvent(activity.id)}
                style={{
                  background: '#fee2e2',
                  color: '#ef4444',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                title="Remove activity"
              >
                ✕
              </button>
            </div>
          ))}
          
          <button 
            onClick={addEvent} 
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '2px dashed #2C2C2C', 
              color: '#2C2C2C', 
              background: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            + Add Activity
          </button>
        </div>

        {/* Footer */}
        <button 
          onClick={handleFinish}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#2C2C2C',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Confirm Schedule
        </button>
      </div>
    </div>
  );
};

export default AvailabilityTracker;