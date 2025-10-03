-- Remove the status column from cards table and migrate to tags
-- First, create card_tags entries for existing cards based on their status

-- Get all cards with status and create corresponding tag relationships
DO $$
DECLARE
  card_record RECORD;
  tag_record RECORD;
BEGIN
  FOR card_record IN SELECT id, status, board_id FROM cards WHERE status IS NOT NULL
  LOOP
    -- Get the client_id from the board
    SELECT b.client_id INTO tag_record
    FROM boards b
    WHERE b.id = card_record.board_id;
    
    -- Find or create the corresponding tag
    IF card_record.status = 'new' THEN
      INSERT INTO card_tags (card_id, tag_id)
      SELECT card_record.id, t.id
      FROM tags t
      WHERE t.client_id = tag_record.client_id AND LOWER(t.name) = 'novo'
      ON CONFLICT DO NOTHING;
    ELSIF card_record.status = 'contacted' THEN
      INSERT INTO card_tags (card_id, tag_id)
      SELECT card_record.id, t.id
      FROM tags t
      WHERE t.client_id = tag_record.client_id AND LOWER(t.name) = 'contatado'
      ON CONFLICT DO NOTHING;
    ELSIF card_record.status = 'qualified' THEN
      INSERT INTO card_tags (card_id, tag_id)
      SELECT card_record.id, t.id
      FROM tags t
      WHERE t.client_id = tag_record.client_id AND LOWER(t.name) = 'qualificado'
      ON CONFLICT DO NOTHING;
    ELSIF card_record.status = 'converted' THEN
      INSERT INTO card_tags (card_id, tag_id)
      SELECT card_record.id, t.id
      FROM tags t
      WHERE t.client_id = tag_record.client_id AND LOWER(t.name) = 'convertido'
      ON CONFLICT DO NOTHING;
    ELSIF card_record.status = 'lost' THEN
      INSERT INTO card_tags (card_id, tag_id)
      SELECT card_record.id, t.id
      FROM tags t
      WHERE t.client_id = tag_record.client_id AND LOWER(t.name) = 'perdido'
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Now drop the status column
ALTER TABLE cards DROP COLUMN IF EXISTS status;

-- Add contact_id column to cards to link cards with contacts
ALTER TABLE cards ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_cards_contact_id ON cards(contact_id);
