import { test, expect } from '@playwright/test';
async function boot(page, world, extra = {}) {
  await page.goto('/');
  const card=page.locator('section magical-family-clock-card').first();
  await card.waitFor();
  await card.evaluate((c,{world,extra})=>{
    c._worldMeteorSeed=137;
    c.setConfig({...c._baseConfig,demo:false,members:[],artwork:'castle',face_image:'',period_override:'night',season_override:'summer',background_transition:0,scene_motion:true,
      world:{objects:[],clouds:false,trees:false,seasonal_debris:false,water:false,waterfalls:false,stars:false,shooting_stars:false,windows:false,fireflies:false,moon:{enabled:false},...world},...extra});
  },{world,extra});
  await card.evaluate(async c=>{await c._worldPainter.ready;c._config.scene_motion=false;});
  return card;
}
test('seasonal petals and leaves are seasonal, visible, and tree crowns bend around a fixed root', async({page})=>{
  const card=await boot(page,{seasonal_debris:true,trees:true},{season_override:'spring',period_override:'day'});
  const spring=await card.evaluate(c=>{
    c._worldPainter.seek(3);
    const p=c.shadowRoot.querySelector('canvas[data-world-paint="seasonal-debris"]'),d=p.getContext('2d').getImageData(0,0,p.width,p.height).data;
    let pixels=0,red=0,green=0;
    for(let i=0;i<d.length;i+=4)if(d[i+3]>30){pixels++;red+=d[i];green+=d[i+1];}
    const tree=c.shadowRoot.querySelector('.world-tree'),a=tree.getAnimations()[0];a.pause();
    const origin=getComputedStyle(tree).transformOrigin.split(' ').map(parseFloat);
    const sample=phase=>{a.currentTime=phase*a.effect.getTiming().duration;const m=tree.getScreenCTM();return {root:new DOMPoint(...origin).matrixTransform(m),tip:new DOMPoint(origin[0],origin[1]-40).matrixTransform(m)};};
    const start=sample(0),gust=sample(.56);
    return {pixels,red,green,rootShift:Math.hypot(start.root.x-gust.root.x,start.root.y-gust.root.y),tipShift:Math.hypot(start.tip.x-gust.tip.x,start.tip.y-gust.tip.y)};
  });
  expect(spring.pixels).toBeGreaterThan(30);
  expect(spring.red).toBeGreaterThan(spring.green);
  expect(spring.rootShift).toBeLessThan(.1);
  expect(spring.tipShift).toBeGreaterThan(1);
  await card.evaluate(c=>c.setConfig({...c._baseConfig,season_override:'summer'}));
  await expect(card.locator('canvas[data-world-paint="seasonal-debris"]')).toHaveCount(0);
  await card.evaluate(c=>c.setConfig({...c._baseConfig,season_override:'autumn'}));
  await expect(card.locator('canvas[data-world-paint="seasonal-debris"]')).toHaveCount(1);
});
test('distant stars are erased beneath moving clouds and drawn before the moon and foreground', async({page})=>{
  const card=await boot(page,{clouds:true,stars:true,shooting_stars:true,fireflies:true,moon:{enabled:true,source:'manual',manual:'full_moon'}});
  const result=await card.evaluate(c=>{
    c._worldPainter.seek(2);
    const canvas=kind=>c.shadowRoot.querySelector('canvas[data-world-paint="'+kind+'"]'),
      cloud=canvas('clouds'),star=canvas('stars'),
      clouds=cloud.getContext('2d').getImageData(0,0,cloud.width,cloud.height).data,
      stars=star.getContext('2d').getImageData(0,0,star.width,star.height).data;
    let overlap=0,visible=0;
    for(let i=3;i<stars.length;i+=4){if(stars[i]>30)visible++;if(clouds[i]>25&&stars[i]>30)overlap++;}
    const moon=c.shadowRoot.querySelector('.world-moon-depth'),flies=c.shadowRoot.querySelector('.world-foreground-fireflies');
    return {overlap,visible,moonAfter:!!(star.compareDocumentPosition(moon)&Node.DOCUMENT_POSITION_FOLLOWING),foregroundAfter:!!(star.compareDocumentPosition(flies)&Node.DOCUMENT_POSITION_FOLLOWING)};
  });
  expect(result.visible).toBeGreaterThan(10);
  expect(result.overlap).toBeLessThan(3);
  expect(result.moonAfter).toBe(true);
  expect(result.foregroundAfter).toBe(true);
});
test('candle sources flicker independently and green fireflies stay near foreground vegetation', async({page})=>{
  const card=await boot(page,{windows:true,fireflies:true});
  const result=await card.evaluate(c=>{
    const canvas=c.shadowRoot.querySelector('canvas[data-world-paint="windows"]'),ctx=canvas.getContext('2d');
    const frame=t=>{c._worldPainter.seek(t);return ctx.getImageData(0,0,canvas.width,canvas.height).data;};
    const a=frame(1),b=frame(1.25),cells=new Map();
    for(let p=0;p<a.length/4;p++)if(a[p*4+3]||b[p*4+3]){
      const key=Math.floor((p%canvas.width)/16)+':'+Math.floor(p/canvas.width/16);
      cells.set(key,(cells.get(key)||0)+b[p*4+3]-a[p*4+3]);
    }
    const changes=[...cells.values()];
    c._worldPainter.seek(2);
    const flies=c.shadowRoot.querySelector('canvas[data-world-paint="fireflies"]'),f=flies.getContext('2d').getImageData(0,0,flies.width,flies.height).data;
    let red=0,green=0,minY=Infinity;
    for(let p=0;p<f.length/4;p++)if(f[p*4+3]>20){red+=f[p*4];green+=f[p*4+1];minY=Math.min(minY,90+Math.floor(p/flies.width)*384/flies.height);}
    return {brighter:changes.filter(n=>n>30).length,dimmer:changes.filter(n=>n< -30).length,red,green,minY};
  });
  expect(result.brighter).toBeGreaterThan(2);
  expect(result.dimmer).toBeGreaterThan(2);
  expect(result.green).toBeGreaterThan(result.red*1.1);
  expect(result.minY).toBeGreaterThan(380);
});
