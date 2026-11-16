// Cấu hình công khai cho MassGames. Khóa publishable an toàn để đưa lên frontend;
// bảo mật dựa vào Row Level Security trong Supabase, không phụ thuộc vào việc giấu khóa.
window.MASSGAMES_CONFIG = {
  SUPABASE_URL: 'https://twskciznnzyubvymwvls.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_UfBlCVEnBfO5h9Am-jF38g_tRgJeNbO',
  PAGE_SIZE: 24,
  CATEGORIES: {
    'chien-thuat': 'Chiến thuật',
    'hanh-dong': 'Hành động',
    'giai-ma': 'Giải đố',
    'dua-xe': 'Đua xe',
    'the-thao': 'Thể thao',
    'khac': 'Khác'
  }
};
