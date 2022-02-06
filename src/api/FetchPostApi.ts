import BackendApi, { BackendPostApi } from '@api/BackendApi';
import {
    AuthorScope,
    Category,
    FontStyle,
    FontWeight,
    ImageParagraph,
    MetadataScope,
    Paragraph,
    Post,
    RGBTagColor,
    SecondaryCategory,
    SecondaryCategoryData,
    Tag,
    TagColor,
    TagType,
    TextDecoration,
    TextFormatting,
    TextItem,
    TextParagraph,
    TopLevelCategory,
    TopLevelCategoryData,
} from '@entity/Post';
import { getApiValue, getApiValues } from '@utils/parser';
import { StorageFile, StorageFileFormat } from '@entity/StorageFile';

export default class FetchPostApi implements BackendPostApi {
    constructor(private backendApi: BackendApi) {}

    async getPostById(id: number): Promise<Post> {
        const result = await this.backendApi.getJson({ url: `/api/post/${id}` });
        return parsePost(result);
    }
}

function parsePost(parsedJson: any): Post {
    const { id, authorId, title, paragraphs, category, tags, createdAt } = getApiValues(
        parsedJson,
        {
            id: 'number',
            authorId: 'number',
            title: 'string',
            paragraphs: 'object[]',
            category: 'object',
            tags: 'object[]',
            createdAt: 'string',
        },
    );
    return new Post(
        id,
        authorId,
        title,
        paragraphs.map(parseParagraph),
        parseCategory(category),
        tags.map(parseTag),
        new Date(createdAt),
    );
}

function parseParagraph(parsedJson: any): Paragraph {
    const { type, data } = getApiValues(parsedJson, { type: 'string', data: 'object' });
    switch (type) {
        case 'Text':
            const items = getApiValue(data, 'items', 'object[]');
            return new TextParagraph(items.map(parseTextItem));
        case 'Image':
            const { file, description } = getApiValues(data, {
                file: 'object',
                description: 'string?',
            });
            return new ImageParagraph(parseStorageFile(file), description);
        default:
            throw new Error(`Unknown Paragraph type: ${type}`);
    }
}

function parseTextItem(parsedJson: any): TextItem {
    const { text, formatting } = getApiValues(parsedJson, {
        text: 'string',
        formatting: 'object',
    });
    const { fontWeight, fontStyle, textDecoration } = getApiValues(formatting, {
        fontWeight: 'string',
        fontStyle: 'string',
        textDecoration: 'string',
    });
    return new TextItem(
        text,
        new TextFormatting(
            fontWeight as FontWeight,
            fontStyle as FontStyle,
            textDecoration as TextDecoration,
        ),
    );
}

function parseStorageFile(parsedJson: any): StorageFile {
    const { id, size, format, checksum } = getApiValues(parsedJson, {
        id: 'number',
        size: 'number',
        format: 'string',
        checksum: 'string',
    });
    return new StorageFile(id, size, format as StorageFileFormat, checksum);
}

function parseCategory(parsedJson: any): Category {
    const { type: categoryType, data } = getApiValues(parsedJson, {
        type: 'string',
        data: 'object',
    });
    if (categoryType !== 'Unclassified') {
        const { id, data: rawCategoryData } = getApiValues(data, {
            id: 'number',
            data: 'object',
        });
        const { name, scope } = getApiValues(rawCategoryData, {
            name: 'string',
            scope: 'object',
        });
        switch (categoryType) {
            case 'TopLevel': {
                const categoryData = new TopLevelCategoryData(name, parseMetadataScope(scope));
                return new TopLevelCategory(id, categoryData);
            }
            case 'Secondary': {
                const { parent } = getApiValues(rawCategoryData, { parent: 'object' });
                const categoryData = new SecondaryCategoryData(
                    name,
                    parseMetadataScope(scope),
                    parseCategory(parent),
                );
                return new SecondaryCategory(id, categoryData);
            }
            default:
                throw new Error(`Unknown CategoryData type: ${categoryType}`);
        }
    } else {
        return 'Unclassified';
    }
}

function parseMetadataScope(parsedJson: any): MetadataScope {
    const { type, data } = getApiValues(parsedJson, { type: 'string', data: 'object' });
    switch (type) {
        case 'Global':
            return 'Global';
        case 'Author':
            const { authorId } = getApiValues(data, { authorId: 'number' });
            return new AuthorScope(authorId);
        default:
            throw new Error(`Unknown MetadataScope type: ${type}`);
    }
}

function parseTag(parsedJson: any): Tag {
    const { type, name, category, color, scope } = getApiValues(parsedJson, {
        type: 'object',
        name: 'string',
        category: 'object',
        color: 'object',
        scope: 'object',
    });
    return new Tag(
        parseTagType(type),
        name,
        parseCategory(category),
        parseTagColor(color),
        parseMetadataScope(scope),
    );
}

function parseTagType(parsedJson: any): TagType {
    const { name, category, scope } = getApiValues(parsedJson, {
        name: 'string',
        category: 'object',
        scope: 'object',
    });
    return new TagType(name, parseCategory(category), parseMetadataScope(scope));
}

function parseTagColor(parsedJson: any): TagColor {
    const { type, data } = getApiValues(parsedJson, { type: 'string', data: 'object' });
    switch (type) {
        case 'None':
            return 'None';
        case 'RGB':
            const { r, g, b } = getApiValues(data, { r: 'number', g: 'number', b: 'number' });
            return new RGBTagColor(r, g, b);
        default:
            throw new Error(`Unknown TagColor type: ${type}`);
    }
}
