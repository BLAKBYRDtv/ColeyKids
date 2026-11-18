/* Baby Babay: Shopify Storefront bridge. Shared by every site (Spin, Kith, ...).
   Products, sizes, prices and stock come from Shopify. Checkout happens on Shopify. */
(function(){
  var CFG={domain:'kbuwer-qp.myshopify.com',token:'0789ce176a09e4245596f81cecf5b9cf',api:'2025-07'};
  var ENDPOINT='https://'+CFG.domain+'/api/'+CFG.api+'/graphql.json';
  var byTitle={},ready=false,waiters=[];

  function gql(query,variables){
    return fetch(ENDPOINT,{method:'POST',
      headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':CFG.token},
      body:JSON.stringify({query:query,variables:variables||{}})})
    .then(function(r){if(!r.ok)throw new Error('Shopify '+r.status);return r.json()})
    .then(function(j){if(j.errors&&j.errors.length)throw new Error(j.errors[0].message);return j.data});
  }
  function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}

  var PRODUCTS_Q='query{products(first:100){nodes{id title handle availableForSale variants(first:30){nodes{id title sku availableForSale price{amount currencyCode}}}}}}';
  function load(){
    return gql(PRODUCTS_Q).then(function(d){
      byTitle={};
      ((d.products&&d.products.nodes)||[]).forEach(function(p){
        byTitle[norm(p.title)]={id:p.id,title:p.title,handle:p.handle,available:p.availableForSale,
          variants:p.variants.nodes.map(function(v){return{id:v.id,title:v.title,sku:v.sku,
            price:parseFloat(v.price.amount),available:v.availableForSale}})};
      });
      ready=Object.keys(byTitle).length>0;
      waiters.forEach(function(f){try{f(ready)}catch(e){}});
      return ready;
    }).catch(function(e){ready=false;try{console.warn('[BBShop]',e.message)}catch(_){}return false});
  }

  function product(name){return byTitle[norm(name)]||null}
  /* a one-variant product has a variant titled "Default Title": nothing to pick */
  function needsPick(p){return !!p&&p.variants.length>1}

  /* Which Shopify variant does a bag entry mean? */
  function pickVariant(entry){
    var name=entry.name||'',p=product(name),m;
    if(!p&&(m=/^(starter|classic|deluxe)\s+crate$/i.exec(name))){
      p=product('Build Your Own Crate');
      if(p){var t=m[1].toLowerCase();
        return{p:p,v:p.variants.filter(function(v){return v.title.toLowerCase().indexOf(t)===0})[0]||null}}
    }
    if(!p)return{p:null,v:null};
    if(!needsPick(p))return{p:p,v:p.variants[0]};
    var want=entry.variantTitle,v=null;
    if(want)v=p.variants.filter(function(x){return x.title===want})[0]||null;
    return{p:p,v:v};
  }

  var CART_M='mutation($input:CartInput!){cartCreate(input:$input){cart{checkoutUrl} userErrors{message}}}';
  function checkout(bag){
    if(!ready)return Promise.resolve({error:'Checkout opens at launch.'});
    var lines={},order=[],problem=null;
    bag.forEach(function(b){
      if(problem)return;
      var r=pickVariant(b);
      if(!r.p){problem='"'+b.name+'" is not available online yet.';return}
      if(!r.v){problem='Please remove and re-add "'+b.name+'" and pick a size.';return}
      if(!r.v.available){problem='"'+b.name+'" ('+r.v.title+') is sold out.';return}
      var note=(b.note&&/^(starter|classic|deluxe)\s+crate$/i.test(b.name))?b.note:'';
      var k=r.v.id+'|'+note;
      if(lines[k])lines[k].quantity++;
      else{lines[k]={merchandiseId:r.v.id,quantity:1};
        if(note)lines[k].attributes=[{key:'Crate contents',value:note}];order.push(k)}
    });
    if(problem)return Promise.resolve({error:problem});
    if(!order.length)return Promise.resolve({error:'Your bag is empty.'});
    return gql(CART_M,{input:{lines:order.map(function(k){return lines[k]})}}).then(function(d){
      var c=d.cartCreate;
      if(c.userErrors&&c.userErrors.length)return{error:c.userErrors[0].message};
      return{url:c.cart.checkoutUrl};
    }).catch(function(e){return{error:'Could not reach checkout. Please try again.'}});
  }

  window.BBShop={
    config:CFG,load:load,product:product,needsPick:needsPick,pickVariant:pickVariant,checkout:checkout,
    isReady:function(){return ready},
    onReady:function(f){waiters.push(f);if(ready)try{f(true)}catch(e){}}
  };
  load();
})();
