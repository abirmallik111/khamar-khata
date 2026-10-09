-- ====================================================================
-- KHAMAR KHATA - COW SECTION SCHEMA EXTENSION
-- ====================================================================

-- 1. Custom Cow Status Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cow_status') THEN
        CREATE TYPE cow_status AS ENUM ('active', 'sold', 'sick', 'dead', 'archived');
    END IF;
END $$;

-- 2. Cows Inventory Table
CREATE TABLE IF NOT EXISTS cows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name_or_tag TEXT NOT NULL,
    breed TEXT,
    gender TEXT,
    purchase_price NUMERIC NOT NULL DEFAULT 0,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status cow_status NOT NULL DEFAULT 'active',
    image_url TEXT,
    source TEXT DEFAULT 'purchased',
    mother_id UUID REFERENCES cows(id) ON DELETE SET NULL,
    father_id UUID REFERENCES cows(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Expense-Cow Allocation Mapping Table
CREATE TABLE IF NOT EXISTS expense_cow_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    cow_id UUID NOT NULL REFERENCES cows(id) ON DELETE CASCADE
);

-- 4. Cow Health Records
CREATE TABLE IF NOT EXISTS cow_health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cow_id UUID NOT NULL REFERENCES cows(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    name TEXT,
    notes TEXT,
    next_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Cow Notes Table
CREATE TABLE IF NOT EXISTS cow_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cow_id UUID NOT NULL REFERENCES cows(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    note_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Cow Images Gallery Table
CREATE TABLE IF NOT EXISTS cow_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    cow_id UUID NOT NULL REFERENCES cows(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Modify Sales Table to support either goat_id or cow_id
ALTER TABLE sales ALTER COLUMN goat_id DROP NOT NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS cow_id UUID REFERENCES cows(id) ON DELETE CASCADE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'sales_cow_id_key'
    ) THEN
        ALTER TABLE sales ADD CONSTRAINT sales_cow_id_key UNIQUE (cow_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_sales_single_animal'
    ) THEN
        ALTER TABLE sales ADD CONSTRAINT chk_sales_single_animal CHECK (
            (goat_id IS NOT NULL AND cow_id IS NULL) OR 
            (goat_id IS NULL AND cow_id IS NOT NULL)
        );
    END IF;
END $$;

-- 8. Modify Owner Contributions Table to support cow_id
ALTER TABLE owner_contributions ADD COLUMN IF NOT EXISTS cow_id UUID REFERENCES cows(id) ON DELETE CASCADE;

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cows_user_status ON cows(user_id, status);
CREATE INDEX IF NOT EXISTS idx_expense_cow_map_cow ON expense_cow_map(cow_id);
CREATE INDEX IF NOT EXISTS idx_expense_cow_map_expense ON expense_cow_map(expense_id);
CREATE INDEX IF NOT EXISTS idx_sales_cow ON sales(cow_id);
CREATE INDEX IF NOT EXISTS idx_owner_contributions_cow ON owner_contributions(cow_id);

-- 10. Stored Procedures / RPC Functions

-- 10.1 Add Cow with Contributions
CREATE OR REPLACE FUNCTION add_cow_with_contributions(
    p_user_id UUID,
    p_name_or_tag TEXT,
    p_breed TEXT,
    p_gender TEXT,
    p_purchase_price NUMERIC,
    p_purchase_date DATE,
    p_source TEXT,
    p_image_url TEXT,
    p_owner_contributions JSONB,
    p_mother_id UUID DEFAULT NULL,
    p_father_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_cow_id UUID;
    v_contrib RECORD;
BEGIN
    INSERT INTO cows (
        user_id, name_or_tag, breed, gender, purchase_price, purchase_date, source, image_url, status, mother_id, father_id
    ) VALUES (
        p_user_id, p_name_or_tag, p_breed, p_gender, p_purchase_price, p_purchase_date, p_source, p_image_url, 'active', p_mother_id, p_father_id
    ) RETURNING id INTO v_cow_id;

    IF p_owner_contributions IS NOT NULL AND jsonb_array_length(p_owner_contributions) > 0 THEN
        FOR v_contrib IN SELECT * FROM jsonb_to_recordset(p_owner_contributions) AS x(owner_id UUID, amount NUMERIC) LOOP
            INSERT INTO owner_contributions (user_id, owner_id, cow_id, amount)
            VALUES (p_user_id, v_contrib.owner_id, v_cow_id, v_contrib.amount);
        END LOOP;
    END IF;

    RETURN v_cow_id;
END;
$$ LANGUAGE plpgsql;

-- 10.2 Update Cow with Contributions
CREATE OR REPLACE FUNCTION update_cow_with_contributions(
    p_cow_id UUID,
    p_user_id UUID,
    p_name_or_tag TEXT,
    p_breed TEXT,
    p_gender TEXT,
    p_purchase_price NUMERIC,
    p_purchase_date DATE,
    p_source TEXT,
    p_status TEXT,
    p_image_url TEXT,
    p_owner_contributions JSONB,
    p_mother_id UUID DEFAULT NULL,
    p_father_id UUID DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_contrib RECORD;
BEGIN
    UPDATE cows SET
        name_or_tag = p_name_or_tag,
        breed = p_breed,
        gender = p_gender,
        purchase_price = p_purchase_price,
        purchase_date = p_purchase_date,
        source = p_source,
        status = p_status::cow_status,
        image_url = p_image_url,
        mother_id = p_mother_id,
        father_id = p_father_id,
        updated_at = NOW()
    WHERE id = p_cow_id AND user_id = p_user_id;

    DELETE FROM owner_contributions WHERE cow_id = p_cow_id AND user_id = p_user_id;

    IF p_owner_contributions IS NOT NULL AND jsonb_array_length(p_owner_contributions) > 0 THEN
        FOR v_contrib IN SELECT * FROM jsonb_to_recordset(p_owner_contributions) AS x(owner_id UUID, amount NUMERIC) LOOP
            INSERT INTO owner_contributions (user_id, owner_id, cow_id, amount)
            VALUES (p_user_id, v_contrib.owner_id, p_cow_id, v_contrib.amount);
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 10.3 Add Cow Sale & Update Cow Status
CREATE OR REPLACE FUNCTION add_cow_sale_and_update_cow(
    p_user_id UUID,
    p_cow_id UUID,
    p_sale_price NUMERIC,
    p_sale_date DATE,
    p_note TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO sales (user_id, cow_id, sale_price, sale_date, note)
    VALUES (p_user_id, p_cow_id, p_sale_price, p_sale_date, p_note);

    UPDATE cows SET status = 'sold' WHERE id = p_cow_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 10.4 Delete Sale & Revert Animal (Goat or Cow) Status
CREATE OR REPLACE FUNCTION delete_sale_and_revert_goat(
    p_sale_id UUID,
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_goat_id UUID;
    v_cow_id UUID;
BEGIN
    SELECT goat_id, cow_id INTO v_goat_id, v_cow_id FROM sales WHERE id = p_sale_id AND user_id = p_user_id;
    DELETE FROM sales WHERE id = p_sale_id AND user_id = p_user_id;

    IF v_goat_id IS NOT NULL THEN
        UPDATE goats SET status = 'active' WHERE id = v_goat_id AND user_id = p_user_id;
    END IF;
    IF v_cow_id IS NOT NULL THEN
        UPDATE cows SET status = 'active' WHERE id = v_cow_id AND user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 10.5 Check Cow Inbreeding Risk
CREATE OR REPLACE FUNCTION check_cow_inbreeding_risk(
    p_mother_id UUID,
    p_father_id UUID
) RETURNS TABLE (
    is_risk BOOLEAN,
    risk_level TEXT,
    ancestor_name TEXT,
    description TEXT
) AS $$
DECLARE
    v_common_id UUID;
    v_ancestor_name TEXT;
BEGIN
    IF p_mother_id = p_father_id THEN
        RETURN QUERY SELECT TRUE, 'CRITICAL', 'Direct Match', 'Mother and Father are the same animal';
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM cows WHERE id = p_mother_id AND father_id = p_father_id) THEN
        RETURN QUERY SELECT TRUE, 'CRITICAL', (SELECT name_or_tag FROM cows WHERE id = p_father_id), 'Father is also the Grandfather';
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM cows WHERE id = p_father_id AND mother_id = p_mother_id) THEN
        RETURN QUERY SELECT TRUE, 'CRITICAL', (SELECT name_or_tag FROM cows WHERE id = p_mother_id), 'Mother is also the Grandmother';
        RETURN;
    END IF;

    SELECT m.mother_id, c.name_or_tag INTO v_common_id, v_ancestor_name
    FROM cows m, cows f, cows c
    WHERE m.id = p_mother_id AND f.id = p_father_id 
      AND m.mother_id = f.mother_id AND m.mother_id IS NOT NULL
      AND c.id = m.mother_id;
    
    IF v_common_id IS NOT NULL THEN
        RETURN QUERY SELECT TRUE, 'HIGH', v_ancestor_name, 'Mother and Father share the same biological Dam (Full/Half Siblings)';
        RETURN;
    END IF;

    SELECT m.father_id, c.name_or_tag INTO v_common_id, v_ancestor_name
    FROM cows m, cows f, cows c
    WHERE m.id = p_mother_id AND f.id = p_father_id 
      AND m.father_id = f.father_id AND m.father_id IS NOT NULL
      AND c.id = m.father_id;
    
    IF v_common_id IS NOT NULL THEN
        RETURN QUERY SELECT TRUE, 'HIGH', v_ancestor_name, 'Mother and Father share the same biological Sire (Full/Half Siblings)';
        RETURN;
    END IF;

    RETURN QUERY SELECT FALSE, 'LOW', NULL::TEXT, 'No direct inbreeding detected in recent generations';
END;
$$ LANGUAGE plpgsql;

-- 10.6 Enhanced Add/Update Expense with Mappings (Supporting both goats and cows)
CREATE OR REPLACE FUNCTION add_expense_with_mappings(
    p_user_id UUID,
    p_amount NUMERIC,
    p_category_id UUID,
    p_expense_date DATE,
    p_note TEXT,
    p_paid_amount NUMERIC,
    p_due_amount NUMERIC,
    p_payment_status TEXT,
    p_goat_ids UUID[],
    p_owner_contributions JSONB,
    p_cow_ids UUID[] DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_expense_id UUID;
    contrib RECORD;
    g_id UUID;
    c_id UUID;
BEGIN
    INSERT INTO expenses (
        user_id, amount, category_id, expense_date, note, paid_amount, due_amount, payment_status
    ) VALUES (
        p_user_id, p_amount, p_category_id, p_expense_date, p_note, p_paid_amount, p_due_amount, p_payment_status
    ) RETURNING id INTO v_expense_id;

    IF p_goat_ids IS NOT NULL THEN
        FOREACH g_id IN ARRAY p_goat_ids LOOP
            INSERT INTO expense_goat_map (user_id, expense_id, goat_id)
            VALUES (p_user_id, v_expense_id, g_id);
        END LOOP;
    END IF;

    IF p_cow_ids IS NOT NULL THEN
        FOREACH c_id IN ARRAY p_cow_ids LOOP
            INSERT INTO expense_cow_map (user_id, expense_id, cow_id)
            VALUES (p_user_id, v_expense_id, c_id);
        END LOOP;
    END IF;

    IF p_owner_contributions IS NOT NULL THEN
        FOR contrib IN SELECT * FROM jsonb_to_recordset(p_owner_contributions) AS x(owner_id UUID, amount NUMERIC) LOOP
            INSERT INTO owner_contributions (user_id, owner_id, expense_id, amount)
            VALUES (p_user_id, contrib.owner_id, v_expense_id, contrib.amount);
        END LOOP;
    END IF;

    RETURN v_expense_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_expense_with_mappings(
    p_expense_id UUID,
    p_user_id UUID,
    p_amount NUMERIC,
    p_category_id UUID,
    p_expense_date DATE,
    p_note TEXT,
    p_paid_amount NUMERIC,
    p_due_amount NUMERIC,
    p_payment_status TEXT,
    p_goat_ids UUID[],
    p_owner_contributions JSONB,
    p_cow_ids UUID[] DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    contrib RECORD;
    g_id UUID;
    c_id UUID;
BEGIN
    UPDATE expenses SET 
        amount = p_amount,
        category_id = p_category_id,
        expense_date = p_expense_date,
        note = p_note,
        paid_amount = p_paid_amount,
        due_amount = p_due_amount,
        payment_status = p_payment_status
    WHERE id = p_expense_id AND user_id = p_user_id;

    DELETE FROM expense_goat_map WHERE expense_id = p_expense_id;
    IF p_goat_ids IS NOT NULL THEN
        FOREACH g_id IN ARRAY p_goat_ids LOOP
            INSERT INTO expense_goat_map (user_id, expense_id, goat_id)
            VALUES (p_user_id, p_expense_id, g_id);
        END LOOP;
    END IF;

    DELETE FROM expense_cow_map WHERE expense_id = p_expense_id;
    IF p_cow_ids IS NOT NULL THEN
        FOREACH c_id IN ARRAY p_cow_ids LOOP
            INSERT INTO expense_cow_map (user_id, expense_id, cow_id)
            VALUES (p_user_id, p_expense_id, c_id);
        END LOOP;
    END IF;

    DELETE FROM owner_contributions WHERE expense_id = p_expense_id;
    IF p_owner_contributions IS NOT NULL THEN
        FOR contrib IN SELECT * FROM jsonb_to_recordset(p_owner_contributions) AS x(owner_id UUID, amount NUMERIC) LOOP
            INSERT INTO owner_contributions (user_id, owner_id, expense_id, amount)
            VALUES (p_user_id, contrib.owner_id, p_expense_id, contrib.amount);
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;
