/*
# VaaniShield AI - Complete Database Schema

Creates the full schema for the VaaniShield AI digital safety platform.

## Tables Created:
1. `profiles` - User profile data (linked to auth.users)
2. `analysis_history` - All analysis records with type, language, result, confidence
3. `text_analyses` - Text-specific analysis metadata
4. `image_analyses` - Image-specific analysis metadata
5. `audio_analyses` - Audio-specific analysis metadata
6. `user_privacy_settings` - Per-user privacy preferences
7. `saved_results` - Bookmarked analysis results
8. `feedback` - User feedback on analyses

## Security:
- RLS enabled on ALL tables
- Owner-scoped CRUD policies (auth.uid() = user_id) on all tables
- Users can only access their own data
- user_id columns default to auth.uid() for safe inserts

## Indexes:
- user_id on all user-scoped tables
- created_at for time-based queries
- analysis_type and language for filtering
*/

-- 1. profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_provider_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  preferred_language text NOT NULL DEFAULT 'en',
  theme text NOT NULL DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = auth_provider_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = auth_provider_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = auth_provider_id) WITH CHECK (auth.uid() = auth_provider_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = auth_provider_id);

-- 2. analysis_history table
CREATE TABLE IF NOT EXISTS analysis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type text NOT NULL CHECK (analysis_type IN ('text','image','audio','camera','recording','link')),
  language text NOT NULL DEFAULT 'en',
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','failed','pending')),
  result text NOT NULL DEFAULT '',
  confidence integer NOT NULL DEFAULT 0,
  explanation text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_history" ON analysis_history;
CREATE POLICY "select_own_history" ON analysis_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_history" ON analysis_history;
CREATE POLICY "insert_own_history" ON analysis_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_history" ON analysis_history;
CREATE POLICY "update_own_history" ON analysis_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_history" ON analysis_history;
CREATE POLICY "delete_own_history" ON analysis_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at ON analysis_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_history_type ON analysis_history(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_history_language ON analysis_history(language);

-- 3. text_analyses table
CREATE TABLE IF NOT EXISTS text_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES analysis_history(id) ON DELETE CASCADE,
  text_hash text NOT NULL DEFAULT '',
  text_length integer NOT NULL DEFAULT 0,
  language text NOT NULL DEFAULT 'en',
  result text NOT NULL DEFAULT '',
  confidence integer NOT NULL DEFAULT 0,
  signals jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE text_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_text" ON text_analyses;
CREATE POLICY "select_own_text" ON text_analyses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_history WHERE analysis_history.id = text_analyses.analysis_id AND analysis_history.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_text" ON text_analyses;
CREATE POLICY "insert_own_text" ON text_analyses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM analysis_history WHERE analysis_history.id = text_analyses.analysis_id AND analysis_history.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_text" ON text_analyses;
CREATE POLICY "delete_own_text" ON text_analyses FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_history WHERE analysis_history.id = text_analyses.analysis_id AND analysis_history.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_text_analyses_analysis_id ON text_analyses(analysis_id);

-- 4. image_analyses table
CREATE TABLE IF NOT EXISTS image_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES analysis_history(id) ON DELETE CASCADE,
  file_reference text DEFAULT '',
  file_hash text NOT NULL DEFAULT '',
  mime_type text NOT NULL DEFAULT '',
  file_size bigint NOT NULL DEFAULT 0,
  result text NOT NULL DEFAULT '',
  confidence integer NOT NULL DEFAULT 0,
  signals jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE image_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_image" ON image_analyses;
CREATE POLICY "select_own_image" ON image_analyses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_history WHERE analysis_history.id = image_analyses.analysis_id AND analysis_history.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_image" ON image_analyses;
CREATE POLICY "insert_own_image" ON image_analyses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM analysis_history WHERE analysis_history.id = image_analyses.analysis_id AND analysis_history.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_image" ON image_analyses;
CREATE POLICY "delete_own_image" ON image_analyses FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_history WHERE analysis_history.id = image_analyses.analysis_id AND analysis_history.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_image_analyses_analysis_id ON image_analyses(analysis_id);

-- 5. audio_analyses table
CREATE TABLE IF NOT EXISTS audio_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES analysis_history(id) ON DELETE CASCADE,
  file_reference text DEFAULT '',
  file_hash text NOT NULL DEFAULT '',
  duration real NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT '',
  file_size bigint NOT NULL DEFAULT 0,
  result text NOT NULL DEFAULT '',
  confidence integer NOT NULL DEFAULT 0,
  signals jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audio_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_audio" ON audio_analyses;
CREATE POLICY "select_own_audio" ON audio_analyses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_history WHERE analysis_history.id = audio_analyses.analysis_id AND analysis_history.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_audio" ON audio_analyses;
CREATE POLICY "insert_own_audio" ON audio_analyses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM analysis_history WHERE analysis_history.id = audio_analyses.analysis_id AND analysis_history.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_audio" ON audio_analyses;
CREATE POLICY "delete_own_audio" ON audio_analyses FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM analysis_history WHERE analysis_history.id = audio_analyses.analysis_id AND analysis_history.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_audio_analyses_analysis_id ON audio_analyses(analysis_id);

-- 6. user_privacy_settings table
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  save_history boolean NOT NULL DEFAULT true,
  save_uploaded_files boolean NOT NULL DEFAULT false,
  analytics_enabled boolean NOT NULL DEFAULT false,
  personalization_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_privacy" ON user_privacy_settings;
CREATE POLICY "select_own_privacy" ON user_privacy_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_privacy" ON user_privacy_settings;
CREATE POLICY "insert_own_privacy" ON user_privacy_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_privacy" ON user_privacy_settings;
CREATE POLICY "update_own_privacy" ON user_privacy_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_privacy" ON user_privacy_settings;
CREATE POLICY "delete_own_privacy" ON user_privacy_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON user_privacy_settings(user_id);

-- 7. saved_results table
CREATE TABLE IF NOT EXISTS saved_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id uuid NOT NULL REFERENCES analysis_history(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved" ON saved_results;
CREATE POLICY "select_own_saved" ON saved_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved" ON saved_results;
CREATE POLICY "insert_own_saved" ON saved_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved" ON saved_results;
CREATE POLICY "delete_own_saved" ON saved_results FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_results_user_id ON saved_results(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_results_analysis_id ON saved_results(analysis_id);

-- 8. feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES analysis_history(id) ON DELETE SET NULL,
  feedback_type text NOT NULL DEFAULT 'general' CHECK (feedback_type IN ('general','accurate','inaccurate','helpful','unhelpful','report')),
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_feedback" ON feedback;
CREATE POLICY "select_own_feedback" ON feedback FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_feedback" ON feedback;
CREATE POLICY "insert_own_feedback" ON feedback FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_feedback" ON feedback;
CREATE POLICY "delete_own_feedback" ON feedback FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_privacy_updated_at ON user_privacy_settings;
CREATE TRIGGER trigger_privacy_updated_at BEFORE UPDATE ON user_privacy_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (auth_provider_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  INSERT INTO user_privacy_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();