/**
 * Supabase client utility
 *
 * This module initializes and exports Supabase client instances
 * for use throughout the application.
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

// Get Supabase credentials from config
const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.key;

// Initialize Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseCrmSettings = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'crm_settings' }
});

module.exports = {
  supabase,
  supabaseCrmSettings
};