import swaggerJsdoc from "swagger-jsdoc";

const OPTIONS: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Game Reviewer+ API",
            version: "1.0.0",
            description: "API documentation for the Game Reviewer application",
        },
        servers: [
            {
                url: "/api",
                description: "API base path",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                UserPublic: {
                    type: "object",
                    properties: {
                        accountName: { type: "string" },
                        profilePic: { type: "object", nullable: true },
                        isPrivate: { type: "boolean" },
                        userData: {
                            type: "object",
                            nullable: true, // userPrivate
                            properties: {
                                displayName: { type: "string" },
                                gender: { type: "string", nullable: true },
                                bio: { type: "string", nullable: true },
                            },
                        },
                        createdAt: { type: "string", format: "date-time", nullable: true },
                    },
                },
                AuthResponse: {
                    allOf: [
                        { $ref: "#/components/schemas/UserPublic" },
                        {
                            type: "object",
                            properties: {
                                token: { type: "string" },
                            },
                        },
                    ],
                },
                Game: {
                    type: "object",
                    properties: {
                        gameID: { type: "integer" },
                        gameName: { type: "string" },
                        metadata: { type: "object" },
                    },
                },
                Review: {
                    type: "object",
                    properties: {
                        reviewer: { type: "string" },
                        reviewed: { type: "integer" },
                        text: { type: "string" },
                        score: { type: "integer", minimum: 0, maximum: 10 },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Comment: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        commentator: { type: "string" },
                        reviewer: { type: "string" },
                        reviewed: { type: "integer" },
                        text: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Follower: {
                    type: "object",
                    properties: {
                        follows: { type: "string" },
                        followed: { type: "string" },
                        accepted: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Like: {
                    type: "object",
                    properties: {
                        liker: { type: "string" },
                        reviewer: { type: "string" },
                        reviewed: { type: "integer" },
                        value: { type: "boolean" },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        status: { type: "string", example: "error" },
                        message: { type: "string" },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.ts"],
};

const SWAGGER_SPEC = swaggerJsdoc(OPTIONS);

export default SWAGGER_SPEC;
