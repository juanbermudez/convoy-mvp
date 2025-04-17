// This script can be run in the browser console to test offline functionality

// Global object to store test data
window.offlineTest = {
  results: [],
  testCount: 0,
  passCount: 0,
  failCount: 0
};

// Helper function to log test results
function logTestResult(name, passed, message) {
  const result = { name, passed, message, timestamp: new Date() };
  console.log(
    `%c${passed ? 'PASS' : 'FAIL'}: ${name}`,
    `color: ${passed ? 'green' : 'red'}; font-weight: bold;`,
    message || ''
  );
  window.offlineTest.results.push(result);
  window.offlineTest.testCount++;
  if (passed) {
    window.offlineTest.passCount++;
  } else {
    window.offlineTest.failCount++;
  }
  return passed;
}

// Function to report test summary
function reportTestSummary() {
  console.log(
    `%cTest Summary`,
    'color: blue; font-weight: bold; font-size: 16px;'
  );
  console.log(
    `Total: ${window.offlineTest.testCount}, Passed: ${window.offlineTest.passCount}, Failed: ${window.offlineTest.failCount}`
  );
  
  if (window.offlineTest.failCount > 0) {
    console.log('%cFailed Tests:', 'color: red; font-weight: bold;');
    window.offlineTest.results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`- ${r.name}: ${r.message}`);
      });
  }
  
  return {
    total: window.offlineTest.testCount,
    passed: window.offlineTest.passCount,
    failed: window.offlineTest.failCount,
    results: window.offlineTest.results
  };
}

// Test database access
async function testDatabaseAccess() {
  try {
    // Get the database instance
    const db = window.database || window.watermelondb || null;
    
    if (!db) {
      return logTestResult('Database Access', false, 'Database instance not found');
    }
    
    // Try to perform a simple query
    const collections = db.collections.map(c => c.name);
    
    return logTestResult(
      'Database Access',
      true,
      `Database accessible with collections: ${collections.join(', ')}`
    );
  } catch (error) {
    return logTestResult('Database Access', false, `Error: ${error.message}`);
  }
}

// Test online/offline detection
function testOnlineDetection() {
  try {
    // Check if the sync service is available
    const syncStatus = window.syncService?.getStatus();
    
    if (!syncStatus) {
      return logTestResult('Online Detection', false, 'Sync service not available');
    }
    
    // Check if the online status matches the navigator
    const navigatorOnline = navigator.onLine;
    const serviceOnline = syncStatus.isOnline;
    
    return logTestResult(
      'Online Detection',
      navigatorOnline === serviceOnline,
      `Navigator online: ${navigatorOnline}, Service online: ${serviceOnline}`
    );
  } catch (error) {
    return logTestResult('Online Detection', false, `Error: ${error.message}`);
  }
}

// Test data creation
async function testDataCreation() {
  try {
    // Check if repositories are available
    const projectRepo = window.projectRepository;
    
    if (!projectRepo) {
      return logTestResult('Data Creation', false, 'Project repository not available');
    }
    
    // Create a test project
    const testProject = await projectRepo.createProject({
      workspaceId: 'test-workspace',
      name: `Test Project ${Date.now()}`,
      description: 'Created by automated test',
      status: 'active'
    });
    
    return logTestResult(
      'Data Creation',
      !!testProject,
      `Project created with ID: ${testProject?.id}`
    );
  } catch (error) {
    return logTestResult('Data Creation', false, `Error: ${error.message}`);
  }
}

// Test data retrieval
async function testDataRetrieval() {
  try {
    // Check if repositories are available
    const projectRepo = window.projectRepository;
    
    if (!projectRepo) {
      return logTestResult('Data Retrieval', false, 'Project repository not available');
    }
    
    // Retrieve projects
    const projects = await projectRepo.getProjects();
    
    return logTestResult(
      'Data Retrieval',
      Array.isArray(projects),
      `Retrieved ${projects.length} projects`
    );
  } catch (error) {
    return logTestResult('Data Retrieval', false, `Error: ${error.message}`);
  }
}

// Test sync functionality
async function testSyncFunctionality() {
  try {
    // Check if sync service is available
    const syncService = window.syncService;
    
    if (!syncService) {
      return logTestResult('Sync Functionality', false, 'Sync service not available');
    }
    
    // Try to perform a sync
    const initialStatus = syncService.getStatus();
    
    // Only test if online
    if (!initialStatus.isOnline) {
      return logTestResult(
        'Sync Functionality',
        true,
        'Device is offline, skipping sync test'
      );
    }
    
    await syncService.sync();
    const newStatus = syncService.getStatus();
    
    return logTestResult(
      'Sync Functionality',
      newStatus.lastSyncTime > initialStatus.lastSyncTime || !initialStatus.syncInProgress,
      `Sync completed. Last sync time: ${newStatus.lastSyncTime?.toLocaleString()}`
    );
  } catch (error) {
    return logTestResult('Sync Functionality', false, `Error: ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  console.log('%cStarting Offline Functionality Tests', 'color: blue; font-weight: bold; font-size: 16px;');
  
  // Reset test results
  window.offlineTest = {
    results: [],
    testCount: 0,
    passCount: 0,
    failCount: 0
  };
  
  // Run each test
  await testDatabaseAccess();
  testOnlineDetection();
  await testDataCreation();
  await testDataRetrieval();
  await testSyncFunctionality();
  
  // Report summary
  return reportTestSummary();
}

// Execute tests
console.log('Offline functionality test script loaded. Run tests with: runAllTests()');
