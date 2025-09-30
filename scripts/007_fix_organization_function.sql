-- Drop and recreate the function with email support
DROP FUNCTION IF EXISTS public.create_user_organization(TEXT);

-- Create a secure function for users to create their own organization/client
-- This function runs with SECURITY DEFINER to bypass RLS, but is safe because:
-- 1. It only allows creating one client per user
-- 2. It automatically associates the user with the new client
-- 3. It assigns a default plan

CREATE OR REPLACE FUNCTION public.create_user_organization(
  organization_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_client_id UUID;
  v_starter_plan_id UUID;
  v_existing_client_id UUID;
BEGIN
  -- Get the current user's ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get the user's email from auth.users
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;
  
  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'User email not found';
  END IF;
  
  -- Check if user already has a client
  SELECT client_id INTO v_existing_client_id
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_existing_client_id IS NOT NULL THEN
    RAISE EXCEPTION 'User already has an organization';
  END IF;
  
  -- Get the Starter plan ID
  SELECT id INTO v_starter_plan_id
  FROM public.plans
  WHERE name = 'Starter'
  LIMIT 1;
  
  IF v_starter_plan_id IS NULL THEN
    RAISE EXCEPTION 'Starter plan not found';
  END IF;
  
  -- Create the new client with email
  INSERT INTO public.clients (name, email, plan_id, status)
  VALUES (organization_name, v_user_email, v_starter_plan_id, 'active')
  RETURNING id INTO v_client_id;
  
  -- Update the user's profile with the new client_id
  UPDATE public.profiles
  SET client_id = v_client_id
  WHERE id = v_user_id;
  
  RETURN v_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_organization(TEXT) TO authenticated;
