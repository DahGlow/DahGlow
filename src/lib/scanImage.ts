
export const SCAN_MAX_BYTES=5*1024*1024;
export async function prepareScanImage(file:File):Promise<File> {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG or WebP image. HEIC photos must be exported as JPG.');
  if(!file.size||file.size>SCAN_MAX_BYTES)throw new Error('Choose an image under 5 MB.');
  const bitmap=await createImageBitmap(file);
  if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>40000000){bitmap.close();throw new Error('This image is too large to process. Choose a smaller photo.');}
  const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');
  canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const context=canvas.getContext('2d');
  if(!context){bitmap.close();throw new Error('Your browser cannot process this image. Try another browser.');}
  context.fillStyle='white';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('The image could not be prepared. Try another photo.')),'image/jpeg',0.88));
  return new File([blob],'scan.jpg',{type:'image/jpeg'});
}
