-- ====================================================================
-- Supabase Schema for Talat Phlu Smart Explorer (ตลาดพลู สมาร์ท เอ็กซ์พลอเรอร์)
-- Run this script in the Supabase SQL Editor to set up all tables and seed data.
-- ====================================================================

-- 1. Create Shops Table
create table if not exists public.shops (
  id text primary key,
  name text not null,
  image text,
  signature_menu text not null,
  story text not null,
  map_link text,
  video text default '/videos/talat-phlu-story.mp4',
  video_duration text default '2:00',
  personas text[] default array['sweet', 'chill'],
  category text default 'ร้านเด็ด',
  likes integer default 0,
  dislikes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for shops
alter table public.shops enable row level security;

create policy "Allow public read on shops"
  on public.shops for select
  using (true);

create policy "Allow public insert on shops"
  on public.shops for insert
  with check (true);

create policy "Allow public update on shops"
  on public.shops for update
  using (true);

create policy "Allow public delete on shops"
  on public.shops for delete
  using (true);


-- 2. Create Community Posts Table
create table if not exists public.posts (
  id text primary key,
  author text not null default 'บุคคลนิรนาม',
  avatar text default '💬',
  message text not null,
  shop_id text references public.shops(id) on delete set null,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for posts
alter table public.posts enable row level security;

create policy "Allow public read on posts"
  on public.posts for select
  using (true);

create policy "Allow public insert on posts"
  on public.posts for insert
  with check (true);

create policy "Allow public update on posts"
  on public.posts for update
  using (true);

create policy "Allow public delete on posts"
  on public.posts for delete
  using (true);


-- 3. Create Quiz Questions Table
create table if not exists public.quiz_questions (
  id text primary key,
  sort_order integer default 0,
  emoji text,
  question text not null,
  hint text,
  image text,
  options jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for quiz questions
alter table public.quiz_questions enable row level security;

create policy "Allow public read on quiz_questions"
  on public.quiz_questions for select
  using (true);

create policy "Allow public insert on quiz_questions"
  on public.quiz_questions for insert
  with check (true);

create policy "Allow public update on quiz_questions"
  on public.quiz_questions for update
  using (true);


-- 4. Create Admin Requests Table (คำขอสมัครเป็นผู้ดูแลระบบ)
create table if not exists public.admin_requests (
  id text primary key,
  name text not null,
  email text not null,
  pin text not null,
  reason text,
  status text default 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for admin requests
alter table public.admin_requests enable row level security;

create policy "Allow public read on admin_requests"
  on public.admin_requests for select
  using (true);

create policy "Allow public insert on admin_requests"
  on public.admin_requests for insert
  with check (true);

create policy "Allow public update on admin_requests"
  on public.admin_requests for update
  using (true);

create policy "Allow public delete on admin_requests"
  on public.admin_requests for delete
  using (true);


-- ====================================================================
-- SEED DATA (ข้อมูลเริ่มต้นสำหรับนำเข้า Supabase)
-- ====================================================================

-- Seed Shop: ร้านน้ำแข็งใส นิอ่าง (ระดับตำนาน)
insert into public.shops (id, name, image, signature_menu, story, map_link, video, video_duration, personas, category, likes, dislikes)
values
  (
    'shop_01',
    'ร้านน้ำแข็งใส นิอ่าง (ระดับตำนาน)',
    'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80',
    'น้ำแข็งใสไข่แข็ง และ ไอติมไข่แข็ง เครื่องแน่น',
    'ตำนานร้านน้ำแข็งใสคู่ตลาดพลูที่เปิดบริการมายาวนานกว่า 50 ปี สืบทอดความอร่อยจากรุ่นสู่รุ่น แม้จะผ่านช่วงการก่อสร้างรถไฟฟ้า แต่ยังคงยืนหยัดรักษาเอกลักษณ์ความอร่อยหวานมันไว้ได้อย่างครบถ้วน',
    'https://www.google.com/maps/search/?api=1&query=%E0%B8%99%E0%B8%B4%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%87%20%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B9%81%E0%B8%82%E0%B9%87%E0%B8%87%E0%B9%83%E0%B8%AA%20%E0%B9%84%E0%B8%AD%E0%B8%95%E0%B8%B4%E0%B8%A1%E0%B9%84%E0%B8%82%E0%B9%88%E0%B9%81%E0%B8%82%E0%B9%87%E0%B8%87%20%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%9E%E0%B8%A5%E0%B8%B9',
    '/videos/talat-phlu-story.mp4',
    '2:05',
    array['sweet', 'chill'],
    'ของหวานโบราณ',
    412,
    18
  )
on conflict (id) do nothing;

-- Seed Community Post for ร้านนิอ่าง
insert into public.posts (id, author, avatar, message, shop_id, likes)
values
  ('post_01', 'มือใหม่หัดกิน', '🍰', 'มาตลาดพลูครั้งแรก ฟังเพื่อนแนะนำร้านน้ำแข็งใส นิอ่าง ได้ไอติมไข่แข็งมาลอง รสชาติเข้มข้นสุด ๆ แนะนำให้กินตอนบ่ายร้อน ๆ ครับ', 'shop_01', 24)
on conflict (id) do nothing;

-- Seed Quiz Questions
insert into public.quiz_questions (id, sort_order, emoji, question, hint, image, options)
values
  (
    'q1',
    1,
    '🍧',
    'รสชาติที่ใจคุณเรียกร้องในตลาดพลูวันนี้คืออะไร?',
    'เลือกสไตล์รสชาติที่คุณอยากลิ้มลองเป็นมื้อแรก',
    'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
    '[
      {"label": "หวานเย็นสดชื่น ไอติมไข่แข็งนิอ่างดับร้อน", "emoji": "🍨", "image": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=240&q=80", "scores": {"sweet": 3, "chill": 1}},
      {"label": "สตรีทฟู้ดรสแซ่บ จัดจ้านสะใจริมทางรถไฟ", "emoji": "🍢", "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=240&q=80", "scores": {"street": 3}},
      {"label": "กาแฟโบราณ ชาเย็น จิบช้า ๆ ริมคลองบางกอกใหญ่", "emoji": "🧋", "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=240&q=80", "scores": {"chill": 3}},
      {"label": "ผลไม้ปั่นสด ยำเบา ๆ อร่อยคลีนเพื่อสุขภาพ", "emoji": "🥗", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=240&q=80", "scores": {"healthy": 3}}
    ]'::jsonb
  ),
  (
    'q2',
    2,
    '☀️',
    'เดินตลาดพลูอากาศร้อน ๆ สิ่งแรกที่คุณอยากพุ่งไปหาคือ?',
    'ตลาดพลูมีเมนูเย็นชื่นใจรอต้อนรับคุณอยู่เสมอ',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    '[
      {"label": "น้ำแข็งใสไข่แข็งนิอ่าง เครื่องแน่น หวานมันคลายร้อนทันที", "emoji": "🍧", "image": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=240&q=80", "scores": {"sweet": 3, "chill": 1}},
      {"label": "ก๋วยเตี๋ยวเรือซุปร้อน ๆ แซ่บเหงื่อตกสะใจ", "emoji": "🍜", "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=240&q=80", "scores": {"street": 3}},
      {"label": "ชงชาดำเย็นโบราณ นั่งพักขาใต้ร่มไม้ริมน้ำ", "emoji": "🥤", "image": "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=240&q=80", "scores": {"chill": 3}},
      {"label": "น้ำส้มคั้นสด สลัดผลไม้สดชื่นเบาสบายท้อง", "emoji": "🥑", "image": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=240&q=80", "scores": {"healthy": 3}}
    ]'::jsonb
  ),
  (
    'q3',
    3,
    '🚉',
    'เดินลัดเลาะจากสถานีรถไฟฟ้าตลาดพลู คุณชอบบรรยากาศแบบไหน?',
    'ซอยข้างทางรถไฟตลาดพลูเต็มไปด้วยเสน่ห์วิถีชีวิตดั้งเดิม',
    'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
    '[
      {"label": "เดินเลียบทางรถไฟ แวะร้านหวานเย็นระดับตำนานที่เปิดกว่า 50 ปี", "emoji": "🍨", "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=240&q=80", "scores": {"sweet": 3, "chill": 1}},
      {"label": "เดินลุยสตรีทฟู้ดหน้าสถานี ควันหอมฉุย ของทอดร้อน ๆ", "emoji": "🍢", "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=240&q=80", "scores": {"street": 3}},
      {"label": "นั่งเก้าอี้ริมคลอง ฟังเสียงระฆังรถไฟและเรือแล่นผ่าน", "emoji": "🛶", "image": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=240&q=80", "scores": {"chill": 3}},
      {"label": "เดินก้าวยาว ๆ ลัดเลาะชมตึกเก่า ได้เหงื่อสุขภาพดี", "emoji": "🚶‍♂️", "image": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=240&q=80", "scores": {"healthy": 3}}
    ]'::jsonb
  ),
  (
    'q4',
    4,
    '👑',
    'ถ้าให้เลือก "เมนูขึ้นหิ้ง" 1 อย่างของตลาดพลูที่ต้องชิมให้ได้?',
    'เมนูซิกเนเจอร์ที่ใครมาตลาดพลูแล้วไม่กิน ถือว่ามาไม่ถึง!',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    '[
      {"label": "ไอติมไข่แข็งนิอ่าง ความนัวระดับตำนานที่ใคร ๆ ก็ต้องเช็กอิน", "emoji": "🍧", "image": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=240&q=80", "scores": {"sweet": 3, "street": 1}},
      {"label": "ข้าวมันไก่ หมูกรอบสูตรโบราณ หนังกรอบเนื้อนุ่ม", "emoji": "🍗", "image": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=240&q=80", "scores": {"street": 3}},
      {"label": "กาแฟโบราณเตาถ่าน ชงสดใหม่ทุกแก้ว หอมคลาสสิก", "emoji": "☕", "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=240&q=80", "scores": {"chill": 3}},
      {"label": "ยำสมุนไพรสด น้ำผลไม้สกัดเย็น ดีต่อร่างกาย", "emoji": "🥒", "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&q=80", "scores": {"healthy": 3}}
    ]'::jsonb
  ),
  (
    'q5',
    5,
    '🌙',
    'ช่วงเวลาที่คุณคิดว่าตลาดพลูมีเสน่ห์น่าเดินกินที่สุด?',
    'ร้านเด็ดโดยเฉพาะของหวานเปิดรับลมค่ำคืนคึกคักมาก',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    '[
      {"label": "รอบค่ำถึงดึก นั่งกินน้ำแข็งใสไอติมไข่แข็งดูไฟตลาดโบราณ", "emoji": "🌃", "image": "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=240&q=80", "scores": {"sweet": 3, "chill": 2}},
      {"label": "ช่วงเย็นหลังเลิกงาน ตามล่าของกินริมทางควันตลบอบอวล", "emoji": "🌆", "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=240&q=80", "scores": {"street": 3}},
      {"label": "บ่ายวันหยุด สบาย ๆ เดินจิบเครื่องดื่มริมคลอง", "emoji": "☀️", "image": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=240&q=80", "scores": {"chill": 3}},
      {"label": "เช้าตรู่ สูดอากาศสดชื่น หาเครื่องดื่มร้อนคลายหนาว", "emoji": "🌅", "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=240&q=80", "scores": {"healthy": 2, "street": 1}}
    ]'::jsonb
  )
on conflict (id) do nothing;


-- ====================================================================
-- 5. Create Quiz Submissions Table (บันทึกข้อมูลผลลัพธ์ของผู้ทำควิซ)
-- ====================================================================
create table if not exists public.quiz_submissions (
  id text primary key,
  persona text not null,
  persona_name text not null,
  answers integer[] not null,
  scores jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.quiz_submissions enable row level security;

create policy "Allow public insert on quiz_submissions"
  on public.quiz_submissions for insert
  with check (true);

create policy "Allow public read on quiz_submissions"
  on public.quiz_submissions for select
  using (true);

