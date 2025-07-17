const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data for creating an event with Lead_Data
const testEventWithLeadData = {
  Event_Type: "Sales Appointment",
  Scheduled_Time: "2025-01-20T14:00:00Z",
  End_Time: "2025-01-20T16:00:00Z",
  Status: "Scheduled",
  Name: "Test Appointment with Lead",
  Notes: "Testing Lead_Data functionality",
  Staff: "6d3fb306-6a41-439d-b3be-ba5a4c96c988",
  Lead_Data: {
    First_Name: "John",
    Last_Name: "Doe",
    Email: "john.doe@example.com",
    Phone: "+1234567890",
    Address: "675 S Carondelet St, Los Angeles, CA 90057, USA",
    Notes: "Interested in bathroom renovation",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "bathroom_renovation",
    utm_content: "banner_ad",
    campaign_id: "12345",
    adset_id: "67890",
    ad_id: "11111",
    fbclid: "abc123",
    gclid: "def456",
    fbc: "facebook_cookie_value",
    fcp: "facebook_cookie_value",
    ga: "google_cookie_value",
    wbraid: "wbraid_value",
    gbraid: "gbraid_value",
    extension_id: "ext123",
    adgroup_id: "ag123",
    asset_id: "asset123",
    ad_type: "image",
    network: "facebook",
    rand: "random_value",
    ip_address: "192.168.1.1",
    User_Agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  }
};

// Test data for creating an event without Lead_Data
const testEventWithoutLeadData = {
  Event_Type: "Sales Appointment",
  Scheduled_Time: "2025-01-21T10:00:00Z",
  End_Time: "2025-01-21T12:00:00Z",
  Status: "Scheduled",
  Name: "Test Appointment without Lead",
  Notes: "Testing event creation without Lead_Data",
  Staff: "6d3fb306-6a41-439d-b3be-ba5a4c96c988"
};

async function testCreateEventWithLeadData() {
  try {
    console.log('Testing create event with Lead_Data...');
    const response = await axios.post(`${BASE_URL}/events`, testEventWithLeadData);
    
    console.log('✅ Success! Event created with Lead_Data:');
    console.log('Event ID:', response.data.Id);
    console.log('Lead Processed:', response.data.Lead_Processed);
    console.log('Lead ID:', response.data.Lead);
    console.log('Record Type Processed:', response.data.Record_Type_Processed);
    console.log('Record Type ID:', response.data.Record_Type);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creating event with Lead_Data:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreateEventWithoutLeadData() {
  try {
    console.log('\nTesting create event without Lead_Data...');
    const response = await axios.post(`${BASE_URL}/events`, testEventWithoutLeadData);
    
    console.log('✅ Success! Event created without Lead_Data:');
    console.log('Event ID:', response.data.Id);
    console.log('Lead Processed:', response.data.Lead_Processed);
    console.log('Lead ID:', response.data.Lead);
    console.log('Record Type Processed:', response.data.Record_Type_Processed);
    console.log('Record Type ID:', response.data.Record_Type);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creating event without Lead_Data:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreateEventWithExistingLeadId() {
  try {
    console.log('\nTesting create event with existing Lead ID...');
    
    // First create a lead
    const firstEvent = await testCreateEventWithLeadData();
    const leadId = firstEvent.Lead;
    
    // Now create another event using the same lead ID
    const testEventWithExistingLead = {
      ...testEventWithLeadData,
      Name: "Test Appointment with Existing Lead",
      Scheduled_Time: "2025-01-22T15:00:00Z",
      End_Time: "2025-01-22T17:00:00Z",
      Lead_Data: {
        ...testEventWithLeadData.Lead_Data,
        Id: leadId,
        Notes: "Updated notes for existing lead"
      }
    };
    
    const response = await axios.post(`${BASE_URL}/events`, testEventWithExistingLead);
    
    console.log('✅ Success! Event created with existing Lead ID:');
    console.log('Event ID:', response.data.Id);
    console.log('Lead Processed:', response.data.Lead_Processed);
    console.log('Lead ID:', response.data.Lead);
    console.log('Record Type Processed:', response.data.Record_Type_Processed);
    console.log('Record Type ID:', response.data.Record_Type);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creating event with existing Lead ID:', error.response?.data || error.message);
    throw error;
  }
}

async function testInvalidLeadData() {
  try {
    console.log('\nTesting create event with invalid Lead_Data (missing required fields)...');
    
    const invalidEvent = {
      ...testEventWithLeadData,
      Lead_Data: {
        First_Name: "John",
        // Missing Last_Name, Email, and Phone
        Notes: "This should fail validation"
      }
    };
    
    const response = await axios.post(`${BASE_URL}/events`, invalidEvent);
    console.log('❌ This should have failed but succeeded:', response.data);
  } catch (error) {
    console.log('✅ Expected error for invalid Lead_Data:');
    console.log('Error:', error.response?.data?.error || error.message);
  }
}

async function testRecordTypeFunctionality() {
  try {
    console.log('\nTesting Record_Type functionality...');
    
    // Test with different Event_Type values
    const testEventTypes = [
      "New Appointment",
      "Rehash", 
      "Previous Reset",
      "Follow Up",
      "New Virtual Appointment"
    ];
    
    for (const eventType of testEventTypes) {
      const testEvent = {
        ...testEventWithoutLeadData,
        Event_Type: eventType,
        Name: `Test ${eventType}`,
        Scheduled_Time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      };
      
      const response = await axios.post(`${BASE_URL}/events`, testEvent);
      console.log(`✅ ${eventType}: Record Type Processed: ${response.data.Record_Type_Processed}, Record Type ID: ${response.data.Record_Type}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing Record_Type functionality:', error.response?.data || error.message);
  }
}

async function runAllTests() {
  try {
    console.log('🚀 Starting Lead_Data and Record_Type functionality tests...\n');
    
    await testCreateEventWithLeadData();
    await testCreateEventWithoutLeadData();
    await testCreateEventWithExistingLeadId();
    await testInvalidLeadData();
    await testRecordTypeFunctionality();
    
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testCreateEventWithLeadData,
  testCreateEventWithoutLeadData,
  testCreateEventWithExistingLeadId,
  testInvalidLeadData,
  testRecordTypeFunctionality,
  runAllTests
}; 