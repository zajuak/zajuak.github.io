import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { site,url } from '../data/site';
export async function GET(context:APIContext){
  const notes=(await getCollection('notes')).sort((a,b)=>b.data.date.valueOf()-a.data.date.valueOf());
  return rss({title:site.title,description:site.description,site:context.site!,items:notes.map(note=>({title:note.data.title,description:note.data.description,pubDate:note.data.date,link:url(`notes/${note.id}/`)})),customData:'<language>zh-cn</language>'});
}
