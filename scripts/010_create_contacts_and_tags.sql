-- Create tags table for managing tags across the system
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, name)
);

-- Create contacts table for CRM
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create custom_fields table for flexible contact fields
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'email', 'phone', 'url', 'textarea')),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, name)
);

-- Create contact_custom_values table to store custom field values
CREATE TABLE IF NOT EXISTS public.contact_custom_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  custom_field_id UUID NOT NULL REFERENCES public.custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(contact_id, custom_field_id)
);

-- Create contact_tags junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.contact_tags (
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (contact_id, tag_id)
);

-- Create card_tags junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.card_tags (
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (card_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON public.contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON public.contacts(created_by);
CREATE INDEX IF NOT EXISTS idx_tags_client_id ON public.tags(client_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_client_id ON public.custom_fields(client_id);
CREATE INDEX IF NOT EXISTS idx_contact_custom_values_contact_id ON public.contact_custom_values(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_contact_id ON public.contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_tag_id ON public.contact_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_card_tags_card_id ON public.card_tags(card_id);
CREATE INDEX IF NOT EXISTS idx_card_tags_tag_id ON public.card_tags(tag_id);

-- Insert default tags for existing clients
INSERT INTO public.tags (name, color, client_id)
SELECT 'Novo', '#a855f7', id FROM public.clients
ON CONFLICT (client_id, name) DO NOTHING;

INSERT INTO public.tags (name, color, client_id)
SELECT 'Contatado', '#f97316', id FROM public.clients
ON CONFLICT (client_id, name) DO NOTHING;

INSERT INTO public.tags (name, color, client_id)
SELECT 'Qualificado', '#06b6d4', id FROM public.clients
ON CONFLICT (client_id, name) DO NOTHING;

INSERT INTO public.tags (name, color, client_id)
SELECT 'Convertido', '#22c55e', id FROM public.clients
ON CONFLICT (client_id, name) DO NOTHING;

INSERT INTO public.tags (name, color, client_id)
SELECT 'Perdido', '#ef4444', id FROM public.clients
ON CONFLICT (client_id, name) DO NOTHING;
