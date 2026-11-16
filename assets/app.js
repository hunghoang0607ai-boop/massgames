(function () {
  const cfg = window.MASSGAMES_CONFIG;
  const { createClient } = window.supabase;
  const db = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY);

  const grid = document.getElementById('grid');
  const status = document.getElementById('status');
  const more = document.getElementById('more');
  const q = document.getElementById('q');
  const cat = document.getElementById('cat');

  let page = 0;
  let loading = false;
  let debounceId = null;

  // Đổ danh sách thể loại vào ô lọc
  Object.entries(cfg.CATEGORIES).forEach(([value, label]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    cat.appendChild(opt);
  });

  function setStatus(text, isErr) {
    status.textContent = text || '';
    status.classList.toggle('err', !!isErr);
  }

  // Tạo thẻ game bằng textContent để tránh chèn HTML từ dữ liệu
  function buildCard(g) {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = g.entry_path;
    a.addEventListener('click', () => {
      // Đếm lượt chơi, không chặn việc chuyển trang nếu lỗi
      db.rpc('increment_plays', { p_slug: g.slug }).then(() => {}, () => {});
    });

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    if (g.thumbnail_url) {
      const img = document.createElement('img');
      img.src = g.thumbnail_url;
      img.alt = '';
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else {
      thumb.textContent = '🎮';
    }

    const body = document.createElement('div');
    body.className = 'body';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = g.title;

    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = g.description || '';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = cfg.CATEGORIES[g.category] || 'Khác';
    const plays = document.createElement('span');
    plays.textContent = '▶ ' + (g.plays || 0).toLocaleString('vi-VN');
    meta.append(tag, plays);

    body.append(title, desc, meta);
    a.append(thumb, body);
    return a;
  }

  async function load(reset) {
    if (loading) return;
    loading = true;
    if (reset) {
      page = 0;
      grid.innerHTML = '';
      setStatus('Đang tải…');
    }
    more.disabled = true;

    const from = page * cfg.PAGE_SIZE;
    const to = from + cfg.PAGE_SIZE - 1;

    let query = db
      .from('games')
      .select('slug,title,description,category,thumbnail_url,entry_path,plays', { count: 'exact' })
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true })
      .range(from, to);

    const term = q.value.trim();
    if (term) query = query.ilike('title', '%' + term.replace(/[%_]/g, '') + '%');
    if (cat.value) query = query.eq('category', cat.value);

    const { data, error, count } = await query;
    loading = false;
    more.disabled = false;

    if (error) {
      setStatus('Không tải được danh sách game. Thử lại sau.', true);
      console.error(error);
      return;
    }

    data.forEach(g => grid.appendChild(buildCard(g)));
    page++;

    if (grid.children.length === 0) {
      setStatus('Chưa có game nào phù hợp.');
    } else {
      setStatus(`Hiển thị ${grid.children.length} / ${count} game`);
    }
    more.hidden = grid.children.length >= (count || 0);
  }

  q.addEventListener('input', () => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => load(true), 300);
  });
  cat.addEventListener('change', () => load(true));
  more.addEventListener('click', () => load(false));

  load(true);
})();
