import type { Product,RawProduct } from '@/types/shop';

export interface DetectedProduct { name:string;category:string;brand:string|null;confidence:number;details:string[];visibleText:string;searchTerms:string[]; }
export interface Recognition { objects:DetectedProduct[]; }
export interface ScanMatch { id:string;objectIndex:number;score:number;reason:string;matchType:'similar';product:Product; }
export interface ScanResponse { detection:Recognition;matches:(Omit<ScanMatch,'product'>&{product:RawProduct})[];evaluated:number;candidates:number;limited:boolean;service:string;source:string; }
export interface ScanResult extends Omit<ScanResponse,'matches'> { matches:ScanMatch[]; }
export type ScanStage='idle'|'preparing'|'recognizing'|'matching'|'done'|'error';
