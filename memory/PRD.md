# E1 Utility Suite - PRD

## Original Problem Statement
Crear una app de utilidades con diseño oscuro y colores que destaquen, con las siguientes herramientas:
- Generador de códigos QR
- Editor de texto a HTML
- Generador de shortlinks
- Conversor de imágenes a WebP en lotes

## User Choices
- QR Generator: URLs, texto, emails, teléfonos, WiFi + personalización de colores
- Shortlinks funcionales con MongoDB
- Conversor WebP: máximo 10 imágenes, 5MB cada una
- Extras: Generador de contraseñas, contador de palabras, Base64

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Design**: Bio-Digital Noir theme (dark with neon accents)

## What's Been Implemented (Jan 2026)
1. ✅ QR Generator - All content types + color customization
2. ✅ URL Shortener - Full CRUD with click tracking
3. ✅ Image to WebP Converter - Batch processing + ZIP download
4. ✅ Text to HTML - Basic + Markdown conversion
5. ✅ Password Generator - Customizable with strength meter
6. ✅ Word Counter - Real-time stats
7. ✅ Base64 Encoder/Decoder - Bidirectional

## Core Requirements
- Dark theme with neon green/cyan/purple accents
- Responsive sidebar navigation
- All utilities functional without authentication
- MongoDB persistence for shortlinks

## Prioritized Backlog
### P0 (Critical)
- All core features implemented ✅

### P1 (High Value)
- [ ] Add QR code logo embedding
- [ ] SVG download option for QR
- [ ] Custom domains for shortlinks

### P2 (Nice to Have)
- [ ] User accounts for saving data
- [ ] API rate limiting
- [ ] Analytics dashboard
- [ ] Export history

## Next Tasks
1. Consider adding QR logo embedding feature
2. Add analytics for shortlink clicks over time
3. Consider batch text-to-HTML for multiple files
