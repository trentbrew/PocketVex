/**
 * Main Schema for PocketVex Dev Server Testing
 * This file will be watched for changes
 */
export declare const schema: {
    collections: ({
        name: string;
        type: "auth";
        rules: {
            list: string;
            view: string;
            create: string;
            update: string;
            delete: string;
        };
        schema: ({
            name: string;
            type: "text";
            required: boolean;
        } | {
            name: string;
            type: "file";
            required?: undefined;
        } | {
            name: string;
            type: "editor";
            required: boolean;
        } | {
            name: string;
            type: "select";
            required: boolean;
        } | {
            name: string;
            type: "url";
            required: boolean;
        } | {
            name: string;
            type: "number";
            required: boolean;
        })[];
    } | {
        name: string;
        type: "base";
        rules: {
            list: string;
            view: string;
            create: string;
            update: string;
            delete: string;
        };
        schema: ({
            name: string;
            type: "text";
            required: boolean;
            options?: undefined;
        } | {
            name: string;
            type: "editor";
            required: boolean;
            options?: undefined;
        } | {
            name: string;
            type: "bool";
            required: boolean;
            options?: undefined;
        } | {
            name: string;
            type: "select";
            options: {
                values: string[];
                maxSelect: number;
            };
            required?: undefined;
        })[];
    } | {
        name: string;
        type: "base";
        rules: {
            list: string;
            view: string;
            create: string;
            update: string;
            delete: string;
        };
        schema: ({
            name: string;
            type: "text";
            required: boolean;
            unique?: undefined;
        } | {
            name: string;
            type: "text";
            required: boolean;
            unique: boolean;
        } | {
            name: string;
            type: "text";
            required?: undefined;
            unique?: undefined;
        } | {
            name: string;
            type: "editor";
            required?: undefined;
            unique?: undefined;
        } | {
            name: string;
            type: "select";
            required?: undefined;
            unique?: undefined;
        } | {
            name: string;
            type: "file";
            required?: undefined;
            unique?: undefined;
        } | {
            name: string;
            type: "relation";
            required?: undefined;
            unique?: undefined;
        } | {
            name: string;
            type: "number";
            required?: undefined;
            unique?: undefined;
        })[];
    } | {
        name: string;
        type: "base";
        rules: {
            list: string;
            view: string;
            create: string;
            update: string;
            delete: string;
        };
        schema: ({
            name: string;
            type: "text";
            required: boolean;
        } | {
            name: string;
            type: "text";
            required?: undefined;
        } | {
            name: string;
            type: "relation";
            required: boolean;
        } | {
            name: string;
            type: "number";
            required: boolean;
        } | {
            name: string;
            type: "bool";
            required?: undefined;
        })[];
    } | {
        name: string;
        type: "base";
        rules: {
            list: string;
            view: string;
            create: string;
            update: string;
            delete: string;
        };
        schema: ({
            name: string;
            type: "text";
            required: boolean;
        } | {
            name: string;
            type: "editor";
            required?: undefined;
        } | {
            name: string;
            type: "relation";
            required: boolean;
        } | {
            name: string;
            type: "number";
            required: boolean;
        } | {
            name: string;
            type: "number";
            required?: undefined;
        } | {
            name: string;
            type: "bool";
            required?: undefined;
        })[];
    })[];
};
