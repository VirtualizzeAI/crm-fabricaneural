-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own client" ON public.clients;
DROP POLICY IF EXISTS "Super admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Super admins can manage all clients" ON public.clients;
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
DROP POLICY IF EXISTS "Super admins can manage plans" ON public.plans;
DROP POLICY IF EXISTS "Users can view boards from their client" ON public.boards;
DROP POLICY IF EXISTS "Users can create boards for their client" ON public.boards;
DROP POLICY IF EXISTS "Users can update boards from their client" ON public.boards;
DROP POLICY IF EXISTS "Users can delete boards from their client" ON public.boards;
DROP POLICY IF EXISTS "Users can view stages from their client's boards" ON public.stages;
DROP POLICY IF EXISTS "Users can manage stages from their client's boards" ON public.stages;
DROP POLICY IF EXISTS "Users can view cards from their client's boards" ON public.cards;
DROP POLICY IF EXISTS "Users can manage cards from their client's boards" ON public.cards;

-- Create a security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a security definer function to get user's client_id
CREATE OR REPLACE FUNCTION public.get_user_client_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT client_id FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies (simplified to avoid recursion)
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role has full access to profiles" ON public.profiles
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Clients policies
CREATE POLICY "Users can view their own client" ON public.clients
  FOR SELECT USING (id = get_user_client_id() OR is_super_admin());

CREATE POLICY "Super admins can manage all clients" ON public.clients
  FOR ALL USING (is_super_admin());

-- Plans policies
CREATE POLICY "Anyone authenticated can view plans" ON public.plans
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage plans" ON public.plans
  FOR ALL USING (is_super_admin());

-- Boards policies
CREATE POLICY "Users can view boards from their client" ON public.boards
  FOR SELECT USING (client_id = get_user_client_id() OR is_super_admin());

CREATE POLICY "Users can create boards for their client" ON public.boards
  FOR INSERT WITH CHECK (client_id = get_user_client_id() OR is_super_admin());

CREATE POLICY "Users can update boards from their client" ON public.boards
  FOR UPDATE USING (client_id = get_user_client_id() OR is_super_admin());

CREATE POLICY "Users can delete boards from their client" ON public.boards
  FOR DELETE USING (client_id = get_user_client_id() OR is_super_admin());

-- Stages policies
CREATE POLICY "Users can view stages from their client's boards" ON public.stages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = stages.board_id 
      AND (boards.client_id = get_user_client_id() OR is_super_admin())
    )
  );

CREATE POLICY "Users can manage stages from their client's boards" ON public.stages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = stages.board_id 
      AND (boards.client_id = get_user_client_id() OR is_super_admin())
    )
  );

-- Cards policies
CREATE POLICY "Users can view cards from their client's boards" ON public.cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = cards.board_id 
      AND (boards.client_id = get_user_client_id() OR is_super_admin())
    )
  );

CREATE POLICY "Users can manage cards from their client's boards" ON public.cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = cards.board_id 
      AND (boards.client_id = get_user_client_id() OR is_super_admin())
    )
  );
