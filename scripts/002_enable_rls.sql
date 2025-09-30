-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Clients policies
CREATE POLICY "Users can view their own client" ON public.clients
  FOR SELECT USING (
    id IN (
      SELECT client_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Super admins can view all clients" ON public.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all clients" ON public.clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Plans policies (read-only for users, full access for super admins)
CREATE POLICY "Anyone can view plans" ON public.plans
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage plans" ON public.plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Boards policies
CREATE POLICY "Users can view boards from their client" ON public.boards
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create boards for their client" ON public.boards
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT client_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update boards from their client" ON public.boards
  FOR UPDATE USING (
    client_id IN (
      SELECT client_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete boards from their client" ON public.boards
  FOR DELETE USING (
    client_id IN (
      SELECT client_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Stages policies
CREATE POLICY "Users can view stages from their client's boards" ON public.stages
  FOR SELECT USING (
    board_id IN (
      SELECT id FROM public.boards WHERE client_id IN (
        SELECT client_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage stages from their client's boards" ON public.stages
  FOR ALL USING (
    board_id IN (
      SELECT id FROM public.boards WHERE client_id IN (
        SELECT client_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Cards policies
CREATE POLICY "Users can view cards from their client's boards" ON public.cards
  FOR SELECT USING (
    board_id IN (
      SELECT id FROM public.boards WHERE client_id IN (
        SELECT client_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage cards from their client's boards" ON public.cards
  FOR ALL USING (
    board_id IN (
      SELECT id FROM public.boards WHERE client_id IN (
        SELECT client_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );
