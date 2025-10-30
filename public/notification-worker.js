// Web Worker for notification polling (NOT throttled by browser in background tabs)
// This worker runs on a separate thread and maintains consistent polling even when tab is hidden

let pollingInterval = null;
let pollingFrequency = 30000; // 30 seconds - consistent polling
let apiUrl = '';
let authToken = '';
let errorCount = 0;
let maxErrors = 5;
let isPolling = false;

// Message handler from main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'start':
      apiUrl = data.apiUrl;
      authToken = data.token;
      startPolling();
      break;
    
    case 'stop':
      stopPolling();
      break;
    
    case 'updateToken':
      authToken = data.token;
      break;
    
    case 'updateFrequency':
      updatePollingFrequency(data.frequency);
      break;
  }
});

/**
 * Start polling for notifications
 */
function startPolling() {
  if (isPolling) {
    self.postMessage({ type: 'info', message: 'Polling already active' });
    return;
  }

  isPolling = true;
  errorCount = 0;

  // Initial check immediately
  checkNotifications();

  // Setup polling interval - NOT THROTTLED in Web Worker!
  pollingInterval = setInterval(() => {
    checkNotifications();
  }, pollingFrequency);

  self.postMessage({ 
    type: 'started', 
    message: `Polling started at ${pollingFrequency / 1000}s intervals` 
  });
}

/**
 * Stop polling
 */
function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  isPolling = false;
  
  self.postMessage({ type: 'stopped', message: 'Polling stopped' });
}

/**
 * Update polling frequency
 */
function updatePollingFrequency(newFrequency) {
  if (pollingFrequency === newFrequency) return;
  
  pollingFrequency = newFrequency;
  
  // Restart polling with new frequency
  if (isPolling) {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    pollingInterval = setInterval(() => {
      checkNotifications();
    }, pollingFrequency);
    
    self.postMessage({ 
      type: 'frequencyUpdated', 
      frequency: pollingFrequency 
    });
  }
}

/**
 * Check for new notifications
 */
async function checkNotifications() {
  if (!apiUrl || !authToken) {
    self.postMessage({ 
      type: 'error', 
      error: 'Missing API URL or auth token' 
    });
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/notifications/unread-count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      
      // Reset error count on success
      errorCount = 0;
      
      // Send unread count back to main thread
      self.postMessage({
        type: 'unreadCount',
        data: result.data.count,
        timestamp: new Date().toISOString()
      });
    } else {
      handleError(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    handleError(error.message);
  }
}

/**
 * Handle polling errors with exponential backoff
 */
function handleError(errorMessage) {
  errorCount++;
  
  self.postMessage({
    type: 'error',
    error: errorMessage,
    errorCount: errorCount,
    maxErrors: maxErrors
  });

  // If too many consecutive errors, slow down polling
  if (errorCount >= maxErrors) {
    const newFrequency = Math.min(pollingFrequency * 2, 300000); // Max 5 minutes
    
    self.postMessage({
      type: 'slowdown',
      message: `Too many errors, slowing polling to ${newFrequency / 1000}s`,
      newFrequency: newFrequency
    });
    
    updatePollingFrequency(newFrequency);
  }
}

/**
 * Handle worker errors
 */
self.addEventListener('error', (event) => {
  self.postMessage({
    type: 'workerError',
    error: event.message,
    filename: event.filename,
    lineno: event.lineno
  });
});

/**
 * Handle unhandled promise rejections
 */
self.addEventListener('unhandledrejection', (event) => {
  self.postMessage({
    type: 'workerError',
    error: 'Unhandled promise rejection: ' + event.reason
  });
});

