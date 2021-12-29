import { StorageFile } from '@entity/StorageFile';

export class Post {
    constructor(
        public readonly id: number,
        public readonly title: string,
        public readonly paragraphs: Array<Paragraph>,
        public readonly createdAt: Date,
        public readonly authorId: number,
    ) {}
}

export class TextParagraph {
    constructor(public readonly items: Array<TextItem>) {}
}

export class ImageParagraph {
    constructor(
        public readonly file: StorageFile,
        public readonly description: string | null,
    ) {}
}

export type Paragraph = TextParagraph | ImageParagraph;

export class TextItem {
    constructor(public readonly text: string, public readonly formatting: TextFormatting) {}
}

export type FontWeight = 'NORMAL' | 'BOLD';
export type FontStyle = 'NORMAL' | 'ITALIC';
export type TextDecoration = 'NONE' | 'UNDERLINE';

export class TextFormatting {
    constructor(
        public readonly fontWeight: FontWeight,
        public readonly fontStyle: FontStyle,
        public readonly textDecoration: TextDecoration,
    ) {}
}
