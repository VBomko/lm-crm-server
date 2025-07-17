const { supabase, supabaseCrmSettings } = require('../utils');

const TABLE_NAME = 'Events';
const LEADS_TABLE_NAME = 'Leads';

// Helper function to validate Lead_Data
const validateLeadData = (leadData) => {
  if (!leadData) return null;
  
  const { First_Name, Last_Name, Email, Phone } = leadData;
  
  if (!First_Name || !Last_Name || !Email || !Phone) {
    throw new Error('Lead_Data requires First_Name, Last_Name, Email, and Phone fields');
  }
  
  return leadData;
};

// Helper function to search for existing lead by email or phone
const findExistingLead = async (email, phone) => {
  try {
    const { data, error } = await supabase
      .from(LEADS_TABLE_NAME)
      .select('*')
      .or(`Email.eq.${email},Phone.eq.${phone}`)
      .limit(1);

    if (error) {
      console.error('Error searching for existing lead:', error);
      throw error;
    }
    console.log('data', data);
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Error in findExistingLead:', err);
    throw err;
  }
};

// Helper function to update existing lead
const updateLead = async (leadId, leadData) => {
  try {
    const updateData = {
      ...leadData,
      Updated_At: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(LEADS_TABLE_NAME)
      .update(updateData)
      .eq('Id', leadId)
      .select();

    if (error) {
      console.error('Error updating lead:', error);
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Error in updateLead:', err);
    throw err;
  }
};

// Helper function to create new lead
const createLead = async (leadData) => {
  try {
    const insertData = {
      ...leadData,
      Created_At: new Date().toISOString(),
      Updated_At: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(LEADS_TABLE_NAME)
      .insert([insertData])
      .select();

    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Error in createLead:', err);
    throw err;
  }
};

// Helper function to process Lead_Data and return lead ID
const processLeadData = async (leadData) => {
  if (!leadData) return null;

  try {
    // Validate Lead_Data
    const validatedLeadData = validateLeadData(leadData);
    
    // If Lead_Data has an Id, use it directly
    // if (validatedLeadData.Id) {
    //   return validatedLeadData;
    // }

    // Search for existing lead by email or phone
    const existingLead = await findExistingLead(validatedLeadData.Email, validatedLeadData.Phone);
    
    if (existingLead) {
      // Update existing lead with new data
      const updatedLead = await updateLead(existingLead.Id, validatedLeadData);
      return updatedLead;
    } else {
      // Create new lead
      const newLead = await createLead(validatedLeadData);
      return newLead;
    }
  } catch (err) {
    console.error('Error processing Lead_Data:', err);
    throw err;
  }
};

// Helper function to fetch Record_Type for Events
const getRecordTypeForEvent = async () => {
  try {
    const { data, error } = await supabaseCrmSettings
      .from('Record_Types')
      .select('*')
      .eq('Table', 'Events')
      .eq('Name', 'Sales Appointment')
      .single();

    if (error) {
      console.error('Error fetching Record_Type:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error in getRecordTypeForEvent:', err);
    throw err;
  }
};

// Create a new event
const createEvent = async (req, res, next) => {
  const { Event_Type, Scheduled_Time, Status, Lead_Data } = req.body;

  if (!Event_Type || !Scheduled_Time || !Status) {
    return res.status(400).json({ error: 'Event_Type, Scheduled_Time, and Status are required' });
  }

  try {
    // Fetch Record_Type for the event
    let recordType = null;
    try {
      recordType = await getRecordTypeForEvent();
    } catch (recordTypeError) {
      console.warn(`Record_Type not found for Event_Type: ${Event_Type}`, recordTypeError.message);
      // Continue without Record_Type if not found
    }

    // Process Lead_Data if provided
    let lead = null;
    if (Lead_Data) {
      try {
        lead = await processLeadData(Lead_Data);
      } catch (leadError) {
        return res.status(400).json({ error: `Lead processing error: ${leadError.message}` });
      }
    }

    // Prepare event data
    console.log('lead', lead);
    const eventData = {
      ...req.body,
      Lead: lead?.Id || req.body.Lead_Data?.Id,
      Customer: lead?.Customer,
      Record_Type: recordType?.Id // Add Record_Type ID if found
    };

    // Remove Lead_Data from event data as it's not part of the Events table
    delete eventData.Lead_Data;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([eventData])
      .select();

    if (error) {
      console.error('Supabase error creating event:', error);
      return next(error);
    }

    if (!data || data.length === 0) {
      return res.status(500).json({ error: 'Failed to create event, no data returned' });
    }

    // Return the created event with lead and record type information if applicable
    const response = {
      ...data[0],
      Lead_Processed: lead?.Id ? true : false,
      // Lead: lead?.Id,
      // Customer: lead?.Customer, // Ensure Customer is set from the processed lead
      Record_Type_Processed: recordType ? true : false,
      // Record_Type: recordType?.Id
    };

    res.status(201).json(response);
  } catch (err) {
    console.error('Error in createEvent controller:', err);
    next(err);
  }
};

// Get all events
const getAllEvents = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) {
      console.error('Supabase error fetching events:', error);
      return next(error);
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Error in getAllEvents controller:', err);
    next(err);
  }
};

// Get a single event by ID
const getEventById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('Id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PostgREST error for "Searched for one row, but found 0"
        return res.status(404).json({ error: 'Event not found' });
      }
      console.error('Supabase error fetching event by ID:', error);
      return next(error);
    }

    if (!data) {
        return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Error in getEventById controller:', err);
    next(err);
  }
};

// Update an event by ID
const updateEvent = async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No update data provided' });
  }

  // Ensure `updated_at` is set
  updates.Updated_At = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('Id', id)
      .select();

    if (error) {
      console.error('Supabase error updating event:', error);
      return next(error);
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Event not found or no changes made' });
    }
    res.status(200).json(data[0]);
  } catch (err) {
    console.error('Error in updateEvent controller:', err);
    next(err);
  }
};

// Delete an event by ID
const deleteEvent = async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('Id', id)
      .select(); // Select to confirm what was deleted (or if it existed)

    if (error) {
      console.error('Supabase error deleting event:', error);
      return next(error);
    }

    // Supabase delete returns the deleted records. If data is empty, it means no record matched the ID.
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully', deletedEvent: data[0] });
  } catch (err) {
    console.error('Error in deleteEvent controller:', err);
    next(err);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};