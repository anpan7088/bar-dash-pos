
-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📦',
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view products"
  ON public.products FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Anon can view products"
  ON public.products FOR SELECT
  TO anon USING (true);

CREATE POLICY "Authenticated can update product stock"
  ON public.products FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Anon can update product stock"
  ON public.products FOR UPDATE
  TO anon USING (true);

CREATE POLICY "Managers can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Stock movements table
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  change INTEGER NOT NULL,
  reason TEXT NOT NULL DEFAULT 'adjustment',
  user_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view stock movements"
  ON public.stock_movements FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Anon can view stock movements"
  ON public.stock_movements FOR SELECT
  TO anon USING (true);

CREATE POLICY "Authenticated can insert stock movements"
  ON public.stock_movements FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Anon can insert stock movements"
  ON public.stock_movements FOR INSERT
  TO anon WITH CHECK (true);

CREATE INDEX idx_stock_movements_product ON public.stock_movements(product_id, created_at DESC);
CREATE INDEX idx_products_category ON public.products(category) WHERE active = true;

-- Seed initial products
INSERT INTO public.products (name, price, category, emoji, stock) VALUES
  ('Espresso', 1.80, 'coffee', '☕', 100),
  ('Double Espresso', 2.40, 'coffee', '☕', 100),
  ('Cappuccino', 2.90, 'coffee', '☕', 100),
  ('Caffè Latte', 3.20, 'coffee', '☕', 100),
  ('Macchiato', 2.20, 'coffee', '☕', 100),
  ('Flat White', 3.40, 'coffee', '☕', 100),
  ('Americano', 2.50, 'coffee', '☕', 100),
  ('Mocha', 3.60, 'coffee', '☕', 100),
  ('Water 0.5L', 1.50, 'drinks', '💧', 50),
  ('Sparkling Water', 2.00, 'drinks', '💧', 50),
  ('Coca-Cola', 2.50, 'drinks', '🥤', 50),
  ('Fanta', 2.50, 'drinks', '🥤', 50),
  ('Fresh Juice', 3.50, 'drinks', '🧃', 30),
  ('Tea', 2.20, 'drinks', '🍵', 50),
  ('Iced Tea', 2.80, 'drinks', '🧊', 30),
  ('Lemonade', 3.00, 'drinks', '🍋', 30),
  ('Mojito', 7.50, 'cocktails', '🍸', 30),
  ('Margarita', 8.00, 'cocktails', '🍸', 30),
  ('Gin Tonic', 7.00, 'cocktails', '🍸', 30),
  ('Aperol Spritz', 6.50, 'cocktails', '🍹', 30),
  ('Negroni', 8.50, 'cocktails', '🍸', 30),
  ('Moscow Mule', 7.50, 'cocktails', '🍸', 30),
  ('Draft Beer 0.3L', 3.00, 'beer', '🍺', 80),
  ('Draft Beer 0.5L', 4.00, 'beer', '🍺', 80),
  ('White Wine', 3.50, 'beer', '🍷', 40),
  ('Red Wine', 3.50, 'beer', '🍷', 40),
  ('Prosecco', 4.50, 'beer', '🥂', 20),
  ('Toast', 3.50, 'food', '🥪', 25),
  ('Croissant', 2.80, 'food', '🥐', 25),
  ('Mixed Salad', 5.50, 'food', '🥗', 15),
  ('Burger', 8.90, 'food', '🍔', 20),
  ('Pizza Slice', 3.50, 'food', '🍕', 25),
  ('Chocolate Cake', 4.50, 'desserts', '🍫', 15),
  ('Tiramisu', 4.90, 'desserts', '🍰', 15),
  ('Pancakes', 5.50, 'desserts', '🥞', 15),
  ('Ice Cream', 3.00, 'desserts', '🍨', 30);
