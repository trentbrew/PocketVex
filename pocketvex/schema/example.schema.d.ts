/**
 * Example Schema for PocketVex Dev Server Testing
 * This file will be watched for changes
 */
export declare const schema: {
    collections: ({
        name: string;
        type: "base";
        schema: ({
            name: string;
            type: "text";
            required: boolean;
            unique?: undefined;
        } | {
            name: string;
            type: "email";
            required: boolean;
            unique: boolean;
        } | {
            name: string;
            type: "file";
            required?: undefined;
            unique?: undefined;
        } | {
            name: string;
            type: "date";
            required: boolean;
            unique?: undefined;
        })[];
    } | {
        name: string;
        type: "base";
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
            type: "relation";
            options: {
                collectionId: string;
                values?: undefined;
            };
            required?: undefined;
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
                collectionId?: undefined;
            };
            required?: undefined;
        })[];
    } | {
        name: string;
        type: "base";
        schema: ({
            name: string;
            type: "text";
            required: boolean;
            options?: undefined;
        } | {
            name: string;
            type: "relation";
            options: {
                collectionId: string;
            };
            required?: undefined;
        } | {
            name: string;
            type: "date";
            required: boolean;
            options?: undefined;
        } | {
            name: string;
            type: "bool";
            required: boolean;
            options?: undefined;
        })[];
    })[];
};
