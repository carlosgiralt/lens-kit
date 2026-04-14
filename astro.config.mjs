// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { fileURLToPath, URL } from "node:url";

// https://astro.build/config
export default defineConfig({
	site: "https://carlosgiralt.github.io",
	base: "/",
	// Use docs-dist/ to avoid colliding with the lib build output in dist/
	outDir: "./docs-dist",
	integrations: [
		starlight({
			title: "Lens Kit",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/carlosgiralt/lens-kit",
				},
			],
			sidebar: [
				{
					label: "Guides",
					items: [{ label: "Getting Started", slug: "guides/example" }],
				},
				{
					label: "Reference",
					items: [
						{ label: "CSS Custom Properties", slug: "reference/example" },
					],
				},
				{
					label: "Components",
					autogenerate: { directory: "components" },
				},
			],
		}),
	],
	vite: {
		resolve: {
			alias: {
				"@ui": fileURLToPath(new URL("./src/ui", import.meta.url)),
			},
		},
	},
});
