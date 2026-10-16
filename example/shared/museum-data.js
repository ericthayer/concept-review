/** @type {import('./museum-types').MuseumExhibition[]} */
export const exhibitions = [
 {id:'prehistoric-journey',title:'Prehistoric Journey',eyebrow:'Deep time',category:'Earth & life',floor:'Level 3',image:'/assets/gallery.webp',alt:'Visitors discovering a fossil display at the Denver Museum of Nature & Science',intro:'Before our world, there were other worlds.',description:'Follow the changing story of life on Earth, from its earliest beginnings to dinosaurs and the rise of mammals. Look closer at fossils, then see how scientists make sense of the past.',fact:'Look for Allosaurus, Stegosaurus, and the towering Diplodocus in Prehistoric Journey.',factLabel:'A world written in fossils',notice:'Temporarily closed October 27–29 for deep cleaning.',url:'https://www.dmns.org/exhibitions/permanent-exhibitions/',color:'#cfaa7b'},
 {id:'wildlife-halls',title:'Wildlife Halls',eyebrow:'The living world',category:'Earth & life',floor:'Levels 2 & 3',image:'/assets/wildlife.webp',alt:'A moose and other specimens on display at the Denver Museum of Nature & Science',intro:'A whole planet. A closer look.',description:'Travel through meticulously composed habitats and meet the extraordinary variety of life around us. Each diorama invites you to notice the relationships between an animal and its environment.',fact:'The Wildlife Halls feature more than 90 wildlife and habitat scenes from around the world.',factLabel:'Life, in remarkable detail',notice:'Included with museum admission.',url:'https://www.dmns.org/exhibitions/permanent-exhibitions/',color:'#bbc5a8'},
 {id:'space-odyssey',title:'Space Odyssey',eyebrow:'Beyond Earth',category:'Space',floor:'Level 1',image:'/assets/space.webp',alt:'An astronaut figure and the Mars Outpost inside Space Odyssey at DMNS',intro:'The universe is not as far away as it feels.',description:'Explore space through hands-on encounters with light, motion, and the unexpected. Follow your questions beyond Earth, then continue your adventure at Gates Planetarium.',fact:'The Sensory Spacewalk in the Fantasy Spaceship contains more than 11,000 stars.',factLabel:'An invitation to look up',notice:'Gates Planetarium requires a separate timed ticket.',url:'https://www.dmns.org/exhibitions/permanent-exhibitions/',color:'#a8bdd0'}
];
export const official = Object.freeze({
 home:'https://www.dmns.org/',visit:'https://www.dmns.org/visit/',purchase:'https://www.dmns.org/purchase/',
 admission:'https://www.dmns.org/purchase/tickets/?category=general-admission',planetarium:'https://www.dmns.org/purchase/tickets/?category=planetarium',
 films:'https://www.dmns.org/purchase/tickets/?category=sturm-theater',pricing:'https://www.dmns.org/visit/pricing-and-discounts/',
 membership:'https://www.dmns.org/membership/',accessibility:'https://www.dmns.org/visit/accessibility/',
 directions:'https://www.dmns.org/visit/getting-here/',map:'https://www.dmns.org/visit/museum-maps/',
 events:'https://www.dmns.org/purchase/tickets/?category=events',school:'https://www.dmns.org/learn/',
 about:'https://www.dmns.org/about/',support:'https://www.dmns.org/support/',research:'https://www.dmns.org/science/',
 collections:'https://www.dmns.org/science/collections/',temporary:'https://www.dmns.org/exhibitions/temporary-exhibitions/'
});
export const museum = Object.freeze({name:'Denver Museum of Nature & Science',address:'2001 Colorado Blvd., Denver, CO 80205',phone:'303.370.6000',hours:'9 a.m.–5 p.m.',friday:'Until 9 p.m. most Fridays',closed:'Closed December 25 and August 26',verified:'October 16, 2026',green:'#8fc229'});
export const rates = Object.freeze({adult:27.95,youth:20.95,senior:23.95});
export function findExhibition(id) {return exhibitions.find(item=>item.id===id);}
