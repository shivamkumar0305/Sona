-- Create music_profiles table in Supabase
CREATE TABLE IF NOT EXISTS music_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Numerical taste metrics (0 - 100 scale)
    energy INT NOT NULL DEFAULT 50 CHECK (energy BETWEEN 0 AND 100),
    darkness INT NOT NULL DEFAULT 50 CHECK (darkness BETWEEN 0 AND 100),
    acousticness INT NOT NULL DEFAULT 50 CHECK (acousticness BETWEEN 0 AND 100),
    electronic INT NOT NULL DEFAULT 50 CHECK (electronic BETWEEN 0 AND 100),
    experimental INT NOT NULL DEFAULT 50 CHECK (experimental BETWEEN 0 AND 100),
    mainstream INT NOT NULL DEFAULT 50 CHECK (mainstream BETWEEN 0 AND 100),
    discovery INT NOT NULL DEFAULT 50 CHECK (discovery BETWEEN 0 AND 100),
    replay_rate INT NOT NULL DEFAULT 50 CHECK (replay_rate BETWEEN 0 AND 100),
    album_listener INT NOT NULL DEFAULT 50 CHECK (album_listener BETWEEN 0 AND 100),
    single_listener INT NOT NULL DEFAULT 50 CHECK (single_listener BETWEEN 0 AND 100),
    instrumental INT NOT NULL DEFAULT 50 CHECK (instrumental BETWEEN 0 AND 100),
    lyrical INT NOT NULL DEFAULT 50 CHECK (lyrical BETWEEN 0 AND 100),
    danceability INT NOT NULL DEFAULT 50 CHECK (danceability BETWEEN 0 AND 100),
    melancholy INT NOT NULL DEFAULT 50 CHECK (melancholy BETWEEN 0 AND 100),
    atmospheric INT NOT NULL DEFAULT 50 CHECK (atmospheric BETWEEN 0 AND 100),
    complexity INT NOT NULL DEFAULT 50 CHECK (complexity BETWEEN 0 AND 100),
    tempo_preference INT NOT NULL DEFAULT 50 CHECK (tempo_preference BETWEEN 0 AND 100)
);

-- Enable Row Level Security (RLS)
ALTER TABLE music_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies to secure user profiles
CREATE POLICY "Users can view their own music profile"
    ON music_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert or update their own music profile"
    ON music_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
