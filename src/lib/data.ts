import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export interface CardInfo {
  id: number;
  title: string;
  category: string;
  price: number;
  desc: string;
  image: string;
  video: string;
  isNew?: boolean;
}

export interface Novelty {
  active: boolean;
  title: string;
  subtitle: string;
  text: string;
  image: string;
  story?: string;
  storyImage?: string;
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const supabase = url && key ? createClient(url, key) : null;

export const DEFAULT_NOVELTY: Novelty = {
  active: true,
  title: 'Fireside',
  subtitle: 'COLLECTION',
  text: 'Новая партия уже в наличии.',
  image: '',
  story: '',
  storyImage: ''
};

export function useProducts(fallback: CardInfo[]) {
  const [products, setProducts] = useState<CardInfo[]>(supabase ? [] : fallback);
  const [loading, setLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('products')
      .select('*')
      .eq('published', true)
      .order('sort')
      .order('id')
      .then(({ data, error }) => {
        if (error) setProducts(fallback);
        else
          setProducts(
            (data ?? []).map((r: any) => ({
              id: r.id,
              title: r.title,
              category: r.category || 'Футболки',
              price: r.price || 0,
              desc: r.description || '',
              image: r.image || '',
              video: r.video || '',
              isNew: !!r.is_new
            }))
          );
        setLoading(false);
      });
  }, []);

  return { products, loading };
}

export function useNovelty() {
  const [n, setN] = useState<Novelty>(DEFAULT_NOVELTY);
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'novelty')
      .maybeSingle()
      .then(({ data }) => data?.value && setN({ ...DEFAULT_NOVELTY, ...data.value }));
  }, []);
  return n;
}

export async function submitLead(b: { name: string; phone: string; note?: string; source?: string }) {
  try {
    const r = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(b)
    });
    return r.ok;
  } catch {
    return false;
  }
}

export const loadCart = (): CardInfo[] => {
  try {
    return JSON.parse(localStorage.getItem('hustlify_cart') || '[]');
  } catch {
    return [];
  }
};
export const saveCart = (c: CardInfo[]) => {
  try {
    localStorage.setItem('hustlify_cart', JSON.stringify(c));
  } catch {}
};

export interface OutfitItem {
  id: number;
  kind: string; // tee | jeans | trousers | bracelet
  color: string;
  name: string;
  price: number;
  image: string;
}

export function useOutfitItems() {
  const [items, setItems] = useState<OutfitItem[]>([]);
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('outfit_items')
      .select('*')
      .eq('published', true)
      .order('sort')
      .order('id')
      .then(({ data }) =>
        setItems((data ?? []).map((r: any) => ({ id: r.id, kind: r.kind, color: r.color, name: r.name || '', price: r.price || 0, image: r.image || '' })))
      );
  }, []);
  return items;
}

/* Обложки страниц (фото/видео на весь экран), редактируются в боте */
export interface SiteSettings { homeHero: string; newHero: string; builderHero: string }
export function useSite() {
  const [s, setS] = useState<SiteSettings>({ homeHero: '', newHero: '', builderHero: '' });
  useEffect(() => {
    if (!supabase) return;
    supabase.from('settings').select('value').eq('key', 'site').maybeSingle()
      .then(({ data }) => data?.value && setS((p) => ({ ...p, ...data.value })));
  }, []);
  return s;
}

/* Галерея готовых образов */
export interface LookItem { id: number; title: string; price: number; image: string }
export function useLooks() {
  const [items, setItems] = useState<LookItem[]>([]);
  useEffect(() => {
    if (!supabase) return;
    supabase.from('outfit_looks').select('*').eq('published', true).order('sort').order('id')
      .then(({ data }) => setItems((data ?? []).map((r: any) => ({ id: r.id, title: r.title || 'Образ', price: r.price || 0, image: r.image || '' }))));
  }, []);
  return items;
}
