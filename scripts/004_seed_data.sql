-- Insert default plans
INSERT INTO public.plans (name, description, price, billing_period, max_boards, max_users, features)
VALUES 
  (
    'Starter',
    'Perfect for small teams getting started',
    29.99,
    'monthly',
    3,
    5,
    '{"custom_stages": true, "analytics": false, "priority_support": false}'::jsonb
  ),
  (
    'Professional',
    'For growing teams with advanced needs',
    79.99,
    'monthly',
    10,
    25,
    '{"custom_stages": true, "analytics": true, "priority_support": false, "api_access": true}'::jsonb
  ),
  (
    'Enterprise',
    'For large organizations with unlimited needs',
    199.99,
    'monthly',
    999,
    999,
    '{"custom_stages": true, "analytics": true, "priority_support": true, "api_access": true, "white_label": true}'::jsonb
  )
ON CONFLICT DO NOTHING;
