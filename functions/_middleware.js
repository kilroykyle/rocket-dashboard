// Route tamagotchi subdomain to tamagotchi.html
export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // If accessing tamagotchi subdomain, serve tamagotchi.html
  if (url.hostname === 'tamagotchi.kylekilroy.com') {
    return context.env.ASSETS.fetch(new Request(url.origin + '/tamagotchi.html'));
  }
  
  // Default: continue to index.html
  return context.next();
}
