export {};

declare global {
 interface Window {
  tidioChatApi?:{
   on:(event:'ready',callback:()=>void)=>void;
   open:()=>void;
   show:()=>void;
   hide:()=>void;
   getStatus:()=> 'online'|'offline'|null;
   messageFromVisitor:(message:string)=>void;
  };
  __dahGlowTidioReady?:boolean;
 }
 interface ImportMetaEnv {
  readonly VITE_TIDIO_PUBLIC_KEY?:string;
 }
}
