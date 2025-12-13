import React from 'react';

const DebugInfo = ({ recommendations, error, loading }) => {
  return (
    <div className="debug-info mt-4 p-3 bg-secondary text-white rounded">
      <h5>Debug Information</h5>
      <div className="mb-2">
        <strong>Status:</strong> {loading ? 'Loading...' : 'Ready'}
      </div>
      <div className="mb-2">
        <strong>Error:</strong> {error || 'None'}
      </div>
      <div>
        <strong>Recommendations:</strong> {recommendations.length} found
      </div>
      {recommendations.length > 0 && (
        <pre className="mt-2">
          {JSON.stringify(recommendations[0], null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DebugInfo;