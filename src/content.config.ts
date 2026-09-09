import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			shaderGradient: z.object({
				animate: z.enum(['on', 'off']).optional(),
				brightness: z.number().optional(),
				cAzimuthAngle: z.number().optional(), cDistance: z.number().optional(),
				cPolarAngle: z.number().optional(), cameraZoom: z.number().optional(),
				color1: z.string().optional(), color2: z.string().optional(), color3: z.string().optional(),
				envPreset: z.enum(['city', 'dawn', 'lobby']).optional(), fov: z.number().optional(),
				grain: z.enum(['on', 'off']).optional(), lightType: z.enum(['3d', 'env']).optional(),
				pixelDensity: z.number().optional(), positionX: z.number().optional(),
				positionY: z.number().optional(), positionZ: z.number().optional(),
				range: z.enum(['enabled', 'disabled']).optional(), rangeEnd: z.number().optional(),
				rangeStart: z.number().optional(), reflection: z.number().optional(),
				rotationX: z.number().optional(), rotationY: z.number().optional(),
				rotationZ: z.number().optional(), shader: z.string().optional(),
				type: z.enum(['plane', 'sphere', 'waterPlane']).optional(),
				uAmplitude: z.number().optional(), uDensity: z.number().optional(),
				uFrequency: z.number().optional(), uSpeed: z.number().optional(),
				uStrength: z.number().optional(), uTime: z.number().optional(),
				wireframe: z.boolean().optional(),
			}).optional(),
		}),
});

export const collections = { blog };
