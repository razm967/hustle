-- Initial database schema for Hustle job platform

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('employer', 'employee')),
    full_name TEXT,
    birth_date DATE,
    phone TEXT,
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    bio TEXT,
    availability TEXT,
    company_name TEXT,
    company_website TEXT,
    company_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    pay TEXT NOT NULL,
    duration TEXT,
    available_dates TEXT,
    tags TEXT[],
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress', 'completed')),
    employer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, employee_id) -- Prevent duplicate applications
);

-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, employee_id) -- Prevent duplicate saves
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_employee_id ON job_applications(employee_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_employee_id ON saved_jobs(employee_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for jobs
CREATE POLICY "Anyone can view open jobs" ON jobs FOR SELECT USING (status = 'open' OR employer_id = auth.uid());
CREATE POLICY "Employers can create jobs" ON jobs FOR INSERT WITH CHECK (employer_id = auth.uid());
CREATE POLICY "Employers can update own jobs" ON jobs FOR UPDATE USING (employer_id = auth.uid());
CREATE POLICY "Employers can delete own jobs" ON jobs FOR DELETE USING (employer_id = auth.uid());

-- RLS Policies for job_applications
CREATE POLICY "Employees can view own applications" ON job_applications FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Employers can view applications for their jobs" ON job_applications FOR SELECT USING (
    job_id IN (SELECT id FROM jobs WHERE employer_id = auth.uid())
);
CREATE POLICY "Employees can create applications" ON job_applications FOR INSERT WITH CHECK (employee_id = auth.uid());
CREATE POLICY "Employers can update applications for their jobs" ON job_applications FOR UPDATE USING (
    job_id IN (SELECT id FROM jobs WHERE employer_id = auth.uid())
);

-- RLS Policies for saved_jobs
CREATE POLICY "Employees can view own saved jobs" ON saved_jobs FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Employees can save jobs" ON saved_jobs FOR INSERT WITH CHECK (employee_id = auth.uid());
CREATE POLICY "Employees can unsave jobs" ON saved_jobs FOR DELETE USING (employee_id = auth.uid());

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 