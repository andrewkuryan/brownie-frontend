import BackendApi, { BackendPostApi } from '@api/BackendApi';
import {
    FontStyle,
    FontWeight,
    ImageParagraph,
    Paragraph,
    Post,
    TextDecoration,
    TextFormatting,
    TextItem,
    TextParagraph,
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
    const { id, title, paragraphs, createdAt, authorId } = getApiValues(parsedJson, {
        id: 'number',
        title: 'string',
        paragraphs: 'object[]',
        createdAt: 'string',
        authorId: 'number',
    });
    return new Post(id, title, paragraphs.map(parseParagraph), new Date(createdAt), authorId);
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
