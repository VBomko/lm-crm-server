const { supabase } = require('../utils');

const TABLE_NAME = 'Events';

// Create a new event
const createEvent = async (req, res, next) => {
  const { Event_Type, Scheduled_Time, Status } = req.body;

  if (!Event_Type || !Scheduled_Time || !Status) {
    return res.status(400).json({ error: 'Event_Type, Scheduled_Time, and Status are required' });
  }

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([req.body])
      .select();

    if (error) {
      console.error('Supabase error creating event:', error);
      return next(error);
    }

    if (!data || data.length === 0) {
      return res.status(500).json({ error: 'Failed to create event, no data returned' });
    }
    res.status(201).json(data[0]);
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