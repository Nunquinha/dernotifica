'use strict';
const DERLocation={
 valid(point,reference=Date.now()){return !!point&&Number.isFinite(point.lat)&&Math.abs(point.lat)<=90&&Number.isFinite(point.lng)&&Math.abs(point.lng)<=180&&Number.isFinite(point.accuracy)&&point.accuracy>=0&&point.accuracy<=30&&Number.isFinite(Date.parse(point.at))&&reference-Date.parse(point.at)<=5*60000&&Date.parse(point.at)-reference<=60000},
 maps(point){if(!point||!Number.isFinite(point.lat)||!Number.isFinite(point.lng))throw Error('Coordenadas indisponíveis.');return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(point.lat+','+point.lng)},
 capture({geo=navigator.geolocation,onProgress=()=>{},timeoutMs=30000}={}){return new Promise((resolve,reject)=>{
 if(!geo?.watchPosition)return reject(Error('O aparelho não disponibilizou a localização.'));let best=null,watchId,finished=false;
 const stop=()=>{clearTimeout(timer);if(watchId!==undefined)geo.clearWatch(watchId)};
 const finish=error=>{if(finished)return;finished=true;stop();if(!error&&DERLocation.valid(best))resolve(best);else reject(error||Error('O GPS não alcançou precisão de até 30 metros. Vá para um local aberto e tente novamente.'))};
 const timer=setTimeout(()=>finish(),timeoutMs);
 watchId=geo.watchPosition(position=>{if(finished)return;const p={lat:position.coords.latitude,lng:position.coords.longitude,accuracy:position.coords.accuracy,at:new Date(position.timestamp||Date.now()).toISOString(),source:'geolocation'};if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||!Number.isFinite(p.accuracy)||Date.now()-Date.parse(p.at)>5*60000)return;if(!best||p.accuracy<best.accuracy)best=p;onProgress(best);if(best.accuracy<=12&&DERLocation.valid(best))finish()},error=>{if(error.code===1)finish(Error('Permita o acesso à localização precisa nas configurações do aparelho e do navegador.'));else if(error.code===2)onProgress(best,{message:'Sinal de localização indisponível. Aguardando nova leitura…'});else if(best&&DERLocation.valid(best))finish()},{enableHighAccuracy:true,maximumAge:0,timeout:20000});
 })}
};
