export interface Project { id:string; number:string; title:string; subtitle:string; year:string; category:string; tags:string[]; image:string; alt:string; color:string; summary:string; detail:string; url:string; linkLabel:string; secondaryUrl?:string; secondaryLabel?:string; artifact:string }
export interface IconOptions { size?:number; className?:string }
export interface PaletteAction { label:string; hint:string; href:string }
