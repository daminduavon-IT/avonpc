async function extractColors() {
  try {
    const res = await fetch('https://avonpc.com/');
    const html = await res.text();
    
    // Find all stylesheet links
    const cssLinks = [];
    const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      let url = match[1];
      if (url.startsWith('/')) {
        url = 'https://avonpc.com' + url;
      }
      cssLinks.push(url);
    }
    
    console.log('CSS Links:', cssLinks);
    
    // Find inline colors in HTML
    let colors = new Set();
    const hexRegex = /#([0-9a-fA-F]{3,6})\b/g;
    let m;
    while ((m = hexRegex.exec(html)) !== null) {
      colors.add(m[0].toLowerCase());
    }
    
    // Fetch CSS files and extract colors
    for (const link of cssLinks) {
       if (!link.startsWith('http')) continue;
       try {
         const cssRes = await fetch(link);
         const cssText = await cssRes.text();
         while ((m = hexRegex.exec(cssText)) !== null) {
           colors.add(m[0].toLowerCase());
         }
         
         // extract rgba/rgb
         const rgbRegex = /rgba?\([^)]+\)/g;
         while ((m = rgbRegex.exec(cssText)) !== null) {
           colors.add(m[0].toLowerCase());
         }
       } catch(e) {}
    }
    
    console.log('Extracted Colors:');
    console.log(Array.from(colors).sort().join(', '));
  } catch(err) {
    console.error(err);
  }
}

extractColors();
