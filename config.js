/**
 * Configuration for Supabase Database Connection
 * 
 * IMPORTANT: Before deploying, replace the placeholder values below with your actual Supabase credentials.
 * 
 * To set up Supabase:
 * 1. Go to https://supabase.com and create a free account
 * 2. Create a new project
 * 3. Go to Settings > API to find your URL and anon key
 * 4. Create the experiment_data table using the SQL below in the SQL Editor
 * 
 * SQL to create table:
 * 
 * CREATE TABLE experiment_data (
 *   id SERIAL PRIMARY KEY,
 *   participant_id TEXT NOT NULL,
 *   group_type TEXT NOT NULL,
 *   round_number INTEGER,
 *   chosen_option TEXT,
 *   ai_recommendation TEXT,
 *   follow_ai BOOLEAN,
 *   risk_level FLOAT,
 *   decision_time FLOAT,
 *   extreme_event BOOLEAN,
 *   q1_trust INTEGER,
 *   q2_safer INTEGER,
 *   q3_professional INTEGER,
 *   q4_responsibility INTEGER,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
 * );
 * 
 * -- Enable Row Level Security (optional but recommended)
 * ALTER TABLE experiment_data ENABLE ROW LEVEL SECURITY;
 * 
 * -- Create policy to allow inserts from anonymous users
 * CREATE POLICY "Allow anonymous inserts" ON experiment_data
 *   FOR INSERT WITH CHECK (true);
 * 
 * -- Create policy to allow reads (for admin export)
 * CREATE POLICY "Allow reads" ON experiment_data
 *   FOR SELECT USING (true);
 */

const CONFIG = {
    // Supabase Configuration
    // Replace these with your actual Supabase credentials
    SUPABASE_URL: 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
    
    // Experiment Settings
    TOTAL_ROUNDS: 5,
    EXTREME_RISK_THRESHOLD: 10, // Risk percentage above which extreme event triggers
    EXTREME_RISK_ROUND: 5, // Round in which extreme risk can trigger
    
    // Admin access key (press this key combination to open admin panel)
    ADMIN_KEY_COMBO: 'ctrl+shift+a',
    
    // Local Storage Key for preventing duplicate submissions
    STORAGE_KEY: 'experiment_completed',
    
    // Use local storage fallback if Supabase is not configured
    USE_LOCAL_STORAGE_FALLBACK: true
};

// Check if Supabase is configured
CONFIG.IS_SUPABASE_CONFIGURED = CONFIG.SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
                                  CONFIG.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
