export const PAYMENT_DETAILS = {
  mpesa: { number: "84 887 3489", name: "QUELTON M******A" },
  emola: { number: "87 311 9062", name: "QUELTON CESAR CHABUCA MUNALINAIUA" }
};

export const ADMIN_CREDENTIALS = {
  phone: "840000000",
  pass: "ADMIN@SECRET#2026"
};

export type VipLevel = {
  key: string;
  name: string;
  ico: string;
  cost: number;
  tasks: number;
  daily: number;
  perTask: number;
};

export const VIP_LEVELS: VipLevel[] = [
  { key: 'estagiario', name: 'Estagiário', ico: '🌱', cost: 0,     tasks: 1,  daily: 10,   perTask: 10 },
  { key: 'vip1',       name: 'VIP 1',      ico: '⭐', cost: 300,   tasks: 3,  daily: 45,   perTask: 15 },
  { key: 'vip2',       name: 'VIP 2',      ico: '💫', cost: 800,   tasks: 5,  daily: 125,  perTask: 25 },
  { key: 'vip3',       name: 'VIP 3',      ico: '💎', cost: 2000,  tasks: 8,  daily: 320,  perTask: 40 },
  { key: 'vip4',       name: 'VIP 4',      ico: '🏆', cost: 5000,  tasks: 10, daily: 650,  perTask: 65 },
  { key: 'vip5',       name: 'VIP 5',      ico: '👑', cost: 12000, tasks: 12, daily: 1200, perTask: 100 },
  { key: 'vip6',       name: 'VIP 6',      ico: '💠', cost: 25000, tasks: 15, daily: 2250, perTask: 150 },
];

export type FashionLook = {
  id: string;
  img: string;
  name: string;
  desc: string;
  question: string;
};

// Perguntas rotativas para variar
export const LOOK_QUESTIONS = [
  "Gostas deste look?",
  "Aprovarias este estilo?",
  "Este outfit está na moda?",
  "Usarias este look?",
  "Este estilo é elegante?",
  "Comprarias esta peça?",
  "Este look combina contigo?",
  "Está na tendência actual?",
];

export const FASHION_LOOKS: FashionLook[] = [
  // Vestidos & Feminino
  { id: '1',  img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', name: 'Vestido Floral Midi', desc: 'Look leve e feminino, perfeito para dias quentes.', question: 'Gostas deste look?' },
  { id: '2',  img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80', name: 'Conjunto Casual Chic', desc: 'Elegância descontraída para o dia a dia.', question: 'Aprovarias este estilo?' },
  { id: '3',  img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80', name: 'Vestido de Noite', desc: 'Sofisticação para ocasiões especiais.', question: 'Usarias este look?' },
  { id: '4',  img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', name: 'Look Urbano Feminino', desc: 'Estilo moderno para a cidade.', question: 'Este outfit está na moda?' },
  { id: '5',  img: 'https://images.unsplash.com/photo-1475180429745-5f46bb5b1c62?w=600&q=80', name: 'Blazer & Calças', desc: 'Elegância profissional com toque moderno.', question: 'Este look combina contigo?' },
  { id: '6',  img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', name: 'Vestido Boho', desc: 'Estilo bohemio com leveza e fluidez.', question: 'Gostas deste look?' },
  { id: '7',  img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', name: 'Conjunto Primavera', desc: 'Cores vibrantes para a nova estação.', question: 'Aprovarias este estilo?' },
  { id: '8',  img: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80', name: 'Trench Coat Clássico', desc: 'Peça atemporal que nunca sai de moda.', question: 'Comprarias esta peça?' },
  { id: '9',  img: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&q=80', name: 'Mini Vestido', desc: 'Youthful e dinâmico para qualquer ocasião.', question: 'Usarias este look?' },
  { id: '10', img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80', name: 'Look Monocromático', desc: 'Sofisticação em tons únicos.', question: 'Este estilo é elegante?' },

  // Streetwear & Casual
  { id: '11', img: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=600&q=80', name: 'Streetwear Premium', desc: 'Urban style com materiais de qualidade.', question: 'Este outfit está na moda?' },
  { id: '12', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80', name: 'Look Masculino Casual', desc: 'Conforto e estilo para o homem moderno.', question: 'Gostas deste look?' },
  { id: '13', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', name: 'Outfit Desportivo', desc: 'Activewear com design fashion.', question: 'Aprovarias este estilo?' },
  { id: '14', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80', name: 'Denim Total Look', desc: 'Jeans do início ao fim — tendência forte.', question: 'Comprarias esta peça?' },
  { id: '15', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80', name: 'Hoodie & Sneakers', desc: 'Conforto máximo com estilo urbano.', question: 'Este look combina contigo?' },
  { id: '16', img: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80', name: 'Look Oversize', desc: 'Tendência oversized com cortes estruturados.', question: 'Usarias este look?' },
  { id: '17', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80', name: 'Outfit Verão Masculino', desc: 'Leveza e estilo para dias quentes.', question: 'Este estilo é elegante?' },
  { id: '18', img: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&q=80', name: 'Conjunto Athleisure', desc: 'Do ginásio para a rua com estilo.', question: 'Este outfit está na moda?' },

  // Alta Costura & Elegante
  { id: '19', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80', name: 'Vestido de Gala', desc: 'Elegância máxima para grandes momentos.', question: 'Gostas deste look?' },
  { id: '20', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80', name: 'Haute Couture', desc: 'Alta costura que inspira e deslumbra.', question: 'Aprovarias este estilo?' },
  { id: '21', img: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80', name: 'Look Red Carpet', desc: 'Glamour digno de tapete vermelho.', question: 'Comprarias esta peça?' },
  { id: '22', img: 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&q=80', name: 'Fato Premium', desc: 'Alfaiataria perfeita para homem de estilo.', question: 'Este look combina contigo?' },
  { id: '23', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', name: 'Vestido Sereia', desc: 'Curvas realçadas com elegância total.', question: 'Este estilo é elegante?' },
  { id: '24', img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80', name: 'Look Romántico', desc: 'Feminilidade e romantismo em cada detalhe.', question: 'Usarias este look?' },
  { id: '25', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80', name: 'Conjunto Satin', desc: 'Luxo e suavidade em tons vibrantes.', question: 'Este outfit está na moda?' },

  // Acessórios & Detalhes
  { id: '26', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', name: 'Sneakers Exclusivos', desc: 'Calçado que define o look completo.', question: 'Gostas deste look?' },
  { id: '27', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', name: 'Bolsa de Luxo', desc: 'Acessório statement para qualquer ocasião.', question: 'Comprarias esta peça?' },
  { id: '28', img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80', name: 'Look com Chapéu', desc: 'O chapéu como peça central do look.', question: 'Aprovarias este estilo?' },
  { id: '29', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', name: 'Óculos Statement', desc: 'Acessório que transforma qualquer look.', question: 'Este estilo é elegante?' },
  { id: '30', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80', name: 'Jóias & Look', desc: 'Detalhes dourados que fazem a diferença.', question: 'Usarias este look?' },

  // Moda Africana & Local
  { id: '31', img: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=600&q=80', name: 'Capulana Moderna', desc: 'Fusão de tradição africana com design contemporâneo.', question: 'Gostas deste look?' },
  { id: '32', img: 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=600&q=80', name: 'Ankara Print', desc: 'Estampas africanas com corte moderno.', question: 'Este outfit está na moda?' },
  { id: '33', img: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&q=80', name: 'Look Afrofuturista', desc: 'Raízes africanas com visão do futuro.', question: 'Aprovarias este estilo?' },
  { id: '34', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80', name: 'Dashiki Estilizado', desc: 'Peça tradicional com twist contemporâneo.', question: 'Comprarias esta peça?' },

  // Outono/Inverno
  { id: '35', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80', name: 'Casaco de Lã', desc: 'Elegância e calor para dias frios.', question: 'Este look combina contigo?' },
  { id: '36', img: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=600&q=80', name: 'Look Layering', desc: 'Arte de combinar camadas com estilo.', question: 'Usarias este look?' },
  { id: '37', img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80', name: 'Tons Terrosos', desc: 'Paleta outonal com elegância natural.', question: 'Este estilo é elegante?' },
  { id: '38', img: 'https://images.unsplash.com/photo-1475180429745-5f46bb5b1c62?w=600&q=80', name: 'Casaco Oversized', desc: 'Conforto com personalidade forte.', question: 'Gostas deste look?' },
  { id: '39', img: 'https://images.unsplash.com/photo-1546961342-ea5f62d7b69a?w=600&q=80', name: 'Xadrez Clássico', desc: 'Padrão atemporal em look moderno.', question: 'Aprovarias este estilo?' },
  { id: '40', img: 'https://images.unsplash.com/photo-1562572159-4efd90232b4b?w=600&q=80', name: 'Conjunto Camisola', desc: 'Knitwear elegante para todas as ocasiões.', question: 'Este outfit está na moda?' },
];
