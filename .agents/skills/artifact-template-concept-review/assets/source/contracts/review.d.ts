export interface ConceptConfig {
  id: 'a'|'b'; slug: string; title: string; tagline: string;
  previewLabel: string; description: string; linkLabel: string; attributes: string[];
}
export interface ReviewConfig {
  schemaVersion: 1; id: string; revision: string;
  brand: {name:string; mark:string; subtitle:string; footer:string; website?:string};
  eyebrow:string; heading:[string,string]; introduction:string[];
  concepts:[ConceptConfig,ConceptConfig];
}
export interface ConceptBrief {
  schemaVersion:1; goal:string; audience:string; primaryAction:string;
  aesthetics:string; functionality:string[];
  references:Array<{kind:'url'|'screenshot'|'description';source:string;takeaways:string}>;
  contentSource:string; constraints:string[];
  directions:Array<{id:'a'|'b';rationale:string;tradeoffs:string;status:'draft'|'ready'|'approved'}>;
}
