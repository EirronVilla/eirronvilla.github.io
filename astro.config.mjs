// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://eirronvilla.github.io',
	integrations: [mdx(), react(), sitemap()],
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'EB Garamond',
			cssVariable: '--font-editorial',
			fallbacks: ['Georgia', 'serif'],
			weights: [400, 700],
			styles: ['normal'],
		},
		{
			provider: fontProviders.google(),
			name: 'IBM Plex Mono',
			cssVariable: '--font-mono',
			fallbacks: ['Courier New', 'monospace'],
			weights: [400, 700],
			styles: ['normal'],
		},
		{
			provider: fontProviders.google(),
			name: 'Inter',
			cssVariable: '--font-ui',
			fallbacks: ['Arial', 'sans-serif'],
			weights: [400, 600, 700],
			styles: ['normal'],
		},
	],
});
