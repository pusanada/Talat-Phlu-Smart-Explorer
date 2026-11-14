import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const DEFAULT_SHOPS = [
  {
    id: 'shop_01',
    name: 'ร้านน้ำแข็งใส นิอ่าง (ระดับตำนาน)',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80',
    signature_menu: 'น้ำแข็งใสไข่แข็ง และ ไอติมไข่แข็ง เครื่องแน่น',
    story:
      'ตำนานร้านน้ำแข็งใสคู่ตลาดพลูที่เปิดบริการมายาวนานกว่า 50 ปี สืบทอดความอร่อยจากรุ่นสู่รุ่น แม้จะผ่านช่วงการก่อสร้างรถไฟฟ้า แต่ยังคงยืนหยัดรักษาเอกลักษณ์ความอร่อยหวานมันไว้ได้อย่างครบถ้วน',
    map_link:
      'https://www.google.com/maps/search/?api=1&query=%E0%B8%99%E0%B8%B4%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%87%20%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B9%81%E0%B8%82%E0%B9%87%E0%B8%87%E0%B9%83%E0%B8%AA%20%E0%B9%84%E0%B8%AD%E0%B8%95%E0%B8%B4%E0%B8%A1%E0%B9%84%E0%B8%82%E0%B9%88%E0%B9%81%E0%B8%82%E0%B9%87%E0%B8%87%20%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%9E%E0%B8%A5%E0%B8%B9',
    video: '/videos/talat-phlu-story.mp4',
    video_duration: '2:05',
    personas: ['sweet', 'chill', 'street', 'healthy'],
    category: 'ของหวานโบราณ',
    likes: 0,
    dislikes: 0,
    has_story: true,
  },
  {
    id: 'map_01',
    name: 'Hidden Bangkok Bistro',
    image: null,
    video: null,
    signature_menu: 'อาหารฟิวชันริมคลอง & กาแฟสเปเชียลตี้',
    story: 'ร้านอาหารและคาเฟ่บรรยากาศสบายริมคลองบางหลวง ตลาดพลู เสิร์ฟอาหารฟิวชันและเครื่องดื่มชั้นเลิศ',
    map_link: 'https://www.google.com/maps/search/?api=1&query=Hidden%20Bangkok%20Bistro&query_place_id=34740457',
    category: 'ร้านอาหาร / คาเฟ่',
    personas: ['chill', 'healthy'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
  {
    id: 'map_02',
    name: 'Jann Cafe / Jann Coffee',
    image: null,
    video: null,
    signature_menu: 'Dirty Coffee & โฮมเมดเบเกอรี่',
    story: 'คาเฟ่บรรยากาศอบอุ่นคลาสสิกใจกลางตลาดพลู เด่นด้วยเมล็ดกาแฟคัดพิเศษและเบเกอรี่อบใหม่',
    map_link: 'https://www.google.com/maps/search/?api=1&query=Jann%20Cafe%20/%20Jann%20Coffee&query_place_id=ChIJt3nVb9uZ4jARwJ7BlMMluYk',
    category: 'คาเฟ่',
    personas: ['chill', 'sweet'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
  {
    id: 'map_03',
    name: 'Laluna Cafe',
    image: null,
    video: null,
    signature_menu: 'กาแฟดริป & ชาผลไม้คลายร้อน',
    story: 'คาเฟ่สไตล์มินิมอล ถ่ายรูปสวย แหล่งนัดพบยอดนิยมของคนรุ่นใหม่ในย่านตลาดพลู',
    map_link: 'https://www.google.com/maps/search/?api=1&query=Laluna%20Cafe&query_place_id=29026445',
    category: 'คาเฟ่',
    personas: ['chill', 'sweet'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
  {
    id: 'map_04',
    name: 'Masonia Tree & Coffee Cafe',
    image: null,
    video: null,
    signature_menu: 'กาแฟสดท่ามกลางต้นไม้ & ครัวซองต์เนยสด',
    story: 'คาเฟ่ร่มรื่นใต้ร่มเงาต้นไม้ใหญ่ เหมาะสำหรับนั่งพักผ่อนหย่อนใจและชิมขนมอบสดใหม่',
    map_link: 'https://www.google.com/maps/search/?api=1&query=Masonia%20Tree%20%26%20Coffee%20Cafe&query_place_id=ChIJnyVV7tmZ4jARjZ9qVoH6cwI',
    category: 'คาเฟ่ในสวน',
    personas: ['chill', 'healthy'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
  {
    id: 'map_05',
    name: 'ABC Coffee',
    image: null,
    video: null,
    signature_menu: 'Specialty Coffee & เมล็ดคั่วพิเศษ',
    story: 'ร้านกาแฟ Specialty ตัวจริง คั่วบดสดใหม่ รสชาติมีเอกลักษณ์เฉพาะตัว',
    map_link: 'https://www.google.com/maps/search/?api=1&query=ABC%20Coffee&query_place_id=ChIJ_31hY1uY4jAR_2wbbUAoZBA',
    category: 'สเปเชียลตี้คอฟฟี่',
    personas: ['chill'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
  {
    id: 'map_06',
    name: 'LYNX Coffee',
    image: null,
    video: null,
    signature_menu: 'Matcha Cheese Pie & ซิกเนเจอร์ลาเต้',
    story: 'คาเฟ่ชื่อดังที่มีเมนูพายชาเขียวในตำนานและกาแฟคุณภาพเยี่ยม',
    map_link: 'https://www.google.com/maps/search/?api=1&query=LYNX%20Coffee&query_place_id=ChIJO1suWVuY4jARB2jk0WPLt_w',
    category: 'คาเฟ่ & ขนมหวาน',
    personas: ['chill', 'sweet'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
  {
    id: 'map_07',
    name: 'AantArm Cafe',
    image: null,
    video: null,
    signature_menu: 'สเต๊กเนื้อพรีเมียม & กาแฟสไตล์โมเดิร์น',
    story: 'คาเฟ่กึ่งร้านสเต๊กบรรยากาศสุดชิค เสิร์ฟสเต๊กเนื้อนุ่มและอาหารรสเลิศ',
    map_link: 'https://www.google.com/maps/search/?api=1&query=AantArm%20Cafe&query_place_id=ChIJTVQxg1uY4jARGtQTwopM_uI',
    category: 'คาเฟ่ & ร้านสเต๊ก',
    personas: ['street', 'chill'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
  {
    id: 'map_08',
    name: 'MATCHAMA (มัทฉะมะ)',
    image: '/images/shops/matchama.jpg',
    video: null,
    signature_menu: 'มัทฉะเกรดพิธีการเข้มข้น & ไอศกรีมมัทฉะ',
    story: 'สวรรค์ของคนรักมัทฉะแท้จากญี่ปุ่น ชงสดแก้วต่อแก้ว หอมละมุนเข้มข้น',
    map_link: 'https://www.google.com/maps/search/?api=1&query=MATCHAMA%20%28%E0%B8%A1%E0%B8%B1%E0%B8%97%E0%B8%89%E0%B8%B0%E0%B8%A1%E0%B8%B0%29&query_place_id=ChIJzyBzYZWZ4jAR1u9WohoSibw',
    category: 'คาเฟ่มัทฉะแท้',
    personas: ['sweet', 'healthy', 'chill'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
  {
    id: 'map_09',
    name: 'หมี่กรอบจีนหลี สมัย ร.5 (Tek Heng)',
    image: null,
    video: null,
    signature_menu: 'หมี่กรอบโบราณพระราชทานสูตรสมัย ร.5',
    story: 'ตำนานหมี่กรอบร้อยปีที่ได้รับพระราชทานรางวัลตั้งแต่รัชกาลที่ 5 กรอบอร่อยเข้มข้นถึงเครื่อง',
    map_link: 'https://www.google.com/maps/search/?api=1&query=%E0%B8%AB%E0%B8%A1%E0%B8%B5%E0%B9%88%E0%B8%81%E0%B8%A3%E0%B8%AD%E0%B8%9A%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%AB%E0%B8%A5%E0%B8%B5%20%E0%B8%AA%E0%B8%A1%E0%B8%B1%E0%B8%A2%20%E0%B8%A3.5%20%28Tek%20Heng%29&query_place_id=ChIJrTSW6FuY4jARc2IhhsnMNQQ',
    category: 'ร้านอาหารในตำนาน',
    personas: ['street'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
  {
    id: 'map_10',
    name: 'Neko Matcha',
    image: null,
    video: null,
    signature_menu: 'Matcha Latte เข้มข้น & โฮมเมดสโคน',
    story: 'คาเฟ่ชาเขียวสไตล์ญี่ปุ่น ตกแต่งน่ารักอบอุ่น รสชาติมัทฉะแท้กลมกล่อม',
    map_link: 'https://www.google.com/maps/search/?api=1&query=%E0%B8%81%E0%B8%A5%E0%B8%B8%E0%B9%88%E0%B8%A1%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E2%80%A6%20Neko%20Matcha&query_place_id=ChIJoXIoR3qZ4jARyZznB202Rac',
    category: 'คาเฟ่มัทฉะ & ญี่ปุ่น',
    personas: ['sweet', 'chill'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
  {
    id: 'map_11',
    name: 'ขนมหวานตลาดพลู (เจ้าเก่า)',
    image: null,
    video: null,
    signature_menu: 'ทองหยอด เม็ดขนุน ตะโก้ ข้าวเหนียวตัด',
    story: 'ร้านขนมไทยโบราณเจ้าเก่าแก่แห่งตลาดพลู หอมหวานมันกะทิสด ทำสดใหม่ทุกวัน',
    map_link: 'https://www.google.com/maps/search/?api=1&query=%E0%B8%82%E0%B8%99%E0%B8%A1%E0%B8%AB%E0%B8%A7%E0%B8%B2%E0%B8%99%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%9E%E0%B8%A5%E0%B8%B9%20%28%E0%B9%80%E0%B8%88%E0%B9%89%E0%B8%B2%E0%B9%80%E0%B8%81%E0%B9%88%E0%B8%B2%29&query_place_id=ChIJtS_851uY4jARjoMJoSbyHhI',
    category: 'ของหวานโบราณ',
    personas: ['sweet'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
  {
    id: 'map_12',
    name: 'Catory Pizza (พิซซ่ากุยช่าย)',
    image: null,
    video: null,
    signature_menu: 'พิซซ่าหน้ากุยช่ายตลาดพลู แป้งบางกรอบชีสเยิ้ม',
    story: 'ความลงตัวของการผสมผสานกุยช่ายตลาดพลูเข้ากับแป้งพิซซ่าอิตาเลียน อบใหม่ร้อนๆ',
    map_link: 'https://www.google.com/maps/search/?api=1&query=Catory%20Pizza%20%28%E0%B8%9E%E0%B8%B4%E0%B8%8B%E0%B8%8B%E0%B9%88%E0%B8%B2%E0%B8%81%E0%B8%B8%E0%B8%A2%E0%B8%8A%E0%B9%88%E0%B8%B2%E0%B8%A2%29&query_place_id=ChIJrRzviZaZ4jARr8iUZRKEESU',
    category: 'พิซซ่าฟิวชัน',
    personas: ['street', 'chill'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
  {
    id: 'map_13',
    name: 'HARU Bakehouse',
    image: null,
    video: null,
    signature_menu: 'ชิโอะปัง Shio Pan & เค้กญี่ปุ่นนุ่มละมุน',
    story: 'เบเกอรี่สไตล์ญี่ปุ่น หอมกรุ่นกลิ่นเนยสดทุกเช้า ขนมปังเนื้อสัมผัสนุ่มเด้ง',
    map_link: 'https://www.google.com/maps/search/?api=1&query=HARU%20Bakehouse&query_place_id=ChIJY8CvWgCZ4jAR06Q72njINhI',
    category: 'เบเกอรี่ & คาเฟ่',
    personas: ['sweet', 'chill'],
    likes: 0,
    dislikes: 0,
    has_story: false,
  },
]

/**
 * Fetch all shops from Supabase (or fallback to default shop ร้านนิอ่าง)
 */
export async function getShops() {
  if (!isSupabaseConfigured || !supabase) {
    return DEFAULT_SHOPS
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('likes', { ascending: false })

    if (error) throw error
    if (data && data.length > 0) return data
    return DEFAULT_SHOPS
  } catch (err) {
    console.warn('Supabase getShops fallback to default shop:', err)
    return DEFAULT_SHOPS
  }
}

/**
 * Create a new shop in Supabase
 */
export async function createShop(payload) {
  const newShop = {
    id: `shop_${Date.now().toString(36)}`,
    ...payload,
    video: payload.video || null,
    video_duration: payload.video ? payload.video_duration || '1:45' : null,
    personas: payload.personas || ['sweet', 'street'],
    category: payload.category || 'ร้านใหม่',
    likes: 0,
    dislikes: 0,
    created_at: new Date().toISOString(),
  }

  if (!isSupabaseConfigured || !supabase) {
    console.warn('Cannot persist shop: Supabase is not configured.')
    return newShop
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .insert([newShop])
      .select()
      .single()

    if (error) throw error
    return data || newShop
  } catch (err) {
    console.error('Supabase createShop error:', err)
    return newShop
  }
}

/**
 * Update shop by ID
 */
export async function updateShop(id, payload) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Cannot update shop: Supabase is not configured.')
    return { id, ...payload }
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Supabase updateShop error:', err)
    return { id, ...payload }
  }
}

/**
 * Delete shop by ID
 */
export async function deleteShop(id) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Cannot delete shop: Supabase is not configured.')
    return false
  }

  try {
    const { error } = await supabase.from('shops').delete().eq('id', id)
    if (error) throw error
    return true
  } catch (err) {
    console.error('Supabase deleteShop error:', err)
    return false
  }
}

/**
 * Record a like/dislike vote
 */
export async function recordVote(shopId, kind, currentShop) {
  if (!isSupabaseConfigured || !supabase || !currentShop) {
    return null
  }

  try {
    const { error } = await supabase
      .from('shops')
      .update({
        likes: currentShop.likes,
        dislikes: currentShop.dislikes,
      })
      .eq('id', shopId)

    if (error) throw error
  } catch (err) {
    console.error('Supabase recordVote error:', err)
  }
}
