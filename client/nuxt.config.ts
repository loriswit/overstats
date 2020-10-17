import { config } from "dotenv"

config() // import .env before configuring Nuxt

export default {
    ssr: false,
    head: {
        titleTemplate: (title: string) =>
            (title ? title + " - " : "") + "Overstats",

        meta: [
            { charset: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1"
            },
            {
                name: "theme-color",
                content: "#000000"
            }
        ]
    },

    loading: { color: "#fff" },

    plugins: ["~/plugins/axios-init.ts", "~/plugins/store-init.ts"],

    buildModules: ["@nuxt/typescript-build", "@nuxtjs/style-resources"],
    styleResources: {
        sass: ["./assets/styles/*.sass"]
    },
    modules: [
        "@nuxtjs/axios",
        "@nuxtjs/dotenv"
    ]
}
