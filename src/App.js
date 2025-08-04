import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

// Initialize Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [userName, setUserName] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Function to fetch equipment details
  const fetchEquipmentDetails = async () => {
    if (!equipmentId.trim()) {
      setError('Please enter an equipment ID');
      return;
    }

    setLoading(true);
    setError('');
    setEquipmentDetails(null);

    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('equipment_id', equipmentId.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Equipment ID not found. Please check the ID and try again.');
        } else {
          setError('Error fetching equipment details. Please try again.');
        }
      } else {
        setEquipmentDetails(data);
        setError('');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Function to submit issue report
  const submitReport = async () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!equipmentDetails) {
      setError('Please fetch equipment details first');
      return;
    }
    if (!issueDescription.trim()) {
      setError('Please describe the issue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('reports')
        .insert([
          {
            user_name: userName.trim(),
            equipment_id: equipmentId.trim(),
            issue_description: issueDescription.trim(),
            status: 'pending'
          }
        ]);

      if (error) {
        setError('Error submitting report. Please try again.');
      } else {
        setMessage('Issue report submitted successfully!');
        // Clear form
        setUserName('');
        setEquipmentId('');
        setEquipmentDetails(null);
        setIssueDescription('');
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear messages when user starts typing
  useEffect(() => {
    if (error || message) {
      const timer = setTimeout(() => {
        setError('');
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, message]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏥 Upper West Regional Hospital</h1>
        <h2>Clinical Engineering - Equipment Issue Reporting</h2>
      </header>

      <main className="App-main">
        {/* User Name Input */}
        <div className="form-section">
          <label htmlFor="userName">Your Name:</label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your full name"
            className="input-field"
          />
        </div>

        {/* Equipment ID Input */}
        <div className="form-section">
          <label htmlFor="equipmentId">Equipment ID:</label>
          <div className="equipment-input-group">
            <input
              id="equipmentId"
              type="text"
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              placeholder="Enter equipment ID (e.g., 50377, 50376, 50142)"
              className="input-field"
            />
            <button 
              onClick={fetchEquipmentDetails}
              disabled={loading}
              className="fetch-button"
            >
              {loading ? 'Searching...' : 'Find Equipment'}
            </button>
          </div>
        </div>

        {/* Equipment Details Display */}
        {equipmentDetails && (
          <div className="equipment-details">
            <h3>Equipment Details:</h3>
            <div className="details-grid">
              <div><strong>Equipment Name:</strong> {equipmentDetails.equipment_name}</div>
              <div><strong>Location:</strong> {equipmentDetails.location}</div>
              <div><strong>Model:</strong> {equipmentDetails.model_name}</div>
              <div><strong>Serial Number:</strong> {equipmentDetails.serial_number}</div>
              <div><strong>Manufacturer:</strong> {equipmentDetails.manufacturer}</div>
              <div><strong>Condition:</strong> {equipmentDetails.condition}</div>
            </div>
          </div>
        )}

        {/* Issue Description */}
        {equipmentDetails && (
          <div className="form-section">
            <label htmlFor="issueDescription">Describe the Issue:</label>
            <textarea
              id="issueDescription"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Please provide detailed information about the problem..."
              rows="5"
              className="textarea-field"
            />
          </div>
        )}

        {/* Submit Button */}
        {equipmentDetails && (
          <button 
            onClick={submitReport}
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Submitting...' : 'Submit Issue Report'}
          </button>
        )}

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {/* Connection Status */}
        <div className="connection-status">
          <small>
            {supabaseUrl ? '🟢 Connected to database' : '🔴 Database connection error'}
          </small>
        </div>
      </main>
    </div>
  );
}

export default App;