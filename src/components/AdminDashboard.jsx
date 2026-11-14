import { useRef, useState } from 'react'
import { CheckCircle2, Film, MapPin, Pencil, PlusCircle, Save, Store, Trash2, Users, Video, X } from 'lucide-react'
import TeamPanel from './TeamPanel'

const EMPTY_FORM = {
  shop_type: 'story', // 'story' | 'all_shops'
  name: '',
  image: null, // File (PNG/JPG/WebP)
  imageUrl: '',
  video: '',
  video_duration: '2:00',
  category: 'ของหวานโบราณ',
  signature_menu: '',
  story: '',
  map_link: '',
}

const LIMITS = {
  name: 50,
  signature_menu: 100,
  story: 500,
}

export default function AdminDashboard({
  shops,
  currentMember,
  team,
  onAddShop,
  onUpdateShop,
  onDeleteShop,
  onApprove,
  onReject,
  onRemoveMember,
  onResetTeam,
  onRefreshTeam,
  onOpenInvite,
}) {
  const isOwner = currentMember.role === 'owner'
  const [tab, setTab] = useState('shops')
  const [form, setForm] = useState(EMPTY_FORM)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef(null)

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
    setSuccessMsg('')
  }

  const pickImage = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((e) => ({ ...e, image: 'รองรับไฟล์รูปภาพ PNG, JPG, JPEG หรือ WebP' }))
      return
    }
    setErrors((e) => ({ ...e, image: undefined }))
    setForm((f) => ({ ...f, image: file }))
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setForm((f) => ({ ...f, image: null }))
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'กรุณากรอกชื่อร้าน'
    else if (form.name.trim().length > LIMITS.name) next.name = `ชื่อร้านต้องไม่เกิน ${LIMITS.name} ตัวอักษร`

    if (!form.signature_menu.trim()) next.signature_menu = 'กรุณากรอกเมนูเด็ด'
    else if (form.signature_menu.trim().length > LIMITS.signature_menu) next.signature_menu = `เมนูเด็ดต้องไม่เกิน ${LIMITS.signature_menu} ตัวอักษร`

    // Story is strictly required for "เรื่องเล่า", optional note for general shops
    if (form.shop_type === 'story') {
      if (!form.story.trim()) next.story = 'กรุณาเล่าเรื่องร้าน (ความผูกพันและผลกระทบจากรถไฟฟ้า)'
      else if (form.story.trim().length > LIMITS.story) next.story = `เรื่องเล่าต้องไม่เกิน ${LIMITS.story} ตัวอักษร`

      if (!form.video?.trim()) next.video = 'กรุณาระบุลิงก์หรือไฟล์วิดีโอเรื่องเล่า'
    } else {
      if (form.story.trim().length > LIMITS.story) next.story = `คำอธิบายต้องไม่เกิน ${LIMITS.story} ตัวอักษร`
    }

    const link = form.map_link.trim()
    if (!link) next.map_link = 'กรุณาใส่ลิงก์ Google Maps'
    else if (!/^https:\/\//i.test(link)) next.map_link = 'ลิงก์ต้องขึ้นต้นด้วย https://'
    else if (!/(maps\.app\.goo\.gl|google\.[a-z.]+\/maps)/i.test(link)) next.map_link = 'กรุณาใส่ลิงก์ Google Maps ที่ถูกต้อง'

    return next
  }

  const submit = (e) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).some((k) => nextErrors[k])) return

    const isStory = form.shop_type === 'story'
    const finalImage = imagePreview || (form.imageUrl?.trim() || null)

    const payload = {
      name: form.name.trim(),
      image: finalImage,
      video: isStory ? (form.video?.trim() || null) : null,
      video_duration: isStory ? (form.video_duration?.trim() || '2:00') : null,
      category: form.category?.trim() || (isStory ? 'ของหวานโบราณ' : 'คาเฟ่'),
      signature_menu: form.signature_menu.trim(),
      story: form.story.trim(),
      map_link: form.map_link.trim(),
      personas: ['sweet', 'street', 'chill', 'healthy'],
    }

    if (editingId) {
      onUpdateShop(editingId, payload)
      setSuccessMsg('✏️ แก้ไขข้อมูลร้านเรียบร้อยแล้ว')
    } else {
      onAddShop(payload)
      setSuccessMsg(isStory ? '🎉 เพิ่มเรื่องเล่าตลาดพลูเรียบร้อยแล้ว' : '🎉 เพิ่มร้านในหน้าร้านทั้งหมดเรียบร้อยแล้ว')
    }

    resetForm()
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setImagePreview(null)
    setEditingId(null)
    setErrors({})
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const startEdit = (shop) => {
    setEditingId(shop.id)
    setSuccessMsg('')
    setErrors({})
    setImagePreview(null)
    setForm({
      shop_type: shop.video ? 'story' : 'all_shops',
      name: shop.name || '',
      image: null,
      imageUrl: shop.image || '',
      video: shop.video || '',
      video_duration: shop.video_duration || '2:00',
      category: shop.category || 'ของหวานโบราณ',
      signature_menu: shop.signature_menu || '',
      story: shop.story || '',
      map_link: shop.map_link || '',
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
    setTab('shops')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = (shop) => {
    if (window.confirm(`ลบร้าน "${shop.name}" ออกจากระบบ?`)) {
      onDeleteShop(shop.id)
      if (editingId === shop.id) resetForm()
    }
  }

  return (
    <section className="animate-view mx-auto max-w-3xl px-4 pb-32 pt-5">
      {/* Banner */}
      <div className="mb-5 rounded-[28px] bg-gradient-to-br from-brown-700 to-terracotta-600 p-5 text-cream-50 shadow-bento">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Video className="h-5 w-5 text-mustard-300" aria-hidden="true" /> แดชบอร์ดผู้ดูแล
        </h2>
        <p className="mt-0.5 text-xs font-medium text-cream-50/80">
          {currentMember.name} · {isOwner ? 'เจ้าของทีม (สิทธิ์เต็ม)' : 'ผู้ดูแลร่วม'}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('shops')}
          className={`rounded-full px-5 py-2.5 text-xs font-bold transition active:scale-95 ${
            tab === 'shops' ? 'bg-brown-700 text-cream-50 shadow-bento-sm' : 'bg-white text-brown-500 shadow-bento-sm hover:bg-sand-100'
          }`}
        >
          🍜 จัดการร้านค้า
        </button>
        <button
          type="button"
          onClick={() => setTab('team')}
          className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold transition active:scale-95 ${
            tab === 'team' ? 'bg-brown-700 text-cream-50 shadow-bento-sm' : 'bg-white text-brown-500 shadow-bento-sm hover:bg-sand-100'
          }`}
        >
          <Users className="h-3.5 w-3.5" aria-hidden="true" /> ทีมงาน
        </button>
      </div>

      {tab === 'team' ? (
        <TeamPanel
          team={team}
          currentMember={currentMember}
          onApprove={onApprove}
          onReject={onReject}
          onRemoveMember={onRemoveMember}
          onResetTeam={onResetTeam}
          onRefresh={onRefreshTeam}
          onOpenInvite={onOpenInvite}
        />
      ) : (
        <>
          {/* ── Add / Edit form ── */}
          <form onSubmit={submit} className="mb-6 rounded-[28px] bg-white p-5 shadow-bento border border-sand-100">
            <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-brown-900">
              {editingId ? (
                <Pencil className="h-4 w-4 text-terracotta-500" aria-hidden="true" />
              ) : (
                <PlusCircle className="h-4 w-4 text-terracotta-500" aria-hidden="true" />
              )}
              {editingId ? 'แก้ไขข้อมูลร้าน' : 'เพิ่มร้านใหม่เข้าระบบ'}
            </h3>

            {/* ── Shop Type Switcher (1. เรื่องเล่า vs 2. ร้านทั้งหมด) ── */}
            <div className="mb-5 rounded-2xl bg-sand-50 p-2 border border-sand-200">
              <label className="block text-xs font-bold text-brown-800 mb-2 pl-1">
                📍 เลือกรูปแบบที่ต้องการเพิ่ม:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setField('shop_type', 'story')}
                  className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition ${
                    form.shop_type === 'story'
                      ? 'bg-brown-800 text-cream-50 shadow-bento-sm'
                      : 'bg-white text-brown-700 hover:bg-sand-100'
                  }`}
                >
                  <Film className={`h-5 w-5 shrink-0 ${form.shop_type === 'story' ? 'text-mustard-300' : 'text-terracotta-500'}`} />
                  <div>
                    <p className="text-xs font-bold">1. เพิ่มเรื่องเล่าตลาดพลู</p>
                    <p className={`text-[10px] ${form.shop_type === 'story' ? 'text-cream-50/75' : 'text-brown-400'}`}>
                      ร้านที่มีคลิปวิดีโอ & เรื่องราว
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setField('shop_type', 'all_shops')}
                  className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition ${
                    form.shop_type === 'all_shops'
                      ? 'bg-terracotta-500 text-white shadow-bento-sm'
                      : 'bg-white text-brown-700 hover:bg-sand-100'
                  }`}
                >
                  <Store className={`h-5 w-5 shrink-0 ${form.shop_type === 'all_shops' ? 'text-white' : 'text-terracotta-500'}`} />
                  <div>
                    <p className="text-xs font-bold">2. เพิ่มใน "ร้านทั้งหมด"</p>
                    <p className={`text-[10px] ${form.shop_type === 'all_shops' ? 'text-white/80' : 'text-brown-400'}`}>
                      พิกัด Google Maps ทั่วไป
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Shop name — max 50 */}
              <Field label="ชื่อร้าน" hint={`สูงสุด ${LIMITS.name} ตัวอักษร`} error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  maxLength={LIMITS.name}
                  placeholder={form.shop_type === 'story' ? 'เช่น ร้านน้ำแข็งใส นิอ่าง' : 'เช่น Jann Cafe'}
                  className={inputClass(errors.name)}
                />
              </Field>

              {/* Category */}
              <Field label="หมวดหมู่ร้าน" hint="เช่น คาเฟ่, ของหวานโบราณ, ร้านอาหารในตำนาน">
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  placeholder="เช่น คาเฟ่"
                  className={inputClass(null)}
                />
              </Field>

              {/* Signature menu — max 100 */}
              <Field label="เมนูเด็ดประจำร้าน" hint={`สูงสุด ${LIMITS.signature_menu} ตัวอักษร`} error={errors.signature_menu}>
                <input
                  type="text"
                  value={form.signature_menu}
                  onChange={(e) => setField('signature_menu', e.target.value)}
                  maxLength={LIMITS.signature_menu}
                  placeholder="เช่น น้ำแข็งใสไข่แข็ง, Dirty Coffee, หมี่กรอบโบราณ"
                  className={inputClass(errors.signature_menu)}
                />
              </Field>

              {/* Video fields ONLY for 'story' type */}
              {form.shop_type === 'story' && (
                <div className="rounded-2xl bg-warm-50/70 p-3.5 border border-warm-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-terracotta-500" />
                    <span className="text-xs font-bold text-brown-900">การตั้งค่าวิดีโอเรื่องเล่า</span>
                  </div>

                  <Field label="ลิงก์ไฟล์วิดีโอ (Video URL)" hint="ไฟล์ .mp4 หรือคลิปสั้น" error={errors.video}>
                    <input
                      type="text"
                      value={form.video}
                      onChange={(e) => setField('video', e.target.value)}
                      placeholder="/videos/talat-phlu-story.mp4 หรือ https://.../video.mp4"
                      className={inputClass(errors.video)}
                    />
                  </Field>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-brown-600 shrink-0">⏱️ ความยาวคลิป:</span>
                    <input
                      type="text"
                      value={form.video_duration}
                      onChange={(e) => setField('video_duration', e.target.value)}
                      placeholder="เช่น 2:05"
                      className="w-24 rounded-xl border border-sand-200 bg-white px-3 py-1.5 text-xs font-bold text-brown-800"
                    />
                  </div>
                </div>
              )}

              {/* Cover Image — Real photo or Google Maps photo (optional, no fake replacement) */}
              <Field
                label={form.shop_type === 'story' ? 'ภาพหน้าปก / โปสเตอร์วิดีโอ' : 'ภาพหน้าปกจาก Google Maps (ไม่บังคับ)'}
                hint="ใส่เฉพาะภาพจริงจาก Maps หรืออัปโหลดภาพจริง (หากไม่มีให้เว้นว่างไว้)"
                error={errors.image}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brown-200 bg-sand-100 px-4 py-3 text-xs sm:text-sm font-bold text-brown-600 transition hover:border-warm-400 hover:bg-warm-100">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => pickImage(e.target.files?.[0])}
                      />
                      📁 เลือกไฟล์รูปภาพจริง (PNG, JPG, WebP)
                    </label>
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="ตัวอย่างรูปร้าน"
                          className="h-14 w-20 rounded-2xl object-cover shadow-bento-sm"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta-500 text-white shadow-bento-sm"
                          aria-label="ลบรูปที่เลือก"
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setField('imageUrl', e.target.value)}
                    placeholder="หรือวางลิงก์รูปจริงจาก Google Maps (https://...)"
                    className={inputClass(null, 'text-xs')}
                  />
                </div>
              </Field>

              {/* Story / Description */}
              <Field
                label={form.shop_type === 'story' ? 'เรื่องเล่าร้าน (ประวัติร้านและผลกระทบรถไฟฟ้า)' : 'คำอธิบาย / รายละเอียดที่อยู่ (ไม่บังคับ)'}
                hint={`สูงสุด ${LIMITS.story} ตัวอักษร`}
                error={errors.story}
              >
                <textarea
                  rows={3}
                  value={form.story}
                  onChange={(e) => setField('story', e.target.value)}
                  maxLength={LIMITS.story}
                  placeholder={
                    form.shop_type === 'story'
                      ? 'เล่าเรื่องราวร้าน ประวัติการเปิด และวิธีที่ร้านผ่านการก่อสร้างรถไฟฟ้ามา...'
                      : 'ระบุบรรยากาศร้าน ข้อมูลที่ตั้ง หรือจุดสังเกต...'
                  }
                  className={inputClass(errors.story, 'resize-none leading-relaxed')}
                />
              </Field>

              {/* Map link — URL */}
              <Field label="ลิงก์ Google Maps (เปิดนำทาง)" hint="https://maps.app.goo.gl/... หรือ google.com/maps" error={errors.map_link}>
                <input
                  type="url"
                  value={form.map_link}
                  onChange={(e) => setField('map_link', e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className={inputClass(errors.map_link)}
                />
              </Field>
            </div>

            {successMsg && (
              <p className="animate-pop mt-4 flex items-center gap-1.5 rounded-2xl bg-sage-100 px-4 py-3 text-xs font-bold text-brown-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-sage-500" aria-hidden="true" /> {successMsg}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[40px] bg-terracotta-500 py-3.5 text-sm font-bold text-white shadow-bento transition hover:bg-terracotta-600 active:scale-[0.97]"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {editingId
                  ? 'บันทึกการแก้ไข'
                  : form.shop_type === 'story'
                  ? 'เพิ่มเข้าสู่ "เรื่องเล่าตลาดพลู"'
                  : 'เพิ่มเข้าสู่ "ร้านทั้งหมด"'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-[40px] bg-sand-100 px-5 py-3.5 text-sm font-bold text-brown-500 transition hover:bg-sand-200 active:scale-95"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </form>

          {/* ── Existing shops list ── */}
          <div className="rounded-[28px] bg-white p-5 shadow-bento border border-sand-100">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-brown-900">ร้านค้าทั้งหมดในระบบ</h3>
                <p className="text-xs text-brown-400">แยกตามหมวดหมู่เรื่องเล่าและร้านค้าทั่วไป</p>
              </div>
              <span className="rounded-full bg-terracotta-100 px-3 py-1 text-xs font-bold text-terracotta-600">
                {shops.length} ร้าน
              </span>
            </div>

            <div className="space-y-3">
              {shops.map((shop) => (
                <div key={shop.id} className="flex items-center gap-3 rounded-2xl bg-cream-50 p-3.5 shadow-bento-sm border border-sand-100">
                  {/* Thumbnail or Map Pin Badge */}
                  {shop.image ? (
                    <img
                      src={shop.image}
                      alt=""
                      className="h-14 w-16 sm:w-20 shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-sand-200/60 text-brown-600">
                      <MapPin className="h-5 w-5 text-terracotta-500 mb-0.5" />
                      <span className="text-[9px] font-bold">Maps</span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <p className="truncate text-sm font-bold text-brown-900">{shop.name}</p>
                      {shop.video ? (
                        <span className="rounded-full bg-warm-100 px-2 py-0.5 text-[9px] font-extrabold text-warm-700">
                          🎬 เรื่องเล่า
                        </span>
                      ) : (
                        <span className="rounded-full bg-sand-200 px-2 py-0.5 text-[9px] font-extrabold text-brown-600">
                          🗺️ ร้านทั้งหมด
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] font-medium text-brown-500">{shop.signature_menu}</p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-brown-400">
                      <span>หมวด: {shop.category}</span>
                      {shop.video && (
                        <span>👍 {shop.likes || 0} · 👎 {shop.dislikes || 0}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(shop)}
                      className="flex items-center gap-1 rounded-[40px] bg-sand-100 px-3 py-1.5 text-[11px] font-bold text-brown-700 transition hover:bg-sand-200 active:scale-95"
                    >
                      <Pencil className="h-3 w-3" aria-hidden="true" /> แก้ไข
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(shop)}
                      className="flex items-center gap-1 rounded-[40px] bg-terracotta-100 px-3 py-1.5 text-[11px] font-bold text-terracotta-600 transition hover:bg-terracotta-300/40 active:scale-95"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" /> ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

const inputClass = (error, extra = '') =>
  `w-full rounded-xl border bg-sand-100 px-4 py-3 text-sm font-semibold text-brown-900 outline-none transition placeholder:font-normal placeholder:text-brown-300 ${
    error ? 'border-terracotta-400 focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/30' : 'border-sand-200 focus:border-warm-400 focus:ring-2 focus:ring-warm-400/30'
  } ${extra}`

function Field({ label, hint, error, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-sm font-bold text-brown-900">{label}</label>
        {hint && <span className="shrink-0 text-[11px] font-medium text-brown-300">{hint}</span>}
      </div>
      {children}
      {error && <p className="animate-pop mt-1.5 text-xs font-bold text-terracotta-600">⚠️ {error}</p>}
    </div>
  )
}
