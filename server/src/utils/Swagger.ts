import { profile } from "node:console";
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
                        avatar: { type: "string", nullable: true },
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
                UserMe: {
                    type: "object",
                    properties: {
                        accountName: { type: "string" },
                        email: { type: "string", format: "email" },
                        avatar: { type: "string", nullable: true },
                        isPrivate: { type: "boolean" },
                        userData: {
                            type: "object",
                            properties: {
                                displayName: { type: "string" },
                                gender: { type: "string", nullable: true },
                                bio: { type: "string", nullable: true },
                            },
                            required: ["displayName"],
                        },
                        createdAt: { type: "string", format: "date-time" },
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
                        id: { type: "number" },
                        artworks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    alpha_channel: { type: "boolean" },
                                    animated: { type: "boolean" },
                                    height: { type: "number" },
                                    url: { type: "string" },
                                    width: { type: "number" },
                                    artwork_type: {
                                        type: "object",
                                        properties: {
                                            id: { type: "number" },
                                            name: { type: "string" },
                                        },
                                        additionalProperties: true,
                                    },
                                },
                                additionalProperties: true,
                            },
                        },
                        first_release_date: { type: "number" },
                        game_modes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "number" },
                                    name: { type: "string" },
                                },
                                additionalProperties: true,
                            },
                        },
                        genres: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "number" },
                                    name: { type: "string" },
                                },
                                additionalProperties: true,
                            },
                        },
                        involved_companies: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {},
                                additionalProperties: true,
                            },
                        },
                        multiplayer_modes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    campaigncoop: { type: "boolean" },
                                    dropin: { type: "boolean" },
                                    lancoop: { type: "boolean" },
                                    offlinecoop: { type: "boolean" },
                                    onlinecoop: { type: "boolean" },
                                    splitscreen: { type: "boolean" },
                                },
                                additionalProperties: true,
                            },
                        },
                        name: { type: "string" },
                        platforms: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "number" },
                                    name: { type: "string" },
                                    slug: { type: "string" },
                                },
                            },
                        },
                        player_perspectives: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "number" },
                                    name: { type: "string" },
                                    slug: { type: "string" },
                                },
                            },
                        },
                        screenshots: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    height: { type: "number" },
                                    url: { type: "string" },
                                    width: { type: "number" },
                                },
                                additionalProperties: true,
                            },
                        },
                        slug: { type: "string" },
                        storyline: { type: "string" },
                        themes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "number" },
                                    name: { type: "string" },
                                    slug: { type: "string" },
                                },
                            },
                        },
                        videos: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "number" },
                                    name: { type: "string" },
                                    video_id: { type: "string" },
                                },
                            },
                        },
                        websites: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "number" },
                                    trusted: { type: "boolean" },
                                    url: { type: "string" },
                                    type: {
                                        type: "object",
                                        properties: {
                                            id: { type: "number" },
                                            type: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                        game_type: {
                            type: "object",
                            properties: {
                                id: { type: "number" },
                                type: { type: "string" },
                            },
                            additionalProperties: true,
                        },
                    },
                },
                GameCover: {
                    type: "object",
                    properties: {
                        id: { type: "number" },
                        name: { type: "string" },
                        cover: {
                            type: "object",
                            properties: {
                                alpha_channel: { type: "boolean" },
                                animated: { type: "boolean" },
                                height: { type: "number" },
                                url: { type: "string" },
                                width: { type: "number" },
                                artwork_type: {
                                    type: "object",
                                    properties: {
                                        id: { type: "number" },
                                        name: { type: "string" },
                                    },
                                    additionalProperties: true,
                                },
                            },
                            additionalProperties: true,
                        },
                    },
                },
                Review: {
                    type: "object",
                    properties: {
                        reviewer: { type: "string" },
                        reviewed: { type: "integer" },
                        text: { type: "string" },
                        score: { type: "integer", minimum: 0, maximum: 10 },
                        hoursPlayed: { type: "integer", minimum: 0, nullable: true },
                        platforms: {
                            type: "array",
                            items: { type: "string" },
                        },
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
                FollowerPublic: {
                    type: "object",
                    properties: {
                        follows: { type: "string" },
                        followed: { type: "string" },
                        accepted: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                        followsUser: {
                            type: "object",
                            nullable: true,
                            properties: {
                                avatar: { type: "string", nullable: true },
                            },
                        },
                        followedUser: {
                            type: "object",
                            nullable: true,
                            properties: {
                                avatar: { type: "string", nullable: true },
                            },
                        },
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
