const fs = require('fs');

let content = fs.readFileSync('attached_assets/Pasted--doctype-html-html-lang-en-head-meta-charset-UTF-8-meta_1772067532954.txt', 'utf-8');

const whatsappCss = `
    /* WHATSAPP FLOATING BUTTON */
    .whatsapp-float {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: #25D366;
      color: white;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .whatsapp-float:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
    }
    .whatsapp-float svg {
      width: 32px;
      height: 32px;
      fill: currentColor;
    }
  </style>
`;
content = content.replace('</style>', whatsappCss);

const navInsta = `<nav class="navlinks">
      <a href="#offers">Offers</a>
      <a href="#fit">Fit</a>
      <a href="#process">Process</a>
      <a href="#about">About</a>
      <!-- Instagram Link Placeholder -->
      <a href="YOUR_INSTAGRAM_LINK_HERE" target="_blank" aria-label="Instagram">
        <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:currentColor; margin-top:2px;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a>
    </nav>`;
content = content.replace(/<nav class="navlinks">[\s\S]*?<\/nav>/, navInsta);

const footerOrig = `<footer>
    <div class="footerBrand">The Method Co.</div>
    <div>© <span id="year"></span> — Dublin, Ireland</div>
    <div>Built for clarity. Not noise.</div>
  </footer>`;
const footerNew = `<footer>
    <div class="footerBrand">The Method Co.</div>
    <div style="display:flex; align-items:center; gap: 16px;">
      <!-- Instagram Link Placeholder -->
      <a href="YOUR_INSTAGRAM_LINK_HERE" target="_blank" aria-label="Instagram">
        <svg viewBox="0 0 24 24" style="width:18px; height:18px; fill:currentColor;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a>
      <a href="mailto:YOUR_EMAIL_HERE" style="text-decoration:underline; color:var(--text);">YOUR_EMAIL_HERE</a>
    </div>
    <div>© <span id="year"></span> — Dublin, Ireland</div>
    <div>Built for clarity. Not noise.</div>
  </footer>`;
content = content.replace(footerOrig, footerNew);

const whatsappHtml = `
<!-- WhatsApp Floating Button Placeholder -->
<a href="YOUR_WHATSAPP_LINK_HERE" class="whatsapp-float" target="_blank" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 24 24">
    <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.146.564 4.237 1.636 6.082L.006 24l6.02-1.58A11.968 11.968 0 0 0 12.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 22.016c-1.815 0-3.593-.467-5.15-1.353l-.37-.218-3.823 1.002 1.022-3.73-.24-.38A10.024 10.024 0 0 1 1.984 12.03c0-5.542 4.512-10.054 10.047-10.054 5.535 0 10.046 4.512 10.046 10.054 0 5.542-4.511 10.054-10.046 10.054zm5.513-7.535c-.302-.152-1.788-.88-2.065-.98-.276-.102-.478-.152-.678.152-.201.302-.782.98-.958 1.181-.176.202-.352.228-.654.076-.302-.152-1.275-.469-2.43-1.32-.898-.66-1.503-1.474-1.68-1.776-.176-.302-.019-.465.132-.616.135-.135.302-.352.453-.528.151-.176.201-.302.302-.503.1-.202.05-.378-.025-.528-.076-.152-.678-1.634-.929-2.24-.243-.591-.491-.51-.678-.52-.176-.009-.378-.009-.578-.009-.2 0-.528.076-.805.378-.276.302-1.056 1.03-1.056 2.515s1.082 2.918 1.233 3.12c.151.202 2.13 3.251 5.156 4.557.72.311 1.282.497 1.722.636.723.23 1.382.197 1.902.12.584-.087 1.788-.731 2.039-1.436.251-.706.251-1.312.176-1.437-.076-.126-.276-.202-.578-.353z"/>
  </svg>
</a>

<script>
`;
content = content.replace('<script>', whatsappHtml);

fs.writeFileSync('client/index.html', content);
