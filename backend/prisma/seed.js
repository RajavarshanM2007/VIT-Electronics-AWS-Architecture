const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Transforming platform to VIT: Tech & Smart Gadgets...')

  // 1. UPDATE OR UPSERT ADMIN USER
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vitelectronics.com'
  const rawPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
  const passwordHash = await bcrypt.hash(rawPassword, 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      firstName: 'VIT',
      lastName: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
      passwordHash,
    },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'VIT',
      lastName: 'Admin',
      customerId: 'VIT-00000001',
      role: 'ADMIN',
      emailVerified: true,
    },
  })
  console.log('✅ Admin user updated')

  // 2. UPDATE SITE CONFIGURATION FOR VIT TECH
  await prisma.siteConfig.upsert({
    where: { id: 'main' },
    update: {
      siteTitle: 'VIT ELECTRONICS',
      siteMotto: 'NEXT-GEN TECH & SMART GADGETS',
      colorGold: '#00f0ff',
      colorText: '#1a1a1a',
      colorBg: '#ffffff',
      colorMuted: '#64748b',
      footerTagline: 'Engineering the future. Next-generation gadgets, intelligent hardware & smart technology.',
      footerNote: '© 2026 VIT ELECTRONICS. All rights reserved.',
      invoiceCompanyName: 'VIT ELECTRONICS',
      invoiceFooterText: 'Thank you for choosing VIT Electronics! Keep your order receipt for warranty coverage.',
      whatsappNumber: '918040001234',
      whatsappMessageTemplate: 'Hello VIT Electronics Support, I have an inquiry about a product.',
      homepageSections: [
        {
          id: 'new-arrivals',
          eyebrow: 'Latest Innovations',
          headline: 'Trending Tech & Gadgets',
          isActive: true,
          buttonUrl: '',
          buttonLabel: '',
          description: 'Cutting-edge gadgets just dropped into the VIT hardware ecosystem.'
        },
        {
          id: 'featured',
          eyebrow: 'Flagship Hardware',
          headline: 'Curated Pro Gear',
          isActive: true,
          buttonUrl: '',
          buttonLabel: '',
          description: 'Engineered for power users, creators, and tech enthusiasts.'
        },
        {
          id: 'editorial',
          eyebrow: 'VIT Engineering',
          headline: 'Precision Performance. Pure Innovation.',
          isActive: true,
          buttonUrl: '/collections/smart-devices',
          buttonLabel: 'Explore Devices',
          description: 'Every VIT device is crafted with aerospace-grade materials, custom microchips, and intelligent thermals. Built to redefine the way you live, work, and play.'
        },
        {
          id: 'philosophy',
          eyebrow: 'Our Vision',
          headline: 'Technology Built Without Compromise.',
          isActive: true,
          buttonUrl: '',
          buttonLabel: '',
          description: 'We believe hardware should be powerful, beautiful, and intuitive. From high-fidelity studio acoustics to ultra-portable computing, we build tomorrow.'
        },
        {
          id: 'newsletter',
          eyebrow: 'VIP Tech Access',
          headline: 'Stay Ahead of the Curve',
          isActive: true,
          buttonUrl: '',
          buttonLabel: 'Subscribe',
          description: 'Join the inner circle for exclusive beta drops, hardware launch events, and firmware announcements.'
        }
      ],
      productAccordions: [
        {
          title: 'Technical Specs & Performance',
          content: 'Built with next-gen silicon, high-efficiency GaN thermal architecture, aerospace-grade aluminum casing, and ultra-durable battery cells.'
        },
        {
          title: 'Warranty & Support',
          content: 'Includes 1-Year Comprehensive VIT Hardware Warranty with 24/7 priority customer support and hassle-free replacements.'
        },
        {
          title: 'Express Insured Shipping',
          content: 'Complimentary expedited delivery with end-to-end real-time GPS tracking and tamper-evident packaging.'
        }
      ]
    },
    create: {
      id: 'main',
      siteTitle: 'VIT ELECTRONICS',
      siteMotto: 'NEXT-GEN TECH & SMART GADGETS',
      colorGold: '#00f0ff',
      colorText: '#1a1a1a',
      colorBg: '#ffffff',
      colorMuted: '#64748b',
      footerTagline: 'Engineering the future. Next-generation gadgets, intelligent hardware & smart technology.',
      footerNote: '© 2026 VIT ELECTRONICS. All rights reserved.',
      invoiceCompanyName: 'VIT ELECTRONICS',
      invoiceFooterText: 'Thank you for choosing VIT Electronics! Keep your order receipt for warranty coverage.',
      whatsappNumber: '918040001234',
      whatsappMessageTemplate: 'Hello VIT Electronics Support, I have an inquiry about a product.',
    }
  })
  console.log('✅ Site configuration updated to VIT Electronics')

  // 3. MEDIA CDN / S3 ASSET RESOLVER
  const cdnBase = (
    process.env.NEXT_PUBLIC_CDN_URL ||
    process.env.AWS_CLOUDFRONT_DOMAIN ||
    (process.env.AWS_S3_BUCKET ? `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com` : '') ||
    ''
  ).replace(/\/$/, '')

  // Local dev fallback base — images are served from frontend/public/
  const localBase = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

  function assetUrl(path, fallback) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    if (cdnBase) {
      return `${cdnBase}${cleanPath}`
    }
    // Use local frontend public directory when no CDN is configured
    return `${localBase}${cleanPath}`
  }

  // 4. TECH CATEGORIES
  const techCategories = [
    { name: 'Smart Devices & Audio', slug: 'smart-devices', sortOrder: 1 },
    { name: 'Laptops & Computing',   slug: 'computing',     sortOrder: 2 },
    { name: 'Wearables & Watches',   slug: 'wearables',     sortOrder: 3 },
    { name: 'Smart TVs & Visuals',   slug: 'smart-tvs',     sortOrder: 4 },
    { name: 'Gaming Gear & VR',      slug: 'gaming-gear',   sortOrder: 5 },
    { name: 'Drones & Cameras',      slug: 'drones-cameras',sortOrder: 6 },
    { name: 'GaN Chargers & Power',  slug: 'power-chargers',sortOrder: 7 },
  ]

  const categoryMap = {}
  for (const cat of techCategories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder, isActive: true },
      create: cat,
    })
    categoryMap[cat.slug] = created.id
  }
  console.log('✅ Tech Categories initialized')

  // 5. HOMEPAGE HERO & SCROLL SLIDES (Banners from website-assets/banners/)
  await prisma.homepageSlide.deleteMany()

  const techSlides = [
    {
      mediaUrl: assetUrl('/banners/hero-tech-banner.jpg', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80'),
      mediaType: 'image',
      placement: 'hero',
      textTheme: 'light',
      textPosition: 'center',
      headline: 'NEXT-GEN HARDWARE & SMART GADGETS',
      subheading: 'ENGINEERED FOR POWER USERS & CREATORS',
      linkUrl: '/collections/smart-devices',
      sortOrder: 0,
      isActive: true,
    },
    {
      mediaUrl: assetUrl('/banners/smartphones-backdrop.jpg', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600&auto=format&fit=crop&q=80'),
      mediaType: 'image',
      placement: 'hero',
      textTheme: 'light',
      textPosition: 'center',
      headline: 'VIT PHANTOM CYBERPHONE 5G',
      subheading: 'SNAPDRAGON 8 GEN 3 | 200MP TELEPHOTO | CERAMIC GLASS',
      linkUrl: '/collections/smart-devices',
      sortOrder: 1,
      isActive: true,
    },
    {
      mediaUrl: assetUrl('/banners/audio-backdrop.jpg', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80'),
      mediaType: 'image',
      placement: 'scroll',
      textTheme: 'light',
      textPosition: 'center',
      headline: 'STUDIO-GRADE SPATIAL ACOUSTICS',
      subheading: 'BERYLLIUM DRIVERS WITH 45dB ACTIVE NOISE CANCELLATION',
      linkUrl: '/collections/smart-devices',
      sortOrder: 0,
      isActive: true,
    },
    {
      mediaUrl: assetUrl('/banners/gaming-setup-backdrop.jpg', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1600&auto=format&fit=crop&q=80'),
      mediaType: 'image',
      placement: 'scroll',
      textTheme: 'light',
      textPosition: 'center',
      headline: 'CYBERDECK MECHANICAL & VR GEAR',
      subheading: 'HOT-SWAPPABLE TRI-MODE KEYBOARDS & HIGH REFRESH VR',
      linkUrl: '/collections/gaming-gear',
      sortOrder: 1,
      isActive: true,
    }
  ]

  for (const s of techSlides) {
    await prisma.homepageSlide.create({ data: s })
  }
  console.log('✅ Homepage Tech Slides (Banners) created')

  // 6. FLAGSHIP TECH GADGETS (Pictures from product-images/)
  const techProducts = [
    {
      name: 'VIT TrueAir ANC Wireless Earbuds',
      slug: 'vit-trueair-anc-wireless-earbuds',
      sku: 'VIT-EAR-001',
      description: 'Ergonomic high-fidelity wireless earbuds with hybrid active noise cancelling, LDAC lossless audio codec, transparency pass-through, wireless charging case, and IPX7 sweat and water resistance.',
      shortDesc: 'Lossless LDAC wireless earbuds with 45dB ANC and IPX7 rating.',
      price: 11999.00,
      comparePrice: 14999.00,
      categoryId: categoryMap['smart-devices'],
      brand: 'VIT',
      material: 'Ceramic Composite & Liquid Silicone',
      isFeatured: true,
      images: [
        assetUrl('/products/earbuds.jpg', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'),
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-EAR-001-WHT', color: 'Glacier White', colorHex: '#f8fafc', size: 'Universal', stock: 80 },
        { sku: 'VIT-EAR-001-BLK', color: 'Midnight Black', colorHex: '#0f172a', size: 'Universal', stock: 60 }
      ]
    },
    {
      name: 'VIT ProBook Max 16-inch M3 Computing Workstation',
      slug: 'vit-probook-max-16-workstation',
      sku: 'VIT-LAP-002',
      description: 'Extreme mobile computing workstation boasting a 16.2-inch Liquid Retina XDR 120Hz display, vapor chamber cooling, 32GB Unified RAM, 1TB NVMe Gen4 SSD, and all-day 22-hour battery endurance.',
      shortDesc: '16-inch Liquid Retina XDR workstation for pro creators & developers.',
      price: 189999.00,
      comparePrice: 199999.00,
      categoryId: categoryMap['computing'],
      brand: 'VIT',
      material: 'Recycled Aerospace Aluminum Unibody',
      isFeatured: true,
      images: [
        assetUrl('/products/laptop.jpg', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80'),
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-LAP-002-SPG', color: 'Space Gray', colorHex: '#4b5563', size: '32GB / 1TB', stock: 15 },
        { sku: 'VIT-LAP-002-SIL', color: 'Silver',     colorHex: '#e5e7eb', size: '32GB / 1TB', stock: 20 }
      ]
    },
    {
      name: 'VIT Quantum 65 Cinema 4K OLED Smart TV',
      slug: 'vit-quantum-65-cinema-4k-oled-tv',
      sku: 'VIT-TV-003',
      description: 'Masterpiece 65-inch 4K OLED evo television with infinite contrast, Dolby Vision IQ, Dolby Atmos spatial audio, 144Hz VRR gaming mode, and borderless gallery design.',
      shortDesc: '65-inch 4K Master OLED with 144Hz VRR & Dolby Vision IQ.',
      price: 149999.00,
      comparePrice: 169999.00,
      categoryId: categoryMap['smart-tvs'],
      brand: 'VIT',
      material: 'Titanium-Alloy Bezel & Anti-Reflective Glass',
      isFeatured: true,
      images: [
        assetUrl('/products/oled-tv.jpg', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80'),
        'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-TV-003-65', color: 'Obsidian Black', colorHex: '#101010', size: '65 Inch', stock: 10 }
      ]
    },
    {
      name: 'VIT Aura Spatial Smart Home Speaker',
      slug: 'vit-aura-spatial-smart-speaker',
      sku: 'VIT-SPK-004',
      description: 'Acoustic powerhouse equipped with 360-degree spatial audio, room-sensing calibration, lossless AirPlay 2 and Spotify Connect support, and studio-grade subwoofers in an ambient fabric enclosure.',
      shortDesc: 'Room-sensing 360-degree high-fidelity spatial smart speaker.',
      price: 19999.00,
      comparePrice: 24999.00,
      categoryId: categoryMap['smart-devices'],
      brand: 'VIT',
      material: 'Acoustically Transparent Wool Fabric & Anodized Aluminum',
      isFeatured: true,
      images: [
        assetUrl('/products/smart-speaker.jpg', 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80'),
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-SPK-004-GRY', color: 'Space Slate', colorHex: '#374151', size: 'Standard', stock: 35 },
        { sku: 'VIT-SPK-004-WHT', color: 'Arctic White', colorHex: '#f3f4f6', size: 'Standard', stock: 25 }
      ]
    },
    {
      name: 'VIT Phantom CyberPhone Pro 5G',
      slug: 'vit-phantom-cyberphone-pro-5g',
      sku: 'VIT-PHN-005',
      description: 'Flagship smartphone featuring Snapdragon 8 Gen 3, ceramic rear panel, 6.8-inch Quad HD+ AMOLED 120Hz display, 200MP periscope telephoto camera, and 100W wireless supercharging.',
      shortDesc: 'Snapdragon 8 Gen 3 flagship with 200MP camera & ceramic body.',
      price: 89999.00,
      comparePrice: 99999.00,
      categoryId: categoryMap['smart-devices'],
      brand: 'VIT',
      material: 'Nanocrystal Ceramic & Titanium Frame',
      isFeatured: true,
      images: [
        assetUrl('/products/smartphone.jpg', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'),
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-PHN-005-BLK', color: 'Titanium Obsidian', colorHex: '#18181b', size: '512GB', stock: 25 },
        { sku: 'VIT-PHN-005-CYN', color: 'Cyber Cyan',        colorHex: '#06b6d4', size: '512GB', stock: 20 }
      ]
    },
    {
      name: 'VIT Apex Titan Smartwatch Ultra',
      slug: 'vit-apex-titan-smartwatch-ultra',
      sku: 'VIT-WCH-006',
      description: 'Built for extreme endurance. Aerospace Grade 5 Titanium case, sapphire crystal touchscreen, dual-frequency GPS, comprehensive ECG & SpO2 health sensors, and 14-day battery life.',
      shortDesc: 'Titanium aerospace smartwatch with sapphire crystal display.',
      price: 34999.00,
      comparePrice: 39999.00,
      categoryId: categoryMap['wearables'],
      brand: 'VIT',
      material: 'Aerospace Grade 5 Titanium & Sapphire Crystal',
      isFeatured: true,
      images: [
        assetUrl('/products/smartwatch.jpg', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'),
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-WCH-006-TIT', color: 'Titanium Gray', colorHex: '#707070', size: '49mm', stock: 25 },
        { sku: 'VIT-WCH-006-BLK', color: 'DLC Stealth Black', colorHex: '#151515', size: '49mm', stock: 35 }
      ]
    },
    {
      name: 'VIT Pad Pro 13-inch Liquid Vision Tablet',
      slug: 'vit-pad-pro-13-liquid-vision-tablet',
      sku: 'VIT-TAB-007',
      description: 'Ultra-thin 5.1mm computing tablet powered by high-efficiency silicon, 13-inch tandem OLED display, magnetic stylus charging, Thunderbolt 4 port, and 4-speaker spatial sound.',
      shortDesc: '13-inch Ultra-thin Tandem OLED creative tablet.',
      price: 94999.00,
      comparePrice: 104999.00,
      categoryId: categoryMap['computing'],
      brand: 'VIT',
      material: 'Aerospace Aluminum Alloy',
      isFeatured: true,
      images: [
        assetUrl('/products/tablet.jpg', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80'),
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-TAB-007-SPG', color: 'Space Gray', colorHex: '#3f3f46', size: '256GB WiFi', stock: 30 },
        { sku: 'VIT-TAB-007-SLV', color: 'Silver',     colorHex: '#e4e4e7', size: '256GB WiFi', stock: 20 }
      ]
    },
    {
      name: 'VIT AeroGlide 4K GPS Foldable Drone',
      slug: 'vit-aeroglide-4k-gps-drone',
      sku: 'VIT-DRN-008',
      description: 'Ultra-portable aerial imaging drone equipped with a 3-axis mechanical gimbal, 1/1.3-inch 4K HDR CMOS sensor, 360-degree omnidirectional obstacle sensing, and 45-minute flight time.',
      shortDesc: '4K HDR Gimbal Drone with omnidirectional AI sensing.',
      price: 68999.00,
      comparePrice: 74999.00,
      categoryId: categoryMap['drones-cameras'],
      brand: 'VIT',
      material: 'Carbon Fiber & Polycarbonate',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-DRN-008-COM', color: 'Fly More Combo', colorHex: '#4a5568', size: 'Standard', stock: 18 }
      ]
    },
    {
      name: 'VIT CyberDeck 75% Wireless Mechanical Keyboard',
      slug: 'vit-cyberdeck-75-mechanical-keyboard',
      sku: 'VIT-KBD-009',
      description: 'Premium gasket-mounted custom mechanical keyboard with CNC aluminum chassis, pre-lubed tactile switches, south-facing RGB, built-in customizable smart OLED display screen, and tri-mode 2.4G/BT/Wired connection.',
      shortDesc: 'CNC Aluminum gasket mechanical keyboard with OLED display.',
      price: 15499.00,
      comparePrice: 18999.00,
      categoryId: categoryMap['gaming-gear'],
      brand: 'VIT',
      material: '6063 CNC Aluminum & PBT Keycaps',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-KBD-009-LIN', color: 'Cyber Cyan Linear', colorHex: '#00f0ff', size: '75%', stock: 40 },
        { sku: 'VIT-KBD-009-TAC', color: 'Stealth Tactile',   colorHex: '#222222', size: '75%', stock: 50 }
      ]
    },
    {
      name: 'VIT QuantumGaN 140W Fast Power Station',
      slug: 'vit-quantumgan-140w-fast-charger',
      sku: 'VIT-PWR-010',
      description: 'Ultra-compact Gallium Nitride (GaN III) fast desktop charger with 3x USB-C PD 3.1 and 1x USB-A ports. Capable of charging laptops, phones, and accessories simultaneously at peak wattage.',
      shortDesc: '140W GaN III Fast Power Station with 4 Ports.',
      price: 6999.00,
      comparePrice: 8499.00,
      categoryId: categoryMap['power-chargers'],
      brand: 'VIT',
      material: 'Fireproof Polycarbonate & Copper Heat Spreader',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1609592807664-839f9797d100?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: 'VIT-PWR-010-BLK', color: 'Matte Graphite', colorHex: '#262626', size: '140W', stock: 65 }
      ]
    }
  ]

  for (const prod of techProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } })
    if (existing) {
      await prisma.productImage.deleteMany({ where: { productId: existing.id } })
      await prisma.productVariant.deleteMany({ where: { productId: existing.id } })
      await prisma.product.delete({ where: { id: existing.id } })
    }

    const createdProduct = await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        description: prod.description,
        shortDesc: prod.shortDesc,
        price: prod.price,
        comparePrice: prod.comparePrice,
        categoryId: prod.categoryId,
        brand: prod.brand,
        material: prod.material,
        isFeatured: prod.isFeatured,
        isActive: true,
      }
    })

    // Create Variants
    for (const v of prod.variants) {
      await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          sku: v.sku,
          color: v.color,
          colorHex: v.colorHex,
          size: v.size,
          stock: v.stock,
          price: prod.price,
          isActive: true,
        }
      })
    }

    // Create Images
    for (let i = 0; i < prod.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: prod.images[i],
          altText: `${prod.name} - View ${i + 1}`,
          sortOrder: i,
        }
      })
    }
  }

  console.log(`✅ ${techProducts.length} Flagship Tech Products & Gadgets Seeded!`)
  console.log('🎉 VIT Tech & Gadget Platform is Ready!')
}

main()
  .catch((e) => {
    console.error('❌ Failed to seed VIT Tech:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
