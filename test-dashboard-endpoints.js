/**
 * Test script for new dashboard endpoints
 */

const TEST_BASE_URL = 'http://localhost:3001';

async function testDashboardEndpoints() {
  console.log('🧪 Testing Dashboard Endpoints...\n');

  try {
    // Test Live Matches
    console.log('🔴 Testing Live Matches endpoint...');
    const liveResponse = await fetch(`${TEST_BASE_URL}/api/matches/live`);
    const liveData = await liveResponse.json();
    
    console.log('Live Matches Response:', {
      success: liveData.success,
      count: liveData.count,
      dataLength: liveData.data?.length || 0,
      source: liveData.source
    });

    if (liveData.data && liveData.data.length > 0) {
      console.log('Sample live match:', {
        id: liveData.data[0].id,
        homeTeam: liveData.data[0].home_team?.name || liveData.data[0].home_name,
        awayTeam: liveData.data[0].away_team?.name || liveData.data[0].away_name,
        status: liveData.data[0].status,
        score: `${liveData.data[0].homeGoalCount || 0} - ${liveData.data[0].awayGoalCount || 0}`,
        minute: liveData.data[0].minute
      });
    }

    console.log('\n📅 Testing Upcoming Matches endpoint...');
    const upcomingResponse = await fetch(`${TEST_BASE_URL}/api/matches/upcoming`);
    const upcomingData = await upcomingResponse.json();
    
    console.log('Upcoming Matches Response:', {
      success: upcomingData.success,
      totalCount: upcomingData.count,
      todayCount: upcomingData.todayMatches?.length || 0,
      futureCount: upcomingData.futureMatches?.length || 0,
      source: upcomingData.source
    });

    if (upcomingData.todayMatches && upcomingData.todayMatches.length > 0) {
      console.log('Sample today match:', {
        id: upcomingData.todayMatches[0].id,
        homeTeam: upcomingData.todayMatches[0].home_team?.name || upcomingData.todayMatches[0].home_name,
        awayTeam: upcomingData.todayMatches[0].away_team?.name || upcomingData.todayMatches[0].away_name,
        status: upcomingData.todayMatches[0].status,
        dateTime: new Date(upcomingData.todayMatches[0].date_unix * 1000).toLocaleString()
      });
    }

    // Test Dashboard Stats
    console.log('\n📊 Testing Dashboard Stats...');
    const stats = {
      liveCount: liveData.success ? liveData.count || 0 : 0,
      todayCount: upcomingData.success ? upcomingData.todayMatches?.length || 0 : 0,
      upcomingCount: upcomingData.success ? upcomingData.count || 0 : 0,
      systemStatus: (liveResponse.ok && upcomingResponse.ok) ? 'online' : 'offline'
    };

    console.log('Dashboard Stats:', stats);

    console.log('\n✅ Dashboard endpoints test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing dashboard endpoints:', error);
  }
}

// Run the test
testDashboardEndpoints();
