export interface MuseumExhibition {id:string;title:string;eyebrow:string;category:string;floor:string;image:string;alt:string;intro:string;description:string;fact:string;factLabel:string;notice:string;url:string;color:string;}
export interface VisitorCounts {adult:number;youth:number;senior:number;}
export interface MuseumPage {concept:'a'|'b';type:'home'|'visit'|'purchase'|'exhibitions'|'detail';exhibition?:MuseumExhibition;}
export function estimateAdmission(counts:VisitorCounts,member?:boolean):number;
export function getDateNotice(value:string):string;
