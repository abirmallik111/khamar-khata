-- 04_update_reports_for_cows.sql
-- Updates get_farm_reports and get_partner_equity_report to include cows

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
    'total_cows', (SELECT count(*) FROM cows WHERE user_id = p_user_id AND status IN ('active', 'sick')),
    'total_investment', ROUND((
      (SELECT COALESCE(sum(purchase_price), 0) FROM goats WHERE user_id = p_user_id AND (p_start_date IS NULL OR purchase_date >= p_start_date) AND (p_end_date IS NULL OR purchase_date <= p_end_date)) + 
      (SELECT COALESCE(sum(purchase_price), 0) FROM cows WHERE user_id = p_user_id AND (p_start_date IS NULL OR purchase_date >= p_start_date) AND (p_end_date IS NULL OR purchase_date <= p_end_date)) + 
      (SELECT COALESCE(sum(amount), 0) FROM expenses WHERE user_id = p_user_id AND (p_start_date IS NULL OR expense_date >= p_start_date) AND (p_end_date IS NULL OR expense_date <= p_end_date))
    )::numeric, 2),
    'total_revenue', ROUND((SELECT COALESCE(sum(sale_price), 0) FROM sales WHERE user_id = p_user_id AND (p_start_date IS NULL OR sale_date >= p_start_date) AND (p_end_date IS NULL OR sale_date <= p_end_date))::numeric, 2)
  ) INTO v_overview;

  WITH all_expenses_allocated AS (
    SELECT 
      egm.goat_id as animal_id,
      'goat' as animal_type,
      SUM(e.amount / NULLIF((SELECT count(*) FROM expense_goat_map egm2 WHERE egm2.expense_id = e.id) + (SELECT count(*) FROM expense_cow_map ecm2 WHERE ecm2.expense_id = e.id), 0)) as allocated_expense
    FROM expense_goat_map egm
    JOIN expenses e ON egm.expense_id = e.id
    WHERE e.user_id = p_user_id
    GROUP BY egm.goat_id
    UNION ALL
    SELECT 
      ecm.cow_id as animal_id,
      'cow' as animal_type,
      SUM(e.amount / NULLIF((SELECT count(*) FROM expense_goat_map egm2 WHERE egm2.expense_id = e.id) + (SELECT count(*) FROM expense_cow_map ecm2 WHERE ecm2.expense_id = e.id), 0)) as allocated_expense
    FROM expense_cow_map ecm
    JOIN expenses e ON ecm.expense_id = e.id
    WHERE e.user_id = p_user_id
    GROUP BY ecm.cow_id
  )
  SELECT jsonb_agg(t) FROM (
    SELECT 
      g.id,
      g.name_or_tag,
      g.breed,
      'goat' as animal_type,
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
      g.image_url,
      g.created_at
    FROM goats g
    LEFT JOIN all_expenses_allocated ge ON g.id = ge.animal_id AND ge.animal_type = 'goat'
    LEFT JOIN sales s ON g.id = s.goat_id
    WHERE g.user_id = p_user_id
    UNION ALL
    SELECT 
      c.id,
      c.name_or_tag,
      c.breed,
      'cow' as animal_type,
      ROUND(c.purchase_price::numeric, 2) as purchase_cost,
      ROUND(COALESCE(ce.allocated_expense, 0)::numeric, 2) as allocated_expense,
      ROUND((c.purchase_price + COALESCE(ce.allocated_expense, 0))::numeric, 2) as total_cost,
      ROUND(s.sale_price::numeric, 2) as sale_price,
      CASE 
        WHEN c.status = 'sold' AND s.sale_price IS NOT NULL THEN ROUND((s.sale_price - (c.purchase_price + COALESCE(ce.allocated_expense, 0)))::numeric, 2)
        ELSE NULL 
      END as profit,
      CASE 
        WHEN c.status = 'sold' AND s.sale_price IS NOT NULL AND (c.purchase_price + COALESCE(ce.allocated_expense, 0)) > 0 
        THEN ROUND(((s.sale_price - (c.purchase_price + COALESCE(ce.allocated_expense, 0))) / (c.purchase_price + COALESCE(ce.allocated_expense, 0)) * 100)::numeric, 2)
        ELSE NULL
      END as roi_percentage,
      c.status,
      c.image_url,
      c.created_at
    FROM cows c
    LEFT JOIN all_expenses_allocated ce ON c.id = ce.animal_id AND ce.animal_type = 'cow'
    LEFT JOIN sales s ON c.id = s.cow_id
    WHERE c.user_id = p_user_id
    ORDER BY profit DESC NULLS LAST, created_at DESC
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

-- 5.9 Update Get Partner Equity Report Procedure
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
            (SELECT COALESCE(SUM(g.purchase_price * (o.share_percentage / 100.0)), 0)
             FROM goats g
             WHERE g.user_id = p_user_id AND g.status IN ('active', 'sick'))
            +
            (SELECT COALESCE(SUM(c.purchase_price * (o.share_percentage / 100.0)), 0)
             FROM cows c
             WHERE c.user_id = p_user_id AND c.status IN ('active', 'sick'))
        ), 0)::NUMERIC AS active_asset_cost
    FROM owners o
    WHERE o.user_id = p_user_id
    ORDER BY o.created_at ASC;
END;
$$ LANGUAGE plpgsql;
