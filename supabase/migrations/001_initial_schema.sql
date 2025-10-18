-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mindmaps table
CREATE TABLE IF NOT EXISTS mindmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT '새 마인드맵',
    description TEXT,
    viewport JSONB DEFAULT '{"x": 0, "y": 0, "zoom": 1}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nodes table
CREATE TABLE IF NOT EXISTS nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mindmap_id UUID REFERENCES mindmaps(id) ON DELETE CASCADE NOT NULL,
    react_flow_id VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'studyNode',
    title VARCHAR(255) NOT NULL DEFAULT '새 노드',
    content TEXT DEFAULT '',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
    style JSONB DEFAULT '{}',
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mindmap_id, react_flow_id)
);

-- Create edges table
CREATE TABLE IF NOT EXISTS edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mindmap_id UUID REFERENCES mindmaps(id) ON DELETE CASCADE NOT NULL,
    react_flow_id VARCHAR(255) NOT NULL,
    source_node_id VARCHAR(255) NOT NULL,
    target_node_id VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'default',
    style JSONB DEFAULT '{}',
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mindmap_id, react_flow_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mindmaps_user_id ON mindmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_mindmaps_updated_at ON mindmaps(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_nodes_mindmap_id ON nodes(mindmap_id);
CREATE INDEX IF NOT EXISTS idx_nodes_react_flow_id ON nodes(react_flow_id);
CREATE INDEX IF NOT EXISTS idx_edges_mindmap_id ON edges(mindmap_id);
CREATE INDEX IF NOT EXISTS idx_edges_source_target ON edges(source_node_id, target_node_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for mindmaps
CREATE POLICY "Users can view own mindmaps" ON mindmaps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mindmaps" ON mindmaps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mindmaps" ON mindmaps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mindmaps" ON mindmaps
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for nodes
CREATE POLICY "Users can view own nodes" ON nodes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mindmaps
            WHERE mindmaps.id = nodes.mindmap_id
            AND mindmaps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own nodes" ON nodes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM mindmaps
            WHERE mindmaps.id = nodes.mindmap_id
            AND mindmaps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own nodes" ON nodes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM mindmaps
            WHERE mindmaps.id = nodes.mindmap_id
            AND mindmaps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own nodes" ON nodes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM mindmaps
            WHERE mindmaps.id = nodes.mindmap_id
            AND mindmaps.user_id = auth.uid()
        )
    );

-- RLS Policies for edges
CREATE POLICY "Users can view own edges" ON edges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mindmaps
            WHERE mindmaps.id = edges.mindmap_id
            AND mindmaps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own edges" ON edges
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM mindmaps
            WHERE mindmaps.id = edges.mindmap_id
            AND mindmaps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own edges" ON edges
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM mindmaps
            WHERE mindmaps.id = edges.mindmap_id
            AND mindmaps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own edges" ON edges
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM mindmaps
            WHERE mindmaps.id = edges.mindmap_id
            AND mindmaps.user_id = auth.uid()
        )
    );

-- Functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic updated_at timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mindmaps_updated_at BEFORE UPDATE ON mindmaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_edges_updated_at BEFORE UPDATE ON edges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();