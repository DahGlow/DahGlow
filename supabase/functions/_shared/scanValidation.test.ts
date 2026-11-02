import { imageMime,recognitionSchema } from './scanValidation.ts';
Deno.test('validates supported image signatures instead of trusting a filename',()=>{
 if(imageMime(new Uint8Array([255,216,255]))!=='image/jpeg')throw new Error('JPEG was not recognized');
 if(imageMime(new Uint8Array([137,80,78,71,13,10,26,10]))!=='image/png')throw new Error('PNG was not recognized');
 if(imageMime(new TextEncoder().encode('RIFF0000WEBP'))!=='image/webp')throw new Error('WebP was not recognized');
 if(imageMime(new TextEncoder().encode('<svg></svg>'))!==null)throw new Error('Unsupported SVG was accepted');
 if(imageMime(new Uint8Array())!==null)throw new Error('Empty image was accepted');
});
Deno.test('rejects missing product details and unbounded recognition responses',()=>{
 if(recognitionSchema.safeParse({objects:[{name:'Invented'}]}).success)throw new Error('Invalid detection accepted');
 if(!recognitionSchema.safeParse({objects:[]}).success)throw new Error('No-product result rejected');
 const object={name:'Dress',category:'Clothing',brand:null,confidence:0.8,details:['Visible red fabric'],visibleText:'',searchTerms:['dress']};
 if(!recognitionSchema.safeParse({objects:[object]}).success)throw new Error('Valid detection rejected');
 if(recognitionSchema.safeParse({objects:Array(6).fill(object)}).success)throw new Error('More than five objects accepted');
 if(recognitionSchema.safeParse({objects:[{...object,confidence:1.5}]}).success)throw new Error('Invalid confidence accepted');
});
