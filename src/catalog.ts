export type ProductCategory = string

export type Product = {
  id: string
  name: string
  category: ProductCategory
  imageUrl?: string
  shortDescription: string
  description: string
  priceArs: number
  tags?: string[]
}

export const PRODUCTS: Product[] = [
  {
    id: 'serum-vitamina-c',
    name: 'Sérum Vitamina C',
    category: 'Skincare',
    shortDescription: 'Ilumina y unifica el tono.',
    description:
      'Sérum liviano para uso diario. Ayuda a iluminar, mejorar la apariencia de manchas y dejar la piel con aspecto más uniforme. Ideal para incorporar a tu rutina de mañana con protector solar.',
    priceArs: 18900,
    tags: ['iluminación', 'antioxidante'],
  },
  {
    id: 'hidratante-hialuronico',
    name: 'Crema Hidratante con Ácido Hialurónico',
    category: 'Skincare',
    shortDescription: 'Hidratación intensa sin sensación pesada.',
    description:
      'Crema de textura confortable que ayuda a retener la hidratación y mejorar la elasticidad. Recomendada para rutina AM/PM y para todo tipo de piel.',
    priceArs: 21900,
    tags: ['hidratación', 'barrera'],
  },
  {
    id: 'limpiador-suave',
    name: 'Gel Limpiador Suave',
    category: 'Skincare',
    shortDescription: 'Limpieza diaria sin resecar.',
    description:
      'Gel de limpieza ideal para uso diario. Remueve impurezas y deja la piel fresca. Apto para combinar con doble limpieza.',
    priceArs: 14900,
    tags: ['limpieza', 'rutina'],
  },
  {
    id: 'exfoliante-enzimatico',
    name: 'Exfoliante Enzimático',
    category: 'Skincare',
    shortDescription: 'Renueva la piel con suavidad.',
    description:
      'Exfoliación suave para mejorar la textura y el aspecto apagado. Usar 1 a 2 veces por semana según tolerancia.',
    priceArs: 17500,
    tags: ['textura', 'luminosidad'],
  },
  {
    id: 'jabon-avena-miel',
    name: 'Jabón de Avena y Miel',
    category: 'Jabones',
    shortDescription: 'Suave y nutritivo.',
    description:
      'Jabón artesanal con espuma cremosa. Ideal para pieles normales a secas. Deja sensación de suavidad y confort.',
    priceArs: 5900,
    tags: ['suavidad', 'nutritivo'],
  },
  {
    id: 'jabon-carbon-activado',
    name: 'Jabón de Carbón Activado',
    category: 'Jabones',
    shortDescription: 'Purifica y ayuda a controlar el brillo.',
    description:
      'Jabón artesanal pensado para pieles mixtas a grasas. Ayuda a limpiar en profundidad y dejar una sensación fresca.',
    priceArs: 6200,
    tags: ['purificante', 'mixta/grasa'],
  },
  {
    id: 'set-rutina-basica',
    name: 'Set Rutina Básica',
    category: 'Sets',
    shortDescription: 'Limpieza + hidratación para empezar.',
    description:
      'Un combo pensado para quienes quieren comenzar una rutina simple y efectiva. Incluye limpieza e hidratación para uso diario.',
    priceArs: 32900,
    tags: ['combo', 'rutina'],
  },
  {
    id: 'set-spa-jabones',
    name: 'Set Spa de Jabones',
    category: 'Sets',
    shortDescription: 'Aroma y cuidado para tu momento relax.',
    description:
      'Selección de jabones para regalar o regalarte. Una opción ideal para sumar cuidado corporal a tu rutina.',
    priceArs: 16900,
    tags: ['regalo', 'spa'],
  },
]

export const PRODUCT_BY_ID = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p] as const),
)

export function formatArs(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}
