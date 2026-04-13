// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
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
});
