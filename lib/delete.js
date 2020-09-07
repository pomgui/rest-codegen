module.exports = {
    beforeAll: "clean",
    dir: "/mySystem",
    projects: {
        server01: {
            type: "express",
            dir: "./server",
            model: {
                dir: "openapi/model",
                suffix: "Dto"
            },
            params: {
                dir: "openapi/params",
                beforeAll: "none",
                overwrite: true,
                prefix: "Prm"
            },
            services: {
                dir: "openapi/service",
                suffix: "Api"
            }
        },
        clientAngular: {
            type: "angular",
            dir: "client",
            model: {
                dir: "openapi/model",
                suffix: "Dto"
            },
            params: {
                dir: "openapi/params",
                beforeAll: "none",
                overwrite: true,
                prefix: "Prm"
            },
            services: {
                dir: "openapi/service",
                suffix: "Api"
            }
        }
    }
}