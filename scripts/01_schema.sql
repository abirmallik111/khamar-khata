-- ====================================================================
-- KHAMAR KHATA - SELF-HOSTED POSTGRESQL 16/17 MIGRATION SCHEMA
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Types & Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goat_status') THEN
        CREATE TYPE goat_status AS ENUM ('active', 'sold', 'sick', 'dead', 'archived');
    END IF;
END $$;

-- 3. Core Tables Creation

-- 3.1 Profiles Table (User Account Profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    currency TEXT DEFAULT 'BDT',
    password_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NextAuth / Auth.js Support Tables (Optional/Integrated)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INT,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    CONSTRAINT accounts_provider_provider_account_id_unique UNIQUE (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires TIMESTAMPTZ NOT NULL,
    CONSTRAINT verification_tokens_identifier_token_pk PRIMARY KEY (identifier, token)
);

-- 3.2 Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Goats (Livestock Inventory)
CREATE TABLE IF NOT EXISTS goats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name_or_tag TEXT NOT NULL,
    breed TEXT,
    gender TEXT,
    purchase_price NUMERIC NOT NULL DEFAULT 0,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status goat_status NOT NULL DEFAULT 'active',
    image_url TEXT,
    source TEXT DEFAULT 'purchased',
    mother_id UUID REFERENCES goats(id) ON DELETE SET NULL,
    father_id UUID REFERENCES goats(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
    amount NUMERIC NOT NULL DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    due_amount NUMERIC DEFAULT 0,
    payment_status TEXT DEFAULT 'due',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 Expense-Goat Allocation Mapping
CREATE TABLE IF NOT EXISTS expense_goat_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    goat_id UUID NOT NULL REFERENCES goats(id) ON DELETE CASCADE
);

-- 3.6 Sales Records
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    goat_id UUID NOT NULL UNIQUE REFERENCES goats(id) ON DELETE CASCADE,
    sale_price NUMERIC NOT NULL DEFAULT 0,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 Partners / Owners
CREATE TABLE IF NOT EXISTS owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    share_percentage NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.8 Owner Contributions
CREATE TABLE IF NOT EXISTS owner_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
    goat_id UUID REFERENCES goats(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9 Goat Health Records
CREATE TABLE IF NOT EXISTS goat_health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    goat_id UUID NOT NULL REFERENCES goats(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    name TEXT,
    notes TEXT,
    next_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.10 Goat Notes
CREATE TABLE IF NOT EXISTS goat_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    goat_id UUID NOT NULL REFERENCES goats(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    note_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.11 Goat Images Gallery
CREATE TABLE IF NOT EXISTS goat_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    goat_id UUID NOT NULL REFERENCES goats(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_goats_user_status ON goats(user_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_sales_user_date ON sales(user_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_expense_goat_map_goat ON expense_goat_map(goat_id);
CREATE INDEX IF NOT EXISTS idx_expense_goat_map_expense ON expense_goat_map(expense_id);
CREATE INDEX IF NOT EXISTS idx_owner_contributions_owner ON owner_contributions(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_contributions_goat ON owner_contributions(goat_id);
CREATE INDEX IF NOT EXISTS idx_owner_contributions_expense ON owner_contributions(expense_id);

-- 5. Stored Procedures / PL/pgSQL RPC Functions

-- 5.1 Add Expense with Mappings
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
    p_owner_contributions JSONB
) RETURNS UUID AS $$
DECLARE
    v_expense_id UUID;
    contrib RECORD;
    g_id UUID;
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

    IF p_owner_contributions IS NOT NULL THEN
        FOR contrib IN SELECT * FROM jsonb_to_recordset(p_owner_contributions) AS x(owner_id UUID, amount NUMERIC) LOOP
            INSERT INTO owner_contributions (user_id, owner_id, expense_id, amount)
            VALUES (p_user_id, contrib.owner_id, v_expense_id, contrib.amount);
        END LOOP;
    END IF;

    RETURN v_expense_id;
END;
$$ LANGUAGE plpgsql;

-- 5.2 Update Expense with Mappings
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
    p_owner_contributions JSONB
) RETURNS VOID AS $$
DECLARE
    contrib RECORD;
    g_id UUID;
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

    DELETE FROM owner_contributions WHERE expense_id = p_expense_id;
    IF p_owner_contributions IS NOT NULL THEN
        FOR contrib IN SELECT * FROM jsonb_to_recordset(p_owner_contributions) AS x(owner_id UUID, amount NUMERIC) LOOP
            INSERT INTO owner_contributions (user_id, owner_id, expense_id, amount)
            VALUES (p_user_id, contrib.owner_id, p_expense_id, contrib.amount);
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5.3 Add Goat with Contributions
CREATE OR REPLACE FUNCTION add_goat_with_contributions(
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
    v_goat_id UUID;
    v_contrib RECORD;
BEGIN
    INSERT INTO goats (
        user_id, name_or_tag, breed, gender, purchase_price, purchase_date, source, image_url, status, mother_id, father_id
    ) VALUES (
        p_user_id, p_name_or_tag, p_breed, p_gender, p_purchase_price, p_purchase_date, p_source, p_image_url, 'active', p_mother_id, p_father_id
    ) RETURNING id INTO v_goat_id;

    IF p_owner_contributions IS NOT NULL AND jsonb_array_length(p_owner_contributions) > 0 THEN
        FOR v_contrib IN SELECT * FROM jsonb_to_recordset(p_owner_contributions) AS x(owner_id UUID, amount NUMERIC) LOOP
            INSERT INTO owner_contributions (user_id, owner_id, goat_id, amount)
            VALUES (p_user_id, v_contrib.owner_id, v_goat_id, v_contrib.amount);
        END LOOP;
    END IF;

    RETURN v_goat_id;
END;
$$ LANGUAGE plpgsql;

-- 5.4 Update Goat with Contributions
CREATE OR REPLACE FUNCTION update_goat_with_contributions(
    p_goat_id UUID,
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
    UPDATE goats SET
        name_or_tag = p_name_or_tag,
        breed = p_breed,
        gender = p_gender,
        purchase_price = p_purchase_price,
        purchase_date = p_purchase_date,
        source = p_source,
        status = p_status::goat_status,
        image_url = p_image_url,
        mother_id = p_mother_id,
        father_id = p_father_id,
        updated_at = NOW()
    WHERE id = p_goat_id AND user_id = p_user_id;

    DELETE FROM owner_contributions WHERE goat_id = p_goat_id AND user_id = p_user_id;

    IF p_owner_contributions IS NOT NULL AND jsonb_array_length(p_owner_contributions) > 0 THEN
        FOR v_contrib IN SELECT * FROM jsonb_to_recordset(p_owner_contributions) AS x(owner_id UUID, amount NUMERIC) LOOP
            INSERT INTO owner_contributions (user_id, owner_id, goat_id, amount)
            VALUES (p_user_id, v_contrib.owner_id, p_goat_id, v_contrib.amount);
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5.5 Add Sale & Update Goat Status
CREATE OR REPLACE FUNCTION add_sale_and_update_goat(
    p_user_id UUID,
    p_goat_id UUID,
    p_sale_price NUMERIC,
    p_sale_date DATE,
    p_note TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO sales (user_id, goat_id, sale_price, sale_date, note)
    VALUES (p_user_id, p_goat_id, p_sale_price, p_sale_date, p_note);

    UPDATE goats SET status = 'sold' WHERE id = p_goat_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 5.6 Delete Sale & Revert Goat Status
CREATE OR REPLACE FUNCTION delete_sale_and_revert_goat(
    p_sale_id UUID,
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_goat_id UUID;
BEGIN
    SELECT goat_id INTO v_goat_id FROM sales WHERE id = p_sale_id AND user_id = p_user_id;
    DELETE FROM sales WHERE id = p_sale_id AND user_id = p_user_id;

    IF v_goat_id IS NOT NULL THEN
        UPDATE goats SET status = 'active' WHERE id = v_goat_id AND user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5.7 Get Farm Reports
CREATE OR REPLACE FUNCTION get_farm_reports(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_overview JSONB;
  v_goat_roi JSONB;
  v_monthly_stats JSONB;
  v_category_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_goats', (SELECT count(*) FROM goats WHERE user_id = p_user_id AND status IN ('active', 'sick')),
    'total_investment', ROUND((
      (SELECT COALESCE(sum(purchase_price), 0) FROM goats WHERE user_id = p_user_id AND (p_start_date IS NULL OR purchase_date >= p_start_date) AND (p_end_date IS NULL OR purchase_date <= p_end_date)) + 
      (SELECT COALESCE(sum(amount), 0) FROM expenses WHERE user_id = p_user_id AND (p_start_date IS NULL OR expense_date >= p_start_date) AND (p_end_date IS NULL OR expense_date <= p_end_date))
    )::numeric, 2),
    'total_revenue', ROUND((SELECT COALESCE(sum(sale_price), 0) FROM sales WHERE user_id = p_user_id AND (p_start_date IS NULL OR sale_date >= p_start_date) AND (p_end_date IS NULL OR sale_date <= p_end_date))::numeric, 2)
  ) INTO v_overview;

  WITH goat_expenses AS (
    SELECT 
      egm.goat_id,
      SUM(e.amount / (SELECT count(*) FROM expense_goat_map egm2 WHERE egm2.expense_id = e.id)) as allocated_expense
    FROM expense_goat_map egm
    JOIN expenses e ON egm.expense_id = e.id
    WHERE e.user_id = p_user_id
    GROUP BY egm.goat_id
  )
  SELECT jsonb_agg(t) FROM (
    SELECT 
      g.id,
      g.name_or_tag,
      g.breed,
      ROUND(g.purchase_price::numeric, 2) as purchase_cost,
      ROUND(COALESCE(ge.allocated_expense, 0)::numeric, 2) as allocated_expense,
      ROUND((g.purchase_price + COALESCE(ge.allocated_expense, 0))::numeric, 2) as total_cost,
      ROUND(s.sale_price::numeric, 2) as sale_price,
      CASE 
        WHEN g.status = 'sold' AND s.sale_price IS NOT NULL THEN ROUND((s.sale_price - (g.purchase_price + COALESCE(ge.allocated_expense, 0)))::numeric, 2)
        ELSE NULL 
      END as profit,
      CASE 
        WHEN g.status = 'sold' AND s.sale_price IS NOT NULL AND (g.purchase_price + COALESCE(ge.allocated_expense, 0)) > 0 
        THEN ROUND(((s.sale_price - (g.purchase_price + COALESCE(ge.allocated_expense, 0))) / (g.purchase_price + COALESCE(ge.allocated_expense, 0)) * 100)::numeric, 2)
        ELSE NULL
      END as roi_percentage,
      g.status,
      g.image_url
    FROM goats g
    LEFT JOIN goat_expenses ge ON g.id = ge.goat_id
    LEFT JOIN sales s ON g.id = s.goat_id
    WHERE g.user_id = p_user_id
    ORDER BY profit DESC NULLS LAST, g.created_at DESC
  ) t INTO v_goat_roi;

  WITH monthly_expenses AS (
    SELECT 
      date_trunc('month', expense_date)::date as month,
      SUM(amount) as total_expense
    FROM expenses
    WHERE user_id = p_user_id
    GROUP BY 1
  ),
  monthly_sales AS (
    SELECT 
      date_trunc('month', sale_date)::date as month,
      SUM(sale_price) as total_sale
    FROM sales
    WHERE user_id = p_user_id
    GROUP BY 1
  )
  SELECT jsonb_agg(t) FROM (
    SELECT 
      to_char(COALESCE(e.month, s.month), 'Mon YYYY') as month_label,
      COALESCE(e.month, s.month) as month_date,
      ROUND(COALESCE(e.total_expense, 0)::numeric, 2) as total_expense,
      ROUND(COALESCE(s.total_sale, 0)::numeric, 2) as total_sale,
      ROUND((COALESCE(s.total_sale, 0) - COALESCE(e.total_expense, 0))::numeric, 2) as monthly_profit
    FROM monthly_expenses e
    FULL OUTER JOIN monthly_sales s ON e.month = s.month
    ORDER BY month_date DESC
    LIMIT 12
  ) t INTO v_monthly_stats;

  SELECT jsonb_agg(t) FROM (
    SELECT 
      ec.name as category_name,
      ROUND(SUM(e.amount)::numeric, 2) as total_amount
    FROM expenses e
    JOIN expense_categories ec ON e.category_id = ec.id
    WHERE e.user_id = p_user_id
    GROUP BY ec.name
    ORDER BY total_amount DESC
  ) t INTO v_category_stats;

  v_result := jsonb_build_object(
    'overview', v_overview,
    'goat_roi', COALESCE(v_goat_roi, '[]'::jsonb),
    'monthly_stats', COALESCE(v_monthly_stats, '[]'::jsonb),
    'category_stats', COALESCE(v_category_stats, '[]'::jsonb),
    'server_time', now()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 5.8 Check Inbreeding Risk Procedure
CREATE OR REPLACE FUNCTION check_inbreeding_risk(
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

    IF EXISTS (SELECT 1 FROM goats WHERE id = p_mother_id AND father_id = p_father_id) THEN
        RETURN QUERY SELECT TRUE, 'CRITICAL', (SELECT name_or_tag FROM goats WHERE id = p_father_id), 'Father is also the Grandfather';
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM goats WHERE id = p_father_id AND mother_id = p_mother_id) THEN
        RETURN QUERY SELECT TRUE, 'CRITICAL', (SELECT name_or_tag FROM goats WHERE id = p_mother_id), 'Mother is also the Grandmother';
        RETURN;
    END IF;

    SELECT m.mother_id, g.name_or_tag INTO v_common_id, v_ancestor_name
    FROM goats m, goats f, goats g
    WHERE m.id = p_mother_id AND f.id = p_father_id 
      AND m.mother_id = f.mother_id AND m.mother_id IS NOT NULL
      AND g.id = m.mother_id;
    
    IF v_common_id IS NOT NULL THEN
        RETURN QUERY SELECT TRUE, 'HIGH', v_ancestor_name, 'Mother and Father share the same biological Dam (Full/Half Siblings)';
        RETURN;
    END IF;

    SELECT m.father_id, g.name_or_tag INTO v_common_id, v_ancestor_name
    FROM goats m, goats f, goats g
    WHERE m.id = p_mother_id AND f.id = p_father_id 
      AND m.father_id = f.father_id AND m.father_id IS NOT NULL
      AND g.id = m.father_id;
    
    IF v_common_id IS NOT NULL THEN
        RETURN QUERY SELECT TRUE, 'HIGH', v_ancestor_name, 'Mother and Father share the same biological Sire (Full/Half Siblings)';
        RETURN;
    END IF;

    RETURN QUERY SELECT FALSE, 'LOW', NULL::TEXT, 'No direct inbreeding detected in recent generations';
END;
$$ LANGUAGE plpgsql;

-- 5.9 Get Partner Equity Report Procedure
CREATE OR REPLACE FUNCTION get_partner_equity_report(
    p_user_id UUID
) RETURNS TABLE (
    owner_id UUID,
    owner_name TEXT,
    share_percentage NUMERIC,
    total_investment NUMERIC,
    realized_profit NUMERIC,
    active_asset_cost NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id AS owner_id,
        o.name AS owner_name,
        COALESCE(o.share_percentage, 0)::NUMERIC AS share_percentage,
        COALESCE((
            SELECT SUM(oc.amount) 
            FROM owner_contributions oc 
            WHERE oc.owner_id = o.id AND oc.user_id = p_user_id
        ), 0)::NUMERIC AS total_investment,
        COALESCE((
            SELECT SUM(s.sale_price * (o.share_percentage / 100.0))
            FROM sales s
            WHERE s.user_id = p_user_id
        ), 0)::NUMERIC AS realized_profit,
        COALESCE((
            SELECT SUM(g.purchase_price * (o.share_percentage / 100.0))
            FROM goats g
            WHERE g.user_id = p_user_id AND g.status IN ('active', 'sick')
        ), 0)::NUMERIC AS active_asset_cost
    FROM owners o
    WHERE o.user_id = p_user_id
    ORDER BY o.created_at ASC;
END;
$$ LANGUAGE plpgsql;

